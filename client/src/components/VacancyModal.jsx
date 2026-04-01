// eslint-disable react-hooks/exhaustive-deps
import { useEffect, useState, useCallback } from 'react';

const VacancyModal = ({ vacancyId, onClose, applied, onAppliedToggle, favorites, onAddToFavorites, onRemoveFromFavorites }) => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const loadDetails = useCallback(async () => {
    if (!vacancyId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/vacancy/${vacancyId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setDetails(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [vacancyId, retryCount]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  if (!vacancyId) return null;

  const isFavorite = favorites.some(fav => fav.id === vacancyId.id);
  const isApplied = applied.includes(vacancyId.id);

  const handleFavoriteToggle = (e) => {
    e.stopPropagation();
    if (isFavorite) {
      onRemoveFromFavorites(vacancyId.id);
    } else {
      onAddToFavorites(vacancyId);
    }
  };

  const formatSalary = (salary) => {
    if (!salary) return 'Не указана';
    let text = '';
    if (salary.from) text += `от ${salary.from}`;
    if (salary.to) text += ` ${text ? 'до' : 'до'} ${salary.to}`;
    if (text) text += ` ${salary.currency || 'руб'}`;
    return text || 'Не указана';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4 pb-8 pt-8" onClick={onClose}>
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col relative">
        <div className="sticky rounded-lg top-0 bg-white px-4 py-3 flex justify-between items-center border-b border-gray-200 z-10">
          <button
            onClick={handleFavoriteToggle}
            className={`focus:outline-none text-xs flex items-center gap-1 ${isFavorite ? 'text-yellow-500' : 'text-gray-500'
              }`}
          >
            {isFavorite ? '★ В избранном' : '☆ В избранное'}
          </button>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none text-2xl leading-none"
            aria-label="Закрыть"
          >
            &times;
          </button>
        </div>

        <div className="p-4 pt-0 overflow-auto">
          {loading && <div className="text-center py-8">Загрузка...</div>}
          {error && (
            <div className="text-center py-8">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-gray-700 mb-2">
                Не удалось загрузить детали вакансии
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Проверьте подключение к интернету и попробуйте снова
              </p>
              <button
                onClick={() => setRetryCount(c => c + 1)}
                className="bg-blue-500 text-white px-4 py-2 rounded focus:outline-none hover:bg-blue-600"
              >
                Повторить
              </button>
            </div>
          )}
          {details && !loading && !error && (
            <>
              <h2 className="text-2xl font-bold mt-4">{vacancyId.name}</h2>
              <h2 className="text-2xl font-bold mb-2">{details.name}</h2>
              <p className="text-gray-600 mb-2">{details.company || 'Компания не указана'}</p>
              {details.area && (
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
  <span>{details.area}</span>
</div>
              )}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded">
                  {formatSalary(details.salary)}
                </span>
                {details.remote && (
                  <span className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded">
                    Удалённая работа
                  </span>
                )}
                <span className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded">
                  {formatDate(details.published_at)}
                </span>
              </div>

              {details.all_skills && details.all_skills.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-1">Навыки:</h3>
                  <div className="flex flex-wrap gap-1">
                    {details.all_skills.map((skill, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-4">
                <h3 className="font-semibold mb-1">Описание:</h3>
                <div
                  className="prose prose-sm max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: details.description }}
                />
              </div>

              <div className="flex items-center gap-2 mb-4 pt-2">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isApplied}
                    onChange={() => onAppliedToggle(details.id)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    {isApplied ? 'Отклик отправлен' : 'Отклик не отправлен'}
                  </span>
                </label>
              </div>

              <div className="flex justify-center mt-4">
                <a
                  href={details.alternate_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 text-center"
                >
                  Перейти к вакансии на HH
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VacancyModal;