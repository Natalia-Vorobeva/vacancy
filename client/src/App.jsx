import { useState, useEffect, useCallback, useRef } from 'react';
import SearchForm from './components/SearchForm';
import VacancyList from './components/VacancyList';
import FavoritesList from './components/FavoritesList';
import VacancyModal from './components/VacancyModal';
import Loader from './components/Loader';

function App() {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    query: 'React разработчик',
    salaryOnly: false,
    remoteOnly: true,
    excludeExperienceAbove3: true,
    days: 7,
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
  // Новое состояние
  const [applied, setApplied] = useState(() => {
    const saved = localStorage.getItem('applied');
    return saved ? JSON.parse(saved) : [];
  });

  // Сохранение в localStorage
  useEffect(() => {
    localStorage.setItem('applied', JSON.stringify(applied));
  }, [applied]);

  // Функции
  const handleAppliedToggle = (vacancyId) => {
    setApplied(prev =>
      prev.includes(vacancyId)
        ? prev.filter(id => id !== vacancyId)
        : [...prev, vacancyId]
    );
  };

  // Сохранение в localStorage
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

  // Функция загрузки одной страницы вакансий
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
      });
      const res = await fetch(`${API_URL}/api/vacancies?${params}`);
      const data = await res.json();
      if (append) {
        setVacancies(prev => [...prev, ...data]);
      } else {
        setVacancies(data);
      }

      if (data.length < 100) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
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

  // Загрузка первой страницы при изменении фильтров
  useEffect(() => {
    setPage(0);
    setHasMore(true);
    loadPage(0, false);
    // Очищаем кеш навыков, так как новый поиск – новые вакансии
    setSkillsCache({});
    localStorage.removeItem('skillsCache');
    setShowFavorites(false)
  }, [filters, loadPage]);

  // Загрузка следующих страниц (кнопка "Загрузить ещё")
  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    await loadPage(nextPage, true);
  };

  // Функция загрузки навыков для одной вакансии с кешированием
  const loadSkillsForVacancy = useCallback(async (vacancy) => {
    // Если уже есть навыки в объекте вакансии – не загружаем
    if (vacancy.all_skills) return;

    // Если уже загружаем – не дублируем
    if (loadingSkills[vacancy.id]) return;

    // Проверяем кеш
    if (skillsCache[vacancy.id]) {
      setVacancies(prev =>
        prev.map(v =>
          v.id === vacancy.id ? { ...v, all_skills: skillsCache[vacancy.id] } : v
        )
      );
      return;
    }

    setLoadingSkills(prev => ({ ...prev, [vacancy.id]: true }));
    try {
      const res = await fetch(`${API_URL}/api/vacancy/${vacancy.id}`);
      const details = await res.json();
      if (!details.error) {
        const skills = details.all_skills || [];
        // Сохраняем в кеш
        setSkillsCache(prev => ({ ...prev, [vacancy.id]: skills }));
        // Обновляем вакансию в списке
        setVacancies(prev =>
          prev.map(v =>
            v.id === vacancy.id ? { ...v, all_skills: skills } : v
          )
        );
      } else {
        console.warn(`Ошибка при получении навыков для ${vacancy.id}: ${details.error}`);
      }
    } catch (err) {
      console.error(`Ошибка сети для вакансии ${vacancy.id}`, err);
    } finally {
      setLoadingSkills(prev => ({ ...prev, [vacancy.id]: false }));
    }
  }, [skillsCache, loadingSkills]);

  // Загружаем навыки для видимых вакансий (первые 20, не более 3 одновременно)
  useEffect(() => {
    const visible = vacancies.filter(v => !hidden.includes(v.id));
    const toLoad = visible
      .filter(v => !v.all_skills && !loadingSkills[v.id])
      .slice(0, 20);

    if (toLoad.length === 0) return;

    // Загружаем по одному с задержкой, чтобы не перегружать сервер
    let i = 0;
    const loadNext = () => {
      if (i < toLoad.length) {
        loadSkillsForVacancy(toLoad[i]);
        i++;
        setTimeout(loadNext, 200); // 200ms между запросами
      }
    };
    loadNext();
  }, [vacancies, hidden, loadingSkills, loadSkillsForVacancy]);

  // Остальные функции (добавление/удаление из избранного, скрытие)
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-100 py-8 px-4 ">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Поиск работы</h1>
        <SearchForm filters={filters} setFilters={setFilters} onSearch={() => { }} />
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setShowFavorites(!showFavorites)}
              className="w-full bg-sky-500 text-white py-2 rounded focus:outline-none"
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
            />
          </div>
        </div>
      </div>
      <VacancyModal
        vacancyId={selectedVacancyId}
        onClose={() => setSelectedVacancyId(null)}
        applied={applied}
        onAppliedToggle={handleAppliedToggle}
      />
    </div>
  );
}

export default App;