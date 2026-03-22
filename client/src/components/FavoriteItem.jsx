const FavoriteItem = ({ vacancy, onRemove, onClick, applied, onAppliedToggle, ratings }) => {
  const rating = ratings?.[vacancy.id] || 0;

  const handleInfoClick = (e) => {
    e.stopPropagation();
    onClick(vacancy.id);
  };

  const handleRemoveClick = (e) => {
    e.stopPropagation();
    onRemove(vacancy.id);
  };

  const handleCheckboxChange = (e) => {
    e.stopPropagation();
    onAppliedToggle(vacancy.id);
  };

  return (
    <div
      className="p-3 border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer flex justify-between items-start"
      onClick={() => onClick(vacancy.id)}
    >
      <div className="flex-1">
        <div className="font-medium text-indigo-700">
          {vacancy.name}
          {rating > 0 && (
            <span className="ml-2 text-yellow-500 text-sm">
              {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
            </span>
          )}
        </div>
        <div className="text-sm text-gray-500 mt-0.5">
          {vacancy.company || 'Компания не указана'}
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={handleInfoClick}
            className="text-gray-400 hover:text-indigo-500 transition"
            title="Подробнее"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
              />
            </svg>
          </button>
          <button
            onClick={handleRemoveClick}
            className="text-gray-400 hover:text-yellow-500 transition"
            title="Удалить из избранного"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
        <label onClick={(e) => e.stopPropagation()} className={`flex items-center gap-1 text-xs cursor-pointer whitespace-nowrap ${applied.includes(vacancy.id) ? 'text-green-600' : 'text-gray-500'}`}>
          <input
            type="checkbox"
            className="custom-checkbox"
            checked={applied.includes(vacancy.id)}
            onChange={handleCheckboxChange}
            
          />
          <span>Отклик отправлен</span>
        </label>
      </div>
    </div>
  );
};

export default FavoriteItem;