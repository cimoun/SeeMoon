# SeeMoon - Современное ToDo приложение

Веб-приложение для управления задачами, заметками и привычками с аналитикой продуктивности.

## Возможности

- **Управление задачами** - создание, редактирование, приоритизация и отслеживание задач
- **Заметки** - Markdown редактор с превью и цветовой кодировкой
- **Трекер привычек** - ежедневное отслеживание привычек с прогресс-баром
- **Аналитика** - диаграммы продуктивности, статистика выполнения
- **Профиль пользователя** - настройки аккаунта, смена пароля
- **Аутентификация** - регистрация и авторизация с JWT токенами

## Технологии

### Frontend
- React 19 + Vite
- React Router v7
- Zustand (state management)
- Tailwind CSS
- Recharts (диаграммы)
- Lucide React (иконки)

### Backend
- Node.js + Express
- SQLite (better-sqlite3)
- JWT аутентификация
- bcrypt (хеширование паролей)

## Установка

```bash
# Клонирование репозитория
git clone <repo-url>
cd SeeMoon

# Установка зависимостей
npm install

# Копирование конфигурации
cp .env.example .env
```

## Запуск

```bash
# Режим разработки (frontend + backend)
npm run dev

# Только frontend
npm run dev:client

# Только backend
npm run dev:server

# Продакшн сборка
npm run build

# Запуск продакшн сервера
npm start
```

## Структура проекта

```
SeeMoon/
├── server/                 # Backend
│   ├── db/                 # База данных
│   │   └── database.js     # SQLite инициализация
│   ├── middleware/         # Middleware
│   │   └── auth.js         # JWT аутентификация
│   └── routes/             # API маршруты
│       ├── auth.js         # Регистрация/вход
│       ├── tasks.js        # CRUD задач
│       ├── notes.js        # CRUD заметок
│       ├── habits.js       # Трекер привычек
│       ├── analytics.js    # Статистика
│       └── profile.js      # Профиль
├── src/                    # Frontend
│   ├── api/                # API клиент
│   ├── components/         # React компоненты
│   │   ├── Auth/           # Авторизация
│   │   ├── Dashboard/      # Главная страница
│   │   ├── Tasks/          # Задачи
│   │   ├── Notes/          # Заметки
│   │   ├── Habits/         # Привычки
│   │   ├── Analytics/      # Аналитика
│   │   ├── Profile/        # Профиль
│   │   ├── Layout/         # Лейаут
│   │   └── UI/             # UI компоненты
│   └── stores/             # Zustand сторы
└── public/                 # Статические файлы
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/auth/me` - Текущий пользователь

### Tasks
- `GET /api/tasks` - Список задач
- `POST /api/tasks` - Создать задачу
- `PUT /api/tasks/:id` - Обновить задачу
- `DELETE /api/tasks/:id` - Удалить задачу

### Notes
- `GET /api/notes` - Список заметок
- `POST /api/notes` - Создать заметку
- `PUT /api/notes/:id` - Обновить заметку
- `DELETE /api/notes/:id` - Удалить заметку

### Habits
- `GET /api/habits` - Список привычек
- `POST /api/habits` - Создать привычку
- `PUT /api/habits/:id` - Обновить привычку
- `DELETE /api/habits/:id` - Удалить привычку
- `POST /api/habits/:id/log` - Отметить выполнение

### Analytics
- `GET /api/analytics/overview` - Обзор статистики
- `GET /api/analytics/tasks/timeline` - Таймлайн задач
- `GET /api/analytics/weekly` - Недельная статистика

### Profile
- `GET /api/profile` - Получить профиль
- `PUT /api/profile` - Обновить профиль
- `PUT /api/profile/password` - Сменить пароль
- `DELETE /api/profile` - Удалить аккаунт

## Скриншоты

### Dashboard
Главная страница с обзором задач, привычек и статистики.

### Tasks
Управление задачами с фильтрами по статусу и приоритету.

### Notes
Markdown редактор с превью и закреплёнными заметками.

### Habits
Трекер привычек с прогресс-баром и ежедневным отслеживанием.

### Analytics
Диаграммы продуктивности и статистика за период.

## Лицензия

MIT
