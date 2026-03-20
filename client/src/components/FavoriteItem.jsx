const FavoriteItem = ({ vacancy, onRemove, onClick, applied, onAppliedToggle }) => {
  return (
    <div className="p-2 border-b cursor-pointer hover:bg-gray-50" onClick={() => onClick(vacancy.id)}>
      <div className="flex justify-between items-start">
        <div className="font-medium text-blue-600">
          {vacancy.name}
          {applied.includes(vacancy.id) && (
            <span className="text-xs text-green-600 ml-2">✓ Отклик отправлен</span>
          )}
          <span className="text-xs text-gray-400 ml-2">(нажмите для деталей)</span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(vacancy.id); }}
          className="text-xs text-red-400 hover:text-red-600"
        >
          Удалить
        </button>
      </div>
      <div className="text-sm text-gray-500">{vacancy.company || 'Компания не указана'}</div>
      {/* Чекбокс отклика */}
      {/* <div className="mt-1 flex items-center" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={applied.includes(vacancy.id)}
          onChange={() => onAppliedToggle(vacancy.id)}
          className="w-4 h-4 mr-1"
        />
        <span className="text-xs text-gray-500">Отклик отправлен</span>
      </div> */}
    </div>
  );
};

export default FavoriteItem