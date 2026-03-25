import { useState, useEffect, useRef } from 'react';

const SearchForm = ({
	filters,
	setFilters,
	onSearch,
	savedQueries,
	addSavedQuery,
	removeSavedQuery,
	initialQuery,
	initialExcludeWords
}) => {
	const [localQuery, setLocalQuery] = useState(initialQuery);
	const [localExcludeWords, setLocalExcludeWords] = useState(initialExcludeWords);
	const [showDropdown, setShowDropdown] = useState(false);
	const containerRef = useRef(null);

	useEffect(() => {
		setLocalQuery(initialQuery);
	}, [initialQuery]);

	useEffect(() => {
		setLocalExcludeWords(initialExcludeWords);
	}, [initialExcludeWords]);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (containerRef.current && !containerRef.current.contains(event.target)) {
				setShowDropdown(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	const handleSubmit = (e) => {
		e.preventDefault();
		onSearch(localQuery, localExcludeWords);
		setShowDropdown(false);
	};

	const handleReset = () => {
		setLocalQuery('');
		// Не вызываем onSearch, чтобы не запускать поиск с пустым запросом
	};

	const handleSaveQuery = () => {
		if (localQuery.trim()) {
			addSavedQuery(localQuery.trim());
		}
	};

	const handleSelectQuery = (selected) => {
		setLocalQuery(selected);
		onSearch(selected, localExcludeWords);
		setShowDropdown(false);
	};

	return (
		<div className="shadow-[0_15px_30px_-12px_rgba(0,0,0,0.2)] p-4 mb-6">
			<form onSubmit={handleSubmit}>
				<div className="flex flex-col md:flex-row gap-4 mb-4 relative">
					<div ref={containerRef} className="flex-1 relative">
						<div className="relative">
							<input
								type="search"
								name="search-vac"
								value={localQuery}
								onChange={(e) => setLocalQuery(e.target.value)}
								onFocus={() => setShowDropdown(true)}
								placeholder="Поиск по вакансиям..."
								className="w-full p-2 pl-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
							/>
							<svg
								className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
							</svg>
							{localQuery && (
								<button
									type="button"
									onClick={handleReset}
									className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
								>
									✕
								</button>
							)}
						</div>
						{showDropdown && savedQueries.length > 0 && (
							<div className="absolute z-20 left-0 right-0 mt-2 bg-white border border-gray-200 rounded shadow-lg max-h-60 overflow-y-auto text-sm">
								{savedQueries.map((sq) => (
									<div
										key={sq}
										className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex justify-between items-center group"
										onClick={() => handleSelectQuery(sq)}
									>
										<span className="text-gray-700">{sq}</span>
										<button
											type="button"
											onClick={(e) => {
												e.stopPropagation();
												removeSavedQuery(sq);
											}}
											className="text-gray-300 hover:text-red-400 transition text-xs"
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
							className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 focus:outline-none transition shadow-sm"
						>
							Найти
						</button>
						<button
							type="button"
							onClick={handleSaveQuery}
							className="flex items-center gap-1 border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded hover:bg-gray-50 focus:outline-none transition shadow-sm"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-4 w-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth={2}
							>
								<path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
							</svg>
							Сохранить
						</button>
					</div>
				</div>

				{/* Поле исключения слов – сразу под строкой поиска */}
				<div className="mb-4">
					<div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-sm">
						<span className="text-gray-700 break-words">
							Исключить слова в названии (через запятую):
						</span>
						<input
							type="text"
							value={localExcludeWords}
							onChange={(e) => setLocalExcludeWords(e.target.value)}
							placeholder="например: middle, backend, senior"
							className="flex-1 border border-gray-300 rounded p-1.5 focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
						/>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
					<label className="flex items-center gap-2 cursor-pointer">
						<input
							type="checkbox"
							className="custom-checkbox"
							checked={filters.salaryOnly}
							onChange={(e) => setFilters({ ...filters, salaryOnly: e.target.checked })}
						/>
						<span className="text-gray-700">Только с указанной ЗП</span>
					</label>
					<label className="flex items-center gap-2 cursor-pointer">
						<input
							className="custom-checkbox"
							type="checkbox"
							checked={filters.remoteOnly}
							onChange={(e) => setFilters({ ...filters, remoteOnly: e.target.checked })}
						/>
						<span className="text-gray-700">Удаленная работа</span>
					</label>
					<label className="flex items-center gap-2 cursor-pointer">
						<input
							className="custom-checkbox"
							type="checkbox"
							checked={filters.excludeExperienceAbove3}
							onChange={(e) => setFilters({ ...filters, excludeExperienceAbove3: e.target.checked })}
						/>
						<span className="text-gray-700">Не показывать опыт от 3 лет</span>
					</label>
					<label className="flex items-center gap-2 cursor-pointer">
						<input
							type="checkbox"
							className="custom-checkbox"
							checked={filters.excludeAgency}
							onChange={(e) => setFilters({ ...filters, excludeAgency: e.target.checked })}
						/>
						<span className="text-gray-700">Без кадровых агентств</span>
					</label>

					<div className="flex items-center gap-2">
						<span className="text-gray-700">Дней:</span>
						<div className="relative">
							<select
								value={filters.days}
								onChange={(e) => setFilters({ ...filters, days: parseInt(e.target.value) })}
								className="border border-gray-300 rounded p-1.5 bg-white appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
							>
								<option value={1}>1</option>
								<option value={3}>3</option>
								<option value={7}>7</option>
								<option value={14}>14</option>
								<option value={30}>30</option>
								<option value={0}>Все</option>
							</select>
							<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
								<svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
									<path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
								</svg>
							</div>
						</div>
					</div>
				</div>
			</form>
		</div>
	);
};

export default SearchForm;