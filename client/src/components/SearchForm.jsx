import { useState } from 'react';

const SearchForm = ({ filters, setFilters, onSearch, savedQueries, addSavedQuery, removeSavedQuery }) => {
  const [query, setQuery] = useState(filters.query);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFilters({ ...filters, query });
    onSearch();
    setShowDropdown(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const handleReset = () => {
    setQuery('');
    setFilters({ ...filters, query: '' });
    onSearch();
    setShowDropdown(false);
  };

  const handleSaveQuery = () => {
    if (query.trim()) {
      addSavedQuery(query.trim());
    }
  };

  const handleSelectQuery = (selected) => {
    setQuery(selected);
    setFilters({ ...filters, query: selected });
    onSearch();
    setShowDropdown(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col md:flex-row gap-4 mb-4 relative">
          <div className="flex-1 relative">
            <input
              name="search-vac"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowDropdown(true)}
              placeholder="Поиск по вакансиям..."
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
            />
            {query && (
              <button
                type="button"
                onClick={handleReset}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
              >
                ✕
              </button>
            )}
            {showDropdown && savedQueries.length > 0 && (
              <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-40 overflow-y-auto text-sm">
                {savedQueries.map((sq) => (
                  <div
                    key={sq}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                    onClick={() => handleSelectQuery(sq)}
                  >
                    <span>{sq}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSavedQuery(sq);
                      }}
                      className="text-red-400 hover:text-red-600 text-xs"
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
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 focus:outline-none"
            >
              Найти
            </button>
            <button
              type="button"
              onClick={handleSaveQuery}
              className="bg-gray-200 text-gray-700 px-3 py-2 rounded hover:bg-gray-300 focus:outline-none text-sm"
            >
              Сохранить
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.salaryOnly}
              onChange={(e) => setFilters({ ...filters, salaryOnly: e.target.checked })}
            />
            Только с указанной ЗП
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.remoteOnly}
              onChange={(e) => setFilters({ ...filters, remoteOnly: e.target.checked })}
            />
            Удаленная работа
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.excludeExperienceAbove3}
              onChange={(e) => setFilters({ ...filters, excludeExperienceAbove3: e.target.checked })}
            />
            Не показывать опыт от 3 лет
          </label>
          <div className="flex items-center gap-2">
            <span>Дней:</span>
            <select
              value={filters.days}
              onChange={(e) => setFilters({ ...filters, days: parseInt(e.target.value) })}
              className="border rounded p-1"
            >
              <option value={1}>1</option>
              <option value={3}>3</option>
              <option value={7}>7</option>
              <option value={14}>14</option>
              <option value={30}>30</option>
              <option value={0}>Все</option>
            </select>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SearchForm;