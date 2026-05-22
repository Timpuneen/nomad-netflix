# 🎬 Netflix Browser

Полноценное приложение для просмотра и фильтрации Netflix-каталога.

**Стек:** FastAPI · SQLAlchemy · PostgreSQL · pandas · React · Docker

---

## Структура проекта

```
netflix-app/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/   # auth.py, titles.py
│   │   ├── core/               # config.py, security.py
│   │   ├── db/                 # session.py
│   │   ├── models/             # user.py (все модели)
│   │   ├── schemas/            # schemas.py
│   │   ├── services/           # title_service.py, user_service.py
│   │   └── main.py
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/                # client.ts, titles.ts
│   │   ├── components/         # ProtectedRoute.tsx
│   │   ├── pages/              # LoginPage, RegisterPage, BrowsePage, TitlePage
│   │   ├── store/              # authStore.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── Dockerfile
│   └── package.json
├── etl/
│   └── load.py                 # ETL-скрипт загрузки CSV
├── docker-compose.yml
└── .env.example
```

---

## Запуск

### 1. Подготовка окружения

```bash
cp .env.example .env
# При необходимости отредактируй .env
```

### 2. Поднять контейнеры

```bash
docker-compose up --build
```

Сервисы:
- Backend API:  http://localhost:8000
- Swagger docs: http://localhost:8000/docs
- Frontend:     http://localhost:3000

### 3. Загрузить данные (ETL)

Положи `netflix.csv` в папку `etl/`, затем:

```bash
docker-compose exec backend python /etl/load.py --csv /etl/netflix.csv
```

---

## API эндпоинты

### Авторизация
| Метод | URL | Описание |
|---|---|---|
| POST | /api/v1/auth/register | Регистрация |
| POST | /api/v1/auth/login | Логин → JWT токен |
| GET  | /api/v1/auth/me | Текущий пользователь |
| DELETE | /api/v1/auth/me | Мягкое удаление аккаунта |

### Фильмы и сериалы (требуют JWT)
| Метод | URL | Описание |
|---|---|---|
| GET | /api/v1/titles | Список с фильтрами и пагинацией |
| GET | /api/v1/titles/{show_id} | Детальная страница |
| GET | /api/v1/titles/genres | Все жанры |
| GET | /api/v1/titles/countries | Все страны |
| GET | /api/v1/titles/ratings | Все рейтинги |

### Параметры фильтрации для GET /api/v1/titles
```
search        - поиск по названию, режиссёру, актёрам
type          - Movie / TV Show
genre         - название жанра
country       - название страны
rating        - TV-MA, PG-13, R и т.д.
release_year  - год выпуска
page          - номер страницы (default: 1)
page_size     - размер страницы (default: 20)
```

---

## Soft Delete

При удалении аккаунта (`DELETE /api/v1/auth/me`) пользователь **не удаляется из БД**.
Вместо этого выставляются поля:
- `is_deleted = true`
- `deleted_at = <текущее время>`

Все запросы автоматически фильтруют `WHERE is_deleted = false`.

---

## Разработка без Docker

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```
