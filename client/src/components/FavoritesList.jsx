import FavoriteItem from './FavoriteItem';
import VacancyCard from './VacancyCard';

const FavoritesList = ({ favorites, onRemoveFromFavorites, onSelectVacancy, applied, onAppliedToggle }) => {
  if (favorites.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Избранное</h2>
        <p className="text-gray-500 text-center">Нет избранных вакансий</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Избранное</h2>
      <div className="space-y-3 max-h-[80vh] overflow-y-auto">
        {favorites.map((vac) => (
          <FavoriteItem
            key={vac.id}
            vacancy={vac}
            onRemove={onRemoveFromFavorites}
            onClick={onSelectVacancy}
            applied={applied}
            onAppliedToggle={onAppliedToggle}
          />
        ))}
      </div>
    </div>
  );
};

export default FavoritesList;