from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://vacancy-ten.vercel.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/ping")
def ping():
    return {"status": "ok"}

@app.get("/api/vacancies")
def get_vacancies(query: str = Query("React"), page: int = Query(0)):
    return [{"id": 1, "name": f"Test {query} page {page}"}]