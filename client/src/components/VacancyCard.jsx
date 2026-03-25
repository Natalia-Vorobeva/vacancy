import { useState } from "react";

const formatSalary = (salary) => {
  if (!salary) return 'Не указана';
  let text = '';
  if (salary.from) text += `от ${salary.from}`;
  if (salary.to) text += ` ${text ? 'до' : 'до'} ${salary.to}`;
  if (text) text += ` ${salary.currency || 'руб'}`;
  return text || 'Не указана';
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU');
};

const VacancyCard = ({
  vacancy,
  isFavorite,
  onAddToFavorites,
  onRemoveFromFavorites,
  onHide,
  onClick,
  index,
  isLoading,
  ratings,
  setRating,
  applied,
  onAppliedToggle
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const currentRating = ratings[vacancy.id] || 0;

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (isFavorite) {
      onRemoveFromFavorites();
    } else {
      onAddToFavorites();
    }
  };

  const handleHideClick = (e) => {
    e.stopPropagation();
    if (window.confirm('Удалить вакансию из списка? Она больше не будет показываться в результатах поиска.')) {
      onHide();
    }
  };

  const isApplied = applied.includes(vacancy.id);

  return (
    <div
      className={`vacancy-card-image bg-white rounded-lg shadow p-4 hover:shadow-md transition cursor-pointer ${isFavorite ? 'vacancy-card--favorite' : ''}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          {index !== undefined && (
            <span className="text-gray-400 font-mono text-sm w-6 text-right">{index}.</span>
          )}
          <div>
            <h3 className="text-xl font-semibold text-blue-700">
              <a
                href={vacancy.alternate_url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {vacancy.name}
              </a>
            </h3>
            <p className="text-gray-600 mt-1">{vacancy.company || 'Компания не указана'}</p>
          </div>
        </div>

        {/* Правая колонка: дата, чекбокс, звёзды */}
        <div className="text-left md:text-right text-sm text-gray-500">
          <div>{formatDate(vacancy.published_at)}</div>
          <div className="flex items-center mt-2" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={isApplied}
              onChange={() => onAppliedToggle(vacancy.id)}
              className="custom-checkbox mr-1 flex-shrink-0"
            />
            <span className="text-xs text-gray-500 break-words">
              {isApplied ? 'Отклик отправлен' : 'Отклик не отправлен'}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-2 justify-end md:justify-end">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onClick={(e) => { e.stopPropagation(); setRating(vacancy.id, star); }}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="text-xl focus:outline-none"
              >
                <span className={star <= (hoverRating || currentRating) ? 'text-yellow-500' : 'text-gray-300'}>
                  ★
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        <span className="chip-border-left bg-gray-100 text-gray-800 rounded-sm px-3 py-1 border-l-4 border-gray-300 flex items-center gap-1">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 6H7.01M3 12L12 3H21V12L12 21L3 12Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
          {formatSalary(vacancy.salary)}
        </span>
        {vacancy.schedule === 'remote' && (
          <span className="chip-border-left remote bg-gray-100 flex items-center gap-1 text-gray-800 rounded-sm px-3 py-1 border-l-4 border-gray-300">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="5" width="16" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <path d="M8 19H16" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            Удаленно
          </span>
        )}
      </div>

      {vacancy.all_skills && vacancy.all_skills.length > 0 && (
        <div className="skills-section mt-3">
          <div className="text-sm font-medium text-gray-700">Навыки:</div>
          <div className="flex flex-wrap gap-1 mt-1">
            {vacancy.all_skills.map((skill, idx) => (
              <span key={idx} className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={handleFavoriteClick}
          className={`text-sm focus:outline-none text-[#eab308] hover:text-yellow-600`}
        >
          {isFavorite ? 'В избранном' : 'В избранное'}
        </button>
        <div className="modal-trigger">
          <div className={`modal-icon ${isFavorite ? 'favorite' : ''}`}>
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" fill="currentColor" rx="6" />
              <circle cx="13" cy="13" r="6" stroke="white" strokeWidth="1.5" fill="none" />
              <path d="M18 18 L23 23" stroke="white" strokeWidth="1.5" />
              <rect x="20" y="8" width="6" height="3" fill="white" rx="1" />
              <rect x="20" y="12" width="6" height="2" fill="white" rx="1" />
              <rect x="20" y="15" width="6" height="2" fill="white" rx="1" />
            </svg>
          </div>
        </div>
        <button
          onClick={handleHideClick}
          className="text-red-400 hover:text-red-600 focus:outline-none"
          title="Удалить"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 7H20M10 11V16M14 11V16M6 7L8 19H16L18 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M9 4H15" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default VacancyCard;