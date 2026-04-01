import React from 'react';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  onLoadMore,
  hasMore = false,
  loadingMore = false,
  variant = 'default', // 'default', 'minimal', 'rounded', 'icons', 'animated'
}) => {
  // Генерация номеров страниц с многоточиями
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      } else if (range[range.length - 1] !== '...') {
        range.push('...');
      }
    }
    return range;
  };

  const pageNumbers = getPageNumbers();

  // Функция для получения классов кнопок в зависимости от варианта
  const getButtonClasses = (num, isCurrent = false, isArrow = false) => {
    const base = 'px-3 py-1 rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
    
    if (variant === 'default') {
      if (isCurrent) return `${base} bg-indigo-600 text-white font-bold`;
      if (isArrow) return `${base} bg-gray-200 text-gray-700 hover:bg-gray-300`;
      return `${base} bg-gray-200 text-gray-700 hover:bg-gray-300`;
    }
    
    if (variant === 'minimal') {
      if (isCurrent) return `${base} border-b-2 border-indigo-600 font-medium`;
      if (isArrow) return `${base} text-gray-500 hover:text-gray-700`;
      return `${base} text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300`;
    }
    
    if (variant === 'rounded') {
      if (isCurrent) return `${base} rounded-full bg-indigo-600 text-white shadow-md`;
      if (isArrow) return `${base} rounded-full bg-white text-gray-700 hover:bg-gray-100 shadow-sm`;
      return `${base} rounded-full bg-white text-gray-700 hover:bg-gray-100 shadow-sm`;
    }
    
    if (variant === 'icons') {
      if (isCurrent) return `${base} bg-indigo-600 text-white font-bold`;
      if (isArrow) return `${base} text-gray-500 hover:text-indigo-600`;
      return `${base} text-gray-500 hover:text-indigo-600`;
    }
    
    if (variant === 'animated') {
      if (isCurrent) return `${base} bg-indigo-600 text-white scale-105 shadow-md`;
      if (isArrow) return `${base} bg-gray-200 text-gray-700 hover:scale-105 hover:bg-gray-300`;
      return `${base} bg-gray-200 text-gray-700 hover:scale-105 hover:bg-gray-300`;
    }
    
    return base;
  };

  // Стрелки для варианта с иконками
  const PrevArrow = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
    </svg>
  );
  const NextArrow = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
    </svg>
  );

  return (
    <div className="flex items-center justify-center gap-2 flex-wrap">
      {/* Предыдущая */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={getButtonClasses(null, false, true)}
      >
        {variant === 'icons' ? '<' : '←'}
      </button>

      {/* Номера страниц */}
      {pageNumbers.map((num, idx) => (
        <button
          key={idx}
          onClick={() => typeof num === 'number' && onPageChange(num)}
          disabled={num === '...' || num === currentPage}
          className={getButtonClasses(num, num === currentPage)}
        >
          {num}
        </button>
      ))}

      {/* Следующая */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={getButtonClasses(null, false, true)}
      >
        {variant === 'icons' ? '>' : '→'}
      </button>

      {/* Кнопка "Загрузить ещё" */}
      {hasMore && onLoadMore && (
        <button
          onClick={onLoadMore}
          disabled={loadingMore}
          className="ml-4 px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50"
        >
          {loadingMore ? 'Загрузка...' : 'Загрузить ещё'}
        </button>
      )}
    </div>
  );
};

export default Pagination;