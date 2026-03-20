// eslint-disable react-hooks/exhaustive-deps
import { useEffect, useState, useCallback } from 'react';

const VacancyModal = ({ vacancyId, onClose, applied, onAppliedToggle }) => {
	const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
	const [details, setDetails] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [retryCount, setRetryCount] = useState(0);

	const loadDetails = useCallback(async () => {
		if (!vacancyId) return;
		setLoading(true);
		setError(null);
		try {
			const res = await fetch(`${API_URL}/api/vacancy/${vacancyId}`);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const data = await res.json();
			if (data.error) throw new Error(data.error);
			setDetails(data);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	}, [vacancyId, retryCount]);

	useEffect(() => {
		loadDetails();
	}, [loadDetails]);

	if (!vacancyId) return null;

	// useEffect(() => {
	// 	if (!vacancyId) return;
	// 	setLoading(true);
	// 	setError(null);
	// 	fetch(`http://localhost:8000/api/vacancy/${vacancyId}`)
	// 		.then(res => res.json())
	// 		.then(data => {
	// 			if (data.error) {
	// 				setError(data.error);
	// 			} else {
	// 				setDetails(data);
	// 			}
	// 		})
	// 		.catch(err => {
	// 			console.error(err);
	// 			setError('Не удалось загрузить данные');
	// 		})
	// 		.finally(() => setLoading(false));
	// }, [vacancyId]);

	// if (!vacancyId) return null;

	const formatSalary = (salary) => {
		if (!salary) return 'Не указана';
		let text = '';
		if (salary.from) text += `от ${salary.from}`;
		if (salary.to) text += ` ${text ? 'до' : 'до'} ${salary.to}`;
		if (text) text += ` ${salary.currency || 'руб'}`;
		return text || 'Не указана';
	};

	const formatDate = (dateStr) => {
		if (!dateStr) return '';
		const date = new Date(dateStr);
		return date.toLocaleDateString('ru-RU');
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
			<div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
				{loading && <div className="text-center py-8">Загрузка...</div>}
				{error && (
					<div className="text-center py-8">
						<p className="text-red-500 mb-2">Ошибка: {error}</p>
						<button
							onClick={() => setRetryCount(c => c + 1)}
							className="bg-blue-500 text-white px-4 py-2 rounded focus:outline-none"
						>
							Повторить
						</button>
					</div>
				)}
				{details && !loading && !error && (
					<>
						<h2 className="text-2xl font-bold mb-2">{details.name}</h2>
						<p className="text-gray-600 mb-2">{details.company || 'Компания не указана'}</p>
						<div className="flex flex-wrap gap-2 mb-4">
							<span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded">
								{formatSalary(details.salary)}
							</span>
							{details.remote && (
								<span className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded">
									Удалённая работа
								</span>
							)}
							<span className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded">
								{formatDate(details.published_at)}
							</span>
						</div>

						{details.all_skills && details.all_skills.length > 0 && (
							<div className="mb-4">
								<h3 className="font-semibold mb-1">Навыки:</h3>
								<div className="flex flex-wrap gap-1">
									{details.all_skills.map((skill, idx) => (
										<span key={idx} className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded">
											{skill}
										</span>
									))}
								</div>
							</div>
						)}

						<div className="mb-4">
							<h3 className="font-semibold mb-1">Описание:</h3>
							<div
								className="prose prose-sm max-w-none text-gray-700"
								dangerouslySetInnerHTML={{ __html: details.description }}
							/>
						</div>

						<div className="flex items-center gap-2 mb-4 pt-2">
							<label className="flex items-center gap-2 cursor-pointer">
								<input
									type="checkbox"
									checked={applied.includes(details.id)}
									onChange={() => onAppliedToggle(details.id)}
									className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
								/>
								<span className="text-sm text-gray-700">Отклик отправлен</span>
							</label>
						</div>

						<div className="flex justify-between mt-4">
							<a
								href={details.alternate_url}
								target="_blank"
								rel="noopener noreferrer"
								className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
							>
								Перейти к вакансии на HH
							</a>
							<button
								onClick={onClose}
								className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-100 focus:outline-none"
							>
								Закрыть
							</button>
						</div>
					</>
				)}
			</div>
		</div>
	);
};

export default VacancyModal;