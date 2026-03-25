import { useState, useEffect, useCallback, useRef } from 'react';
import SearchForm from './components/SearchForm';
import VacancyList from './components/VacancyList';
import FavoritesList from './components/FavoritesList';
import VacancyModal from './components/VacancyModal';
import Loader from './components/Loader';

function App() {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const searchFormRef = useRef(null);

  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [showFavorites, setShowFavorites] = useState(false);

  const [filters, setFilters] = useState(() => {
    const saved = localStorage.getItem('filters');
    return saved ? JSON.parse(saved) : {
      salaryOnly: false,
      remoteOnly: true,
      excludeExperienceAbove3: true,
      days: 3,
      excludeAgency: true,
    };
  });

  const [query, setQuery] = useState(() => {
    return localStorage.getItem('query') || 'React разработчик';
  });
  const [excludeTitleWords, setExcludeTitleWords] = useState(() => {
    return localStorage.getItem('excludeTitleWords') || '';
  });

  const [savedQueries, setSavedQueries] = useState(() => {
    const saved = localStorage.getItem('savedQueries');
    return saved ? JSON.parse(saved) : [];
  });

  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [hidden, setHidden] = useState(() => {
    const saved = localStorage.getItem('hidden');
    return saved ? JSON.parse(saved) : [];
  });
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
  const [loadingSkills, setLoadingSkills] = useState({});
  const [selectedVacancyId, setSelectedVacancyId] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    localStorage.setItem('filters', JSON.stringify(filters));
  }, [filters]);
  useEffect(() => {
    localStorage.setItem('query', query);
  }, [query]);
  useEffect(() => {
    localStorage.setItem('excludeTitleWords', excludeTitleWords);
  }, [excludeTitleWords]);
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
    localStorage.setItem('applied', JSON.stringify(applied));
  }, [applied]);
  useEffect(() => {
    localStorage.setItem('savedQueries', JSON.stringify(savedQueries));
  }, [savedQueries]);

  useEffect(() => {
    const savedScroll = localStorage.getItem('scrollPosition');
    if (savedScroll) {
      window.scrollTo(0, parseInt(savedScroll));
      localStorage.removeItem('scrollPosition');
    }
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.setItem('scrollPosition', window.scrollY);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (selectedVacancyId) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedVacancyId]);

  const scrollToSearch = () => {
    if (searchFormRef.current) {
      searchFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const addSavedQuery = (newQuery) => {
    if (newQuery.trim() && !savedQueries.includes(newQuery.trim())) {
      setSavedQueries([...savedQueries, newQuery.trim()]);
    }
  };
  const removeSavedQuery = (queryToRemove) => {
    setSavedQueries(savedQueries.filter(q => q !== queryToRemove));
  };

  const loadPage = useCallback(async (pageNum, append = false, overrideQuery = query, overrideExclude = excludeTitleWords) => {
    if (append) setLoadingMore(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams({
        query: overrideQuery,
        salary_only: filters.salaryOnly,
        remote_only: filters.remoteOnly,
        exclude_experience_above_3: filters.excludeExperienceAbove3,
        days: filters.days,
        page: pageNum,
        exclude_agency: filters.excludeAgency,
        exclude_title_words: overrideExclude,
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
      if (append) setLoadingMore(false);
      else setLoading(false);
    }
  }, [filters, query, excludeTitleWords]);

  useEffect(() => {
    setPage(0);
    setHasMore(true);
    loadPage(0, false, query, excludeTitleWords);
    setSkillsCache({});
    localStorage.removeItem('skillsCache');
    setShowFavorites(false);
  }, [filters]);

 const handleSearch = async (newQuery, newExcludeWords) => {
  setQuery(newQuery);
  setExcludeTitleWords(newExcludeWords);
  setPage(0);
  setHasMore(true);
  await loadPage(0, false, newQuery, newExcludeWords);
  setShowFavorites(false);

  setTimeout(() => {
    const target = document.querySelector('.vacancy-card-image') || document.querySelector('.no-results-message');
    if (target) {
      const elementRect = target.getBoundingClientRect();
      const absoluteElementTop = elementRect.top + window.pageYOffset;
      const stickyButton = document.querySelector('.lg\\:hidden.sticky.top-0');
      const offset = stickyButton ? stickyButton.getBoundingClientRect().height + 16 : 16;
      window.scrollTo({
        top: absoluteElementTop - offset,
        behavior: 'smooth'
      });
    }
  }, 100);
};

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    await loadPage(nextPage, true);
  };

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

  const handleAppliedToggle = (vacancyId) => {
    setApplied(prev =>
      prev.includes(vacancyId)
        ? prev.filter(id => id !== vacancyId)
        : [...prev, vacancyId]
    );
  };

  const visibleVacancies = vacancies.filter(vac => !hidden.includes(vac.id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-200 to-slate-300 py-8 px-4">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-8 text-center flex justify-center items-center gap-2">
          <svg className="w-8 h-8 text-slate-500 animate-float" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h1 className="text-3xl md:text-4xl text-center font-bold text-slate-700 inline-block relative whitespace-nowrap">
            Поиск работы
            <span className="absolute bottom-0 left-0 w-16 h-1 bg-amber-500 rounded-full"></span>
          </h1>
        </div>

        <div ref={searchFormRef}>
          <SearchForm
            filters={filters}
            setFilters={setFilters}
            onSearch={handleSearch}
            savedQueries={savedQueries}
            addSavedQuery={addSavedQuery}
            removeSavedQuery={removeSavedQuery}
            initialQuery={query}
            initialExcludeWords={excludeTitleWords}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:hidden mb-4 sticky top-0 z-10">
            <button
              onClick={() => setShowFavorites(!showFavorites)}
              className="w-full bg-indigo-600 text-white py-2 rounded focus:outline-none"
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
                {hasMore && !loading && vacancies.length > 0 && (
                  <div className="text-center mt-4">
                    {loadingMore ? <Loader /> : (
                      <button
                        onClick={loadMore}
                        className="bg-indigo-600 text-white px-4 py-2 rounded focus:outline-none"
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

      <VacancyModal
        vacancyId={selectedVacancyId}
        onClose={() => setSelectedVacancyId(null)}
        applied={applied}
        onAppliedToggle={handleAppliedToggle}
        favorites={favorites}
        onAddToFavorites={handleAddToFavorites}
        onRemoveFromFavorites={handleRemoveFromFavorites}
      />

      {showScrollButton && (
        <button
          onClick={scrollToSearch}
          className="fixed bottom-6 right-6 bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-all z-20 focus:outline-none"
          aria-label="К поиску"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      )}

      <div className="fixed bottom-0 right-0 w-1/4 h-1/4 pointer-events-none hidden md:block z-0">
        <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0 L200 0 M0 20 L200 20 M0 40 L200 40 M0 60 L200 60 M0 80 L200 80 M0 100 L200 100 M0 120 L200 120 M0 140 L200 140 M0 160 L200 160 M0 180 L200 180 M0 200 L200 200 M0 0 L0 200 M20 0 L20 200 M40 0 L40 200 M60 0 L60 200 M80 0 L80 200 M100 0 L100 200 M120 0 L120 200 M140 0 L140 200 M160 0 L160 200 M180 0 L180 200 M200 0 L200 200" stroke="#94a3b8" strokeWidth="0.5" opacity="0.3" />
        </svg>
      </div>
    </div>
  );
}

export default App;