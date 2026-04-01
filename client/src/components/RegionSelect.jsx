import { useState, useEffect, useRef } from 'react';

const RegionSelect = ({ regions, value, onChange, disabled = false }) => {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedRegion = regions.find(r => r.id === value);

  const filteredRegions = regions.filter(region =>
    region.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (region) => {
    onChange(region.id);
    setSearch('');
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        onClick={() => !disabled && setOpen(!open)}
        className={`flex items-center justify-between border border-gray-300 rounded p-2 bg-white cursor-pointer ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
      >
        <span className={!selectedRegion ? 'text-gray-400' : ''}>
          {selectedRegion ? selectedRegion.name : 'Выберите регион'}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {open && !disabled && (
        <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-60 overflow-y-auto">
          <div className="sticky top-0 bg-white p-2 border-b">
            <input
              type="text"
              placeholder="Поиск региона..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 rounded p-1 text-sm focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
              autoFocus
            />
          </div>
          {filteredRegions.length === 0 ? (
            <div className="p-2 text-gray-500 text-sm">Ничего не найдено</div>
          ) : (
            filteredRegions.map((region) => (
              <div
                key={region.id}
                onClick={() => handleSelect(region)}
                className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
              >
                {region.name}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default RegionSelect;