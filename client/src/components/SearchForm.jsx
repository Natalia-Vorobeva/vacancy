import { useState } from 'react';

const SearchForm = ({ filters, setFilters, onSearch }) => {
	const [query, setQuery] = useState(filters.query);

	const handleSubmit = (e) => {
		e.preventDefault();
		setFilters({ ...filters, query });
		onSearch();
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
	};

	return (
		<div className="bg-white p-6 rounded-lg shadow-md mb-6">
			<form onSubmit={handleSubmit}>
				<div className="flex flex-col md:flex-row gap-4 mb-4">
					<div className="flex-1 relative">   {/* ← относительное позиционирование */}
						<input
							name="search-vac"
							type="text"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							onKeyDown={handleKeyDown}
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
					</div>
					<button
						type="submit"
						className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 focus:outline-none"
					>
						Найти
					</button>
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