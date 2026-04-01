import Loader from './Loader';
import VacancyCard from './VacancyCard';

const VacancyList = ({ vacancies = [], loading, favorites, onAddToFavorites, onRemoveFromFavorites, onHide, onSelectVacancy, isLoading, ratings, setRating, applied, onAppliedToggle, isRemoteFilterActive }) => {

	if (loading) return <Loader />;
	if (vacancies.length === 0) return <div className="text-center py-10">Вакансии не найдены. Попробуйте изменить фильтры.</div>;

	return (
		<div className="space-y-4 mb-4">
			{vacancies.map((vac, idx) => (
				<VacancyCard
					key={vac.id}
					ratings={ratings}
					setRating={setRating}
					index={idx + 1}
					vacancy={vac}
					isLoading={isLoading}
					isFavorite={favorites.some(fav => fav.id === vac.id)}
					onAddToFavorites={() => onAddToFavorites(vac)}
					onRemoveFromFavorites={() => onRemoveFromFavorites(vac.id)}
					onHide={() => onHide(vac.id)}
					onClick={() => onSelectVacancy(vac.id)}
					applied={applied}
					onAppliedToggle={onAppliedToggle}
					isRemoteFilterActive={isRemoteFilterActive}
				/>
			))}
		</div>
	);
};

export default VacancyList;