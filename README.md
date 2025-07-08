
# Graditude

**Graditude** — это веб-сервис для студентов и преподавателей, где преподаватели создают курсовые или дипломные проекты (coursework), а студенты выбирают их и выполняют. Сервис реализован с помощью **NestJS** (backend) и **Next.js** (frontend) на TypeScript.

---

## Основные возможности

* **Регистрация и аутентификация** преподавателей и студентов (JWT).
* **Управление проектами**:
  * Преподаватель создаёт/редактирует/удаляет курсовую или дипломную работу.
  * Студент просматривает список доступных тем и выбирает понравившуюся.
* **Рабочий процесс**:
  * Студент создаёт план работ по выбранной теме и отмечает статус задач.
  * Встроенный **чат** на Socket.io для оперативной связи со своим преподавателем.
  * Загрузка файлов (Multer), экспорт результатов в Excel (ExcelJS), интеграция с Google API.
* **Административная панель** для преподавателей: мониторинг прогресса студентов, просмотр статистики.

---

## Стек технологий

### Backend
- NestJS + TypeScript
- TypeORM + PostgreSQL
- JWT (аутентификация)
- Multer (загрузка файлов)
- ExcelJS (экспорт)
- Socket.io (чат)
- Google API (календарь)

### Frontend
- Next.js + TypeScript
- Tailwind CSS
- Axios
- React Hook Form
- Socket.io-client

---

## Установка и запуск

### 1. Клонирование репозитория

```bash
git clone https://github.com/ShittyBoyBuda/Graditude.git
cd Graditude
```

### 2. Backend

```bash
cd backend-diploma
npm install
```

Создайте файл `.env` по образцу:

```ini
# .env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=graditude_db

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=3600s

# Google API (если используется)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

Запустите сервер:

```bash
npm run start:dev
```

Доступно по адресу: `http://localhost:3000`.

---

### 3. Frontend

```bash
cd ../frontend-diploma
npm install
```

Создайте файл `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Запустите клиент:

```bash
npm run dev
```

Frontend будет доступен по адресу: `http://localhost:3001` (или `3000`, если не занят).

---

## Примеры API

### Аутентификация

```http
POST /auth/login
POST /auth/register
```

### Courseworks

```http
GET /coursework
POST /coursework
PUT /coursework/:id
DELETE /coursework/:id
```

### Задачи и план

```http
GET /tasks?courseworkId=...
POST /tasks
PATCH /tasks/:id
```

### Чат (WebSocket)

- Namespace: `/chat`
- Подключение через Socket.io

---

## Запуск в продакшене

### Backend

```bash
cd backend-diploma
npm run build
npm run start:prod
```

### Frontend

```bash
cd frontend-diploma
npm run build
npm start
```

Для деплоя рекомендуется использовать Render, Railway, Vercel, либо Docker-связку с nginx.
