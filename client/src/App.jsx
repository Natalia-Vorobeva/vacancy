import { useState, useEffect, useCallback, useRef } from 'react';
import SearchForm from './components/SearchForm';
import VacancyList from './components/VacancyList';
import FavoritesList from './components/FavoritesList';
import VacancyModal from './components/VacancyModal';
import Loader from './components/Loader';

function App() {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const abortControllers = useRef([]);

  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    query: 'React разработчик',
    salaryOnly: false,
    remoteOnly: true,
    excludeExperienceAbove3: true,
    days: 3,
    excludeAgency: true,
  });

  const [loadingSkills, setLoadingSkills] = useState({});
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [hidden, setHidden] = useState(() => {
    const saved = localStorage.getItem('hidden');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedVacancyId, setSelectedVacancyId] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [ratings, setRatings] = useState(() => {
    const saved = localStorage.getItem('ratings');
    return saved ? JSON.parse(saved) : {};
  });
  const [skillsCache, setSkillsCache] = useState(() => {
    const saved = localStorage.getItem('skillsCache');
    return saved ? JSON.parse(saved) : {};
  });
  const [applied, setApplied] = useState(() => {
    const saved = localStorage.getItem('applied');
    return saved ? JSON.parse(saved) : [];
  });
  const [savedQueries, setSavedQueries] = useState(() => {
    const saved = localStorage.getItem('savedQueries');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (!filters.query && savedQueries.length === 0) {
      setFilters(prev => ({ ...prev, query: 'программист' }));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('applied', JSON.stringify(applied));
  }, [applied]);
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);
  useEffect(() => {
    localStorage.setItem('hidden', JSON.stringify(hidden));
  }, [hidden]);
  useEffect(() => {
    localStorage.setItem('ratings', JSON.stringify(ratings));
  }, [ratings]);
  useEffect(() => {
    localStorage.setItem('skillsCache', JSON.stringify(skillsCache));
  }, [skillsCache]);
  useEffect(() => {
    localStorage.setItem('savedQueries', JSON.stringify(savedQueries));
  }, [savedQueries]);

  useEffect(() => {
    return () => {
      abortControllers.current.forEach(ctrl => ctrl.abort());
    };
  }, []);

  const addSavedQuery = (query) => {
    if (query.trim() && !savedQueries.includes(query.trim())) {
      setSavedQueries([...savedQueries, query.trim()]);
    }
  };
  const removeSavedQuery = (query) => {
    setSavedQueries(savedQueries.filter(q => q !== query));
  };

  const handleAppliedToggle = (vacancyId) => {
    setApplied(prev =>
      prev.includes(vacancyId)
        ? prev.filter(id => id !== vacancyId)
        : [...prev, vacancyId]
    );
  };

  const loadPage = useCallback(async (pageNum, append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const params = new URLSearchParams({
        query: filters.query,
        salary_only: filters.salaryOnly,
        remote_only: filters.remoteOnly,
        exclude_experience_above_3: filters.excludeExperienceAbove3,
        days: filters.days,
        page: pageNum,
        exclude_agency: filters.excludeAgency,
      });
      const res = await fetch(`${API_URL}/api/vacancies?${params}`);
      const data = await res.json();

      if (!Array.isArray(data)) {
        console.error('API вернул не массив:', data);
        setVacancies([]);
        setHasMore(false);
        return;
      }

      if (append) {
        setVacancies(prev => [...prev, ...data]);
      } else {
        setVacancies(data);
      }

      setHasMore(data.length === 100);
    } catch (err) {
      console.error('Ошибка загрузки:', err);
    } finally {
      if (append) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, [filters]);

  useEffect(() => {
    setPage(0);
    setHasMore(true);
    loadPage(0, false);
    setSkillsCache({});
    localStorage.removeItem('skillsCache');
    setShowFavorites(false);
  }, [filters, loadPage]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    await loadPage(nextPage, true);
  };

  const loadSkillsForVacancy = useCallback(async (vacancy) => {
    const controller = new AbortController();
    abortControllers.current.push(controller);

    if (vacancy.all_skills) {
      abortControllers.current = abortControllers.current.filter(c => c !== controller);
      return;
    }
    if (loadingSkills[vacancy.id]) {
      abortControllers.current = abortControllers.current.filter(c => c !== controller);
      return;
    }
    if (skillsCache[vacancy.id]) {
      setVacancies(prev =>
        prev.map(v =>
          v.id === vacancy.id ? { ...v, all_skills: skillsCache[vacancy.id] } : v
        )
      );
      abortControllers.current = abortControllers.current.filter(c => c !== controller);
      return;
    }

    setLoadingSkills(prev => ({ ...prev, [vacancy.id]: true }));
    try {
      const res = await fetch(`${API_URL}/api/vacancy/${vacancy.id}`, { signal: controller.signal });
      const details = await res.json();
      if (!details.error) {
        const skills = details.all_skills || [];
        setSkillsCache(prev => ({ ...prev, [vacancy.id]: skills }));
        setVacancies(prev =>
          prev.map(v =>
            v.id === vacancy.id ? { ...v, all_skills: skills } : v
          )
        );
      } else {
        console.warn(`Ошибка при получении навыков для ${vacancy.id}: ${details.error}`);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error(`Ошибка сети для вакансии ${vacancy.id}`, err);
      }
    } finally {
      setLoadingSkills(prev => ({ ...prev, [vacancy.id]: false }));
      abortControllers.current = abortControllers.current.filter(c => c !== controller);
    }
  }, [skillsCache, loadingSkills]);

  useEffect(() => {
    const visible = vacancies.filter(v => !hidden.includes(v.id));
    const toLoad = visible
      .filter(v => !v.all_skills && !loadingSkills[v.id])
      .slice(0, 20);

    if (toLoad.length === 0) return;

    let i = 0;
    let timerId = null;

    const loadNext = () => {
      if (i < toLoad.length) {
        loadSkillsForVacancy(toLoad[i]);
        i++;
        timerId = setTimeout(loadNext, 200);
      }
    };
    loadNext();

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [vacancies, hidden, loadingSkills, loadSkillsForVacancy]);

  const handleAddToFavorites = (vacancy) => {
    if (!favorites.some(fav => fav.id === vacancy.id)) {
      setFavorites([...favorites, vacancy]);
    }
  };
  const handleRemoveFromFavorites = (vacancyId) => {
    setFavorites(favorites.filter(fav => fav.id !== vacancyId));
  };
  const handleHideVacancy = (vacancyId) => {
    if (!hidden.includes(vacancyId)) {
      setHidden([...hidden, vacancyId]);
    }
  };
  const setRating = (vacancyId, rating) => {
    setRatings(prev => ({ ...prev, [vacancyId]: rating }));
  };

  const visibleVacancies = vacancies.filter(vac => !hidden.includes(vac.id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-200 to-slate-300 py-8 px-4">
      <div className="max-w-7xl mx-auto relative">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-center mb-8 relative inline-block w-full text-white">
            ПОИСК РАБОТЫ
            <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-34 h-1 bg-white rounded-full"></span>
          </h1>

          <SearchForm
            filters={filters}
            setFilters={setFilters}
            onSearch={() => { }}
            savedQueries={savedQueries}
            addSavedQuery={addSavedQuery}
            removeSavedQuery={removeSavedQuery}
          />
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:hidden mb-4 sticky top-0 z-10">
              <button
                onClick={() => setShowFavorites(!showFavorites)}
                className="w-full bg-indigo-400 text-white py-2 rounded focus:outline-none"
              >
                {showFavorites ? 'Вернуться к списку' : 'Показать избранное'}
              </button>
            </div>
            <div className="lg:w-2/3">
              {showFavorites ? (
                <FavoritesList
                  favorites={favorites}
                  applied={applied}
                  onAppliedToggle={handleAppliedToggle}
                  onRemoveFromFavorites={handleRemoveFromFavorites}
                  onSelectVacancy={setSelectedVacancyId}
                  ratings={ratings}
                />
              ) : (
                <>
                  <VacancyList
                    vacancies={visibleVacancies}
                    loading={loading}
                    loadingSkills={loadingSkills}
                    favorites={favorites}
                    ratings={ratings}
                    setRating={setRating}
                    onAddToFavorites={handleAddToFavorites}
                    onRemoveFromFavorites={handleRemoveFromFavorites}
                    onHide={handleHideVacancy}
                    onSelectVacancy={setSelectedVacancyId}
                    applied={applied}
                    onAppliedToggle={handleAppliedToggle}
                  />
                  {hasMore && !loading && (
                    <div className="text-center mt-4">
                      {loadingMore ? (
                        <Loader />
                      ) : (
                        <button
                          onClick={loadMore}
                          className="bg-sky-500 text-white px-4 py-2 rounded focus:outline-none"
                        >
                          Загрузить ещё
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="lg:w-1/3 hidden lg:block">
              <FavoritesList
                favorites={favorites}
                applied={applied}
                onAppliedToggle={handleAppliedToggle}
                onRemoveFromFavorites={handleRemoveFromFavorites}
                onSelectVacancy={setSelectedVacancyId}
                ratings={ratings}
              />
            </div>
          </div>

        </div>

        <div className="fixed bottom-[3%] right-0 w-1/3 h-1/3 pointer-events-none hidden lg:block z-0">
          <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0 L200 0 M0 20 L200 20 M0 40 L200 40 M0 60 L200 60 M0 80 L200 80 M0 100 L200 100 M0 120 L200 120 M0 140 L200 140 M0 160 L200 160 M0 180 L200 180 M0 200 L200 200 M0 0 L0 200 M20 0 L20 200 M40 0 L40 200 M60 0 L60 200 M80 0 L80 200 M100 0 L100 200 M120 0 L120 200 M140 0 L140 200 M160 0 L160 200 M180 0 L180 200 M200 0 L200 200" stroke="#94a3b8" strokeWidth="0.5" opacity="0.3" />
          </svg>
        </div>
      </div>
      <VacancyModal
        vacancyId={selectedVacancyId}
        onClose={() => setSelectedVacancyId(null)}
        applied={applied}
        onAppliedToggle={handleAppliedToggle}
        favorites={favorites}
        onAddToFavorites={handleAddToFavorites}
        onRemoveFromFavorites={handleRemoveFromFavorites}
      />
    </div>
  );
}

export default App;