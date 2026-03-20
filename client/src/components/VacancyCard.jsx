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

const VacancyCard = ({ vacancy, isFavorite, onAddToFavorites, onRemoveFromFavorites, onHide, onClick, index, isLoading, ratings, setRating, applied, onAppliedToggle }) => {
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

	return (
		<div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition cursor-pointer" onClick={onClick}>
			<div className="flex justify-between items-start">
				<div className="flex items-center gap-2">
					{index !== undefined && (
						<span className="text-gray-400 font-mono text-sm w-6 text-right">{index}.</span>
					)}
					<div>
						<h3 className="text-xl font-semibold text-blue-700">
							<a href={vacancy.alternate_url} target="_blank" rel="noopener noreferrer" className="hover:underline" onClick={(e) => e.stopPropagation()}>
								{vacancy.name}
							</a>
						</h3>

						<p className="text-gray-600 mt-1">{vacancy.company || 'Компания не указана'}</p>
					</div>
				</div>
				<div className="text-right text-sm text-gray-500">
					{formatDate(vacancy.published_at)}
					<div className="flex items-center gap-1 mt-2" onClick={(e) => e.stopPropagation()}>
					<input
						type="checkbox"
						checked={applied.includes(vacancy.id)}
						onChange={() => onAppliedToggle(vacancy.id)}
						className="w-4 h-4"
					/>
					<span className="text-xs text-gray-500">Отклик отправлен</span>
				</div>
				</div>
			</div>
			<div className="flex items-center gap-1 mt-2">
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

			<div className="mt-2 flex flex-wrap gap-2">
				<span className="bg-gray-100 text-gray-800 rounded-sm px-3 py-1 border-l-4 border-green-500">
					{formatSalary(vacancy.salary)}
				</span>
				{vacancy.schedule === 'remote' && (
					<span className="bg-gray-100 text-gray-800 rounded-sm px-3 py-1 border-l-4 border-purple-500">
						Удаленно
					</span>
				)}
			</div>

			{/* Блок навыков */}
			<div className="mt-3">
				<div className="flex flex-wrap gap-1 mt-1">
					{vacancy.all_skills && vacancy.all_skills.length > 0 && (
						<div className="mt-1">
							<div className="text-sm font-medium text-gray-700">Навыки:</div>
							<div className="flex flex-wrap gap-1 mt-1">
								{vacancy.all_skills && vacancy.all_skills.length > 0 ? (
									vacancy.all_skills.slice(0, 5).map((skill, idx) => (
										<span key={idx} className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">
											{skill}
										</span>
									))
								) : isLoading ? (
									<span className="text-xs text-gray-400">Загрузка...</span>
								) : (
									<span className="text-xs text-gray-400">Не указаны</span>
								)}
							</div>
						</div>
					)}
				</div>
			</div>

			<div className="flex justify-between mt-2">
				<button
					onClick={handleFavoriteClick}
					className={`text-sm focus:outline-none ${isFavorite ? 'text-yellow-500' : 'text-gray-400'} hover:text-yellow-600`}
				>
					{isFavorite ? '★ В избранном' : '☆ В избранное'}
				</button>
				<span className="text-xs text-gray-400 ml-2">Больше...</span>
				<button
					onClick={handleHideClick}
					className="text-sm text-red-400 hover:text-red-600 "
				>
					Удалить
				</button>
			</div>
		</div>
	);
};

export default VacancyCard;