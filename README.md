# Netflix Browser

Полноценное приложение для просмотра и фильтрации Netflix-каталога.

**Стек:** FastAPI · SQLAlchemy · PostgreSQL · pandas · React · Docker

---

## О датасете

Датасет — **Netflix Movies and TV Shows** (публично доступен на [Kaggle](https://www.kaggle.com/datasets/shivamb/netflix-shows)).

Содержит ~6 200 записей о фильмах и сериалах, доступных на Netflix по состоянию на 2021 год.

| Колонка | Тип | Описание |
|---|---|---|
| `show_id` | string | Уникальный ID тайтла |
| `type` | string | Тип контента: `Movie` или `TV Show` |
| `title` | string | Название |
| `director` | string | Режиссёр(ы), через запятую. Может быть пустым |
| `cast` | string | Актёрский состав, через запятую. Может быть пустым |
| `country` | string | Страна(ы) производства, через запятую |
| `date_added` | string | Дата добавления на Netflix (напр. `September 9, 2019`) |
| `release_year` | int | Год выхода |
| `rating` | string | Возрастной рейтинг: `TV-MA`, `PG-13`, `R`, `TV-Y` и др. |
| `duration` | string | Длительность: `90 min` для фильмов, `1 Season` для сериалов |
| `listed_in` | string | Жанры, через запятую (напр. `Comedies, Dramas`) |
| `description` | string | Краткое описание |

**Особенности:**
- Поля `director`, `cast`, `country` могут содержать несколько значений через запятую — ETL нормализует `country` и `listed_in` в отдельные таблицы
- Около 10–15% записей имеют пустые поля `director` и/или `country`
- `show_id` хранится как строка для надёжности при импорте

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

## Ручная установка (без Docker)

### 1. Установка PostgreSQL

Убедись, что PostgreSQL установлен и запущен:
- **Windows:** скачай с [postgresql.org](https://www.postgresql.org/download/windows/)
- **macOS:** `brew install postgresql@15 && brew services start postgresql@15`
- **Linux:** `sudo apt install postgresql postgresql-contrib && sudo systemctl start postgresql`

Создай базу данных:
```bash
psql -U postgres
CREATE DATABASE netflix_db;
CREATE USER netflix_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE netflix_db TO netflix_user;
\q
```

### 2. Настройка окружения

```bash
cp .env.example .env
```

Отредактируй `.env`, укажи параметры подключения к БД:
```env
DATABASE_URL=postgresql://netflix_user:your_password@localhost:5432/netflix_db
SECRET_KEY=your-secret-key-here
```

### 3. Backend

Можно установить зависимости через **pip** или **uv** (быстрее):

**Вариант 1: pip**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Вариант 2: uv** (рекомендуется)
```bash
cd backend
# Установка uv (если ещё не установлен)
# macOS/Linux: curl -LsSf https://astral.sh/uv/install.sh | sh
# Windows: powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

uv pip install -r requirements.txt
# или через pyproject.toml:
uv sync

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend будет доступен на http://localhost:8000

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend будет доступен на http://localhost:3000

### 5. Загрузка данных (ETL)

Положи `netflix.csv` в папку `etl/`, затем запусти скрипт загрузки:

```bash
cd etl
python load.py --csv netflix.csv
```

Скрипт:
- Создаст все необходимые таблицы
- Загрузит данные из CSV
- Нормализует жанры и страны в отдельные таблицы
- Выведет статистику загрузки

**Примечание:** убедись, что переменная `DATABASE_URL` в `.env` корректна перед запуском ETL.

## ER Диаграмма

![ER Диаграмма](https://drive.google.com/uc?export=view&id=1uDvTZI9TDAZv1vPoVgun67UO6QXC7CBc)