from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import requests
from datetime import datetime, timedelta, timezone
from typing import List, Optional
import time
import logging
from bs4 import BeautifulSoup

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173",
									 "https://vacancy-ten.vercel.app/"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def fetch_from_hh(query: str, page: int = 0) -> List[dict]:
    """Получает одну страницу вакансий с HH.ru."""
    params = {
        'text': query,
        'area': 1,
        'per_page': 100,
        'page': page,
        'only_with_salary': False,
    }
    max_retries = 3
    for attempt in range(max_retries):
        try:
            response = requests.get('https://api.hh.ru/vacancies', params=params, timeout=20)
            if response.status_code == 200:
                data = response.json()
                vacancies = []
                for item in data.get('items', []):
                    salary = item.get('salary')
                    experience = item.get('experience', {})
                    schedule = item.get('schedule', {})
                    published_at = item.get('published_at')
                    key_skills = [skill['name'] for skill in item.get('key_skills', [])]
                    vacancies.append({
                        'id': item['id'],
                        'name': item['name'],
                        'company': item['employer']['name'] if item.get('employer') else None,
                        'salary': salary,
                        'experience': experience.get('id'),
                        'schedule': schedule.get('id'),
                        'published_at': published_at,
                        'alternate_url': item.get('alternate_url'),
                        'key_skills': key_skills,
                    })
                return vacancies
            else:
                logger.error(f"Страница {page}, статус {response.status_code}")
        except Exception as e:
            logger.error(f"Ошибка при запросе страницы {page}: {e}")
        time.sleep(2)
    return []

def extract_skills_from_description(html_description: str) -> List[str]:
    """Извлекает навыки из HTML описания вакансии."""
    skill_keywords = [
        'React', 'JavaScript', 'TypeScript', 'Redux', 'Next.js', 'Vue', 'Angular',
        'Node.js', 'Python', 'Django', 'Flask', 'Git', 'HTML', 'CSS', 'Tailwind',
        'Sass', 'Webpack', 'Jest', 'REST', 'GraphQL', 'PostgreSQL', 'MongoDB'
    ]
    text = BeautifulSoup(html_description, 'lxml').get_text().lower()
    found = []
    for skill in skill_keywords:
        if skill.lower() in text:
            found.append(skill)
    return found

def detect_remote_from_description(html_description: str) -> bool:
    """Определяет удалённую работу из текста описания."""
    text = BeautifulSoup(html_description, 'lxml').get_text().lower()
    return 'удален' in text or 'remote' in text or 'дистанц' in text

@app.get("/api/vacancies")
def get_vacancies(
    query: str = Query("React разработчик", description="Поисковый запрос"),
    salary_only: bool = Query(False, description="Только с указанной зарплатой"),
    remote_only: bool = Query(False, description="Только удаленка"),
    exclude_experience_above_3: bool = Query(True, description="Исключить опыт 3-6 и более"),
    days: Optional[int] = Query(7, description="Не старше N дней (0 — все)"),
    page: int = Query(0, ge=0)
):
    raw_vacancies = fetch_from_hh(query, page)
    filtered = []
    cutoff_date = datetime.now(timezone.utc) - timedelta(days=days) if days and days > 0 else None

    for vac in raw_vacancies:
        if salary_only and not vac['salary']:
            continue
        if remote_only and vac['schedule'] != 'remote':
            continue
        if exclude_experience_above_3 and vac['experience'] in ('between3And6', 'moreThan6'):
            continue
        if cutoff_date:
            pub_date = datetime.fromisoformat(vac['published_at'].replace('Z', '+00:00')).replace(tzinfo=timezone.utc)
            if pub_date < cutoff_date:
                continue
        filtered.append(vac)
    return filtered

@app.get("/api/vacancy/{vacancy_id}")
def get_vacancy_details(vacancy_id: int):
    url = f"https://api.hh.ru/vacancies/{vacancy_id}"
    try:
        response = requests.get(url, timeout=15)
        if response.status_code != 200:
            return {"error": "Failed to fetch"}
        data = response.json()
        description = data.get('description', '')
        extra_skills = extract_skills_from_description(description)
        key_skills = [skill['name'] for skill in data.get('key_skills', [])]
        all_skills = list(set(key_skills + extra_skills))
        schedule = data.get('schedule', {}).get('id')
        remote = schedule == 'remote'
        if not remote and schedule is None:
            remote = detect_remote_from_description(description)
        return {
            'id': data['id'],
            'name': data['name'],
            'company': data['employer']['name'] if data.get('employer') else None,
            'salary': data.get('salary'),
            'experience': data.get('experience', {}).get('id'),
            'schedule': schedule,
            'remote': remote,
            'published_at': data.get('published_at'),
            'alternate_url': data.get('alternate_url'),
            'key_skills': key_skills,
            'extra_skills': extra_skills,
            'all_skills': all_skills,
            'description': description,
        }
    except Exception as e:
        return {"error": str(e)}