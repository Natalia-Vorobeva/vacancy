import { useState, useEffect, useRef } from 'react';
import RegionSelect from './RegionSelect';

const SearchForm = ({
  filters,
  setFilters,
  onSearch,
  savedQueries,
  addSavedQuery,
  removeSavedQuery,
  initialQuery,
  initialExcludeWords,
  regions,
  onLoadRegions,
}) => {
  const [localQuery, setLocalQuery] = useState(initialQuery);
  const [localExcludeWords, setLocalExcludeWords] = useState(initialExcludeWords);
  const [showDropdown, setShowDropdown] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  let toastTimeout = useRef(null);

  useEffect(() => {
    setLocalQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    setLocalExcludeWords(initialExcludeWords);
  }, [initialExcludeWords]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showToast = (message) => {
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    setToastMessage(message);
    toastTimeout.current = setTimeout(() => setToastMessage(null), 1500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(localQuery, localExcludeWords);
    showToast('Идет поиск');
    setShowDropdown(false);
  };

  const handleReset = () => {
    setLocalQuery('');
    if (inputRef.current) inputRef.current.focus();
  };

  const handleSaveQuery = () => {
    if (localQuery.trim()) {
      addSavedQuery(localQuery.trim());
      showToast('Запрос сохранён');
    } else {
      showToast('Введите запрос для сохранения');
    }
  };

  const handleSelectQuery = (selected) => {
    setLocalQuery(selected);
    onSearch(selected, localExcludeWords);
    showToast('Поиск выполнен');
    setShowDropdown(false);
  };

  return (
    <div className="shadow-[0_15px_30px_-12px_rgba(0,0,0,0.2)] p-4 mb-6 relative">
      <style>
        {`
          input[type="search"]::-webkit-search-cancel-button {
            display: none;
          }
          input[type="search"]::-webkit-search-decoration,
          input[type="search"]::-webkit-search-results-button,
          input[type="search"]::-webkit-search-results-decoration {
            display: none;
          }
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translate(-50%, 20px);
            }
            to {
              opacity: 1;
              transform: translate(-50%, 0);
            }
          }
          .animate-fade-in-up {
            animation: fadeInUp 0.2s ease-out;
          }
        `}
      </style>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div ref={containerRef} className="flex-1 relative">
            <div className="relative">
              <input
                ref={inputRef}
                type="search"
                inputMode="search"
                enterKeyHint="search"
                name="search-vac"
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                onFocus={() => setShowDropdown(true)}
                placeholder="Поиск по вакансиям..."
                className="w-full p-2 pl-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {localQuery && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  ✕
                </button>
              )}
            </div>
            {showDropdown && savedQueries.length > 0 && (
              <div className="absolute z-20 left-0 right-0 mt-2 bg-white border border-gray-200 rounded shadow-lg max-h-60 overflow-y-auto text-sm">
                {savedQueries.map((sq) => (
                  <div
                    key={sq}
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex justify-between items-center group"
                    onClick={() => handleSelectQuery(sq)}
                  >
                    <span className="text-gray-700">{sq}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSavedQuery(sq);
                      }}
                      className="text-gray-300 hover:text-red-400 transition text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 focus:outline-none transition shadow-sm active:scale-95"
            >
              Найти
            </button>
            <button
              type="button"
              onClick={handleSaveQuery}
              className="flex items-center gap-1 border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded hover:bg-gray-50 focus:outline-none transition shadow-sm active:scale-95"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              Сохранить
            </button>
          </div>
        </div>

        <div className="mb-4 mt-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-sm">
            <span className="text-gray-700 break-words">
              Исключить слова в названии (через запятую):
            </span>
            <input
              type="text"
              value={localExcludeWords}
              onChange={(e) => setLocalExcludeWords(e.target.value)}
              placeholder="например: middle, backend, senior"
              className="w-full sm:flex-1 border border-gray-300 rounded p-1.5 focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
            />
          </div>
          {!filters.remoteOnly && (
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <div className="text-gray-700 mb-1 text-sm">Регион</div>
            <RegionSelect
              regions={regions}
              value={filters.area}
              onChange={(areaId) => setFilters({ ...filters, area: areaId })}
              disabled={filters.remoteOnly}
            />
          </div>
        )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="custom-checkbox" checked={filters.salaryOnly} onChange={(e) => setFilters({ ...filters, salaryOnly: e.target.checked })} />
            <span className="text-gray-700">Только с указанной ЗП</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="custom-checkbox"
              checked={filters.remoteOnly}
              onChange={(e) => setFilters({ ...filters, remoteOnly: e.target.checked })}
            />
            <span className="text-gray-700">Удаленная работа</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input className="custom-checkbox" type="checkbox" checked={filters.excludeExperienceAbove3} onChange={(e) => setFilters({ ...filters, excludeExperienceAbove3: e.target.checked })} />
            <span className="text-gray-700">Не показывать опыт от 3 лет</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="custom-checkbox" checked={filters.excludeAgency} onChange={(e) => setFilters({ ...filters, excludeAgency: e.target.checked })} />
            <span className="text-gray-700">Без кадровых агентств</span>
          </label>

          <div className="flex items-center gap-2">
            <span className="text-gray-700">Дней:</span>
            <div className="relative">
              <select value={filters.days} onChange={(e) => setFilters({ ...filters, days: parseInt(e.target.value) })} className="border border-gray-300 rounded p-1.5 bg-white appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent">
                <option value={1}>1</option>
                <option value={3}>3</option>
                <option value={7}>7</option>
                <option value={14}>14</option>
                <option value={30}>30</option>
                <option value={0}>Все</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </form>

      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded shadow-lg text-sm z-50 animate-fade-in-up">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default SearchForm;