<div align="center">

# ◆ SMARTTEST

### Платформа тестирования знаний — полный стек на MERN

[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)](https://jwt.io)

<br/>

> Строгий интерфейс. Чистая архитектура.  
> Full-stack платформа для создания и прохождения тестов с JWT-аутентификацией,  
> защищёнными маршрутами и MongoDB-хранилищем.

<br/>

</div>

---

## ✦ Что это такое?

SmartTest — образовательная платформа для проверки знаний. Пользователи могут регистрироваться, проходить готовые тесты из каталога или создавать собственные. Каждый результат сохраняется в истории профиля.

Всё связано: React-фронтенд → Express REST API → MongoDB. Тест создаётся пользователем, попадает в каталог, проходится другим пользователем — весь цикл обрабатывается сервером.

---

## ✦ Архитектура системы

```
  Пользователь
       │
       ▼
  React (Vite)
  └── AuthContext (JWT)
  └── Pages: Home / Catalog / TestRoom / Profile / ...
       │
       ▼
  Express REST API  (:5000)
       │
  ┌────┴────────────────┐
  │                     │
Mongoose            Middleware
(MongoDB)           └── auth.js (JWT verify)
  │
  ├── User
  └── Test
```

---

## ✦ Технологический стек

| Слой | Технология |
|------|-----------|
| Frontend | React 19, Vite, React Router v7 |
| Состояние | Context API (AuthContext) |
| Backend | Node.js, Express.js |
| База данных | MongoDB, Mongoose |
| Аутентификация | JWT (jsonwebtoken), bcryptjs |
| Окружение | dotenv, cors |
| Разработка | nodemon |

---

## ✦ Функциональность

### 📚 Каталог тестов
- Список всех опубликованных тестов
- Фильтрация по сложности: Легкий / Сложный / Хардкор
- Поиск по названию и категории
- Карточки с метаданными: кол-во вопросов, категория, сложность

### 🔐 Аутентификация
- Регистрация и вход с JWT-токенами (срок 7 дней)
- Защищённые маршруты через `PrivateRoute`
- Токен хранится в `localStorage`, проверяется при каждом запросе
- Fallback на localStorage при недоступном сервере

### 📝 Конструктор тестов
- Создание теста с названием, описанием, категорией, сложностью
- Динамическое добавление / удаление вопросов
- 4 варианта ответа, выбор правильного через radio
- Валидация всех полей перед сохранением

### 🎯 Прохождение теста
- Вопрос за вопросом с прогресс-баром
- Мгновенный reveal правильного / неправильного ответа
- Экран результата с процентом и баллами
- Результат сохраняется в историю пользователя

### 👤 Профиль
- История прохождений (тест / балл / дата)
- Список созданных тестов
- Редактирование имени, bio, аватара
- Смена пароля на странице безопасности

---

## ✦ Поток прохождения теста

```
  [Пользователь открывает каталог]
           │
     выбирает тест
           │
      TestRoom — вопрос 1
           │
      выбирает ответ → reveal
           │
      следующий вопрос
           │
        ...
           │
      экран результата
           │
  [POST /api/tests/:id/submit]  ←── сохраняет в User.completedTests
           │
      redirect → /profile
```

---

## ✦ REST API

### Пользователи `/api/users`

| Метод | Маршрут | Доступ | Описание |
|-------|---------|--------|----------|
| `POST` | `/api/users/register` | Публичный | Регистрация |
| `POST` | `/api/users/login` | Публичный | Вход, возвращает JWT |
| `GET` | `/api/users/me` | 🔒 JWT | Получить свой профиль |
| `PATCH` | `/api/users/me` | 🔒 JWT | Обновить профиль |
| `PATCH` | `/api/users/password` | 🔒 JWT | Сменить пароль |

### Тесты `/api/tests`

| Метод | Маршрут | Доступ | Описание |
|-------|---------|--------|----------|
| `GET` | `/api/tests` | Публичный | Список тестов (фильтры: difficulty, category, q) |
| `GET` | `/api/tests/:id` | Публичный | Один тест (без правильных ответов) |
| `POST` | `/api/tests` | 🔒 JWT | Создать тест |
| `PUT` | `/api/tests/:id` | 🔒 JWT (автор) | Обновить тест |
| `DELETE` | `/api/tests/:id` | 🔒 JWT (автор/admin) | Удалить тест |
| `POST` | `/api/tests/:id/submit` | 🔒 JWT | Сдать тест, получить результат |

---

## ✦ Модели данных

<details>
<summary><b>User</b></summary>

```js
{
  name:     String,           // имя пользователя
  email:    String,           // уникальный, lowercase
  password: String,           // bcrypt-хеш (не возвращается в запросах)
  role:     String,           // 'user' | 'admin'
  completedTests: [{
    test:     ObjectId,       // ref: Test
    score:    Number,
    maxScore: Number,
    passedAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```
</details>

<details>
<summary><b>Test</b></summary>

```js
{
  title:        String,
  description:  String,
  category:     String,       // Frontend | Backend | Database | ...
  difficulty:   String,       // easy | medium | hard
  questions: [{
    text:         String,
    options:      [String],   // 4 варианта
    correctIndex: Number      // 0-based, скрывается при GET
  }],
  author:       ObjectId,     // ref: User
  isPublished:  Boolean,
  timeLimitMin: Number,       // 0 = без ограничения
  createdAt:    Date,
  updatedAt:    Date
}
```
</details>

---

## ✦ Структура проекта

```
project/
│
├── front/                        # React-фронтенд
│   ├── index.html                # Bootstrap Icons + Google Fonts
│   ├── vite.config.js            # proxy → localhost:5000
│   └── src/
│       ├── App.jsx
│       ├── App.css               # Design system (CSS variables)
│       ├── main.jsx
│       ├── components/
│       │   ├── Layout.jsx        # Header / Footer / Nav
│       │   └── PrivateRoute.jsx
│       ├── context/
│       │   └── AuthContext.jsx   # JWT + localStorage fallback
│       ├── data/
│       │   └── testsData.js      # Начальные тесты (seeding)
│       └── pages/
│           ├── Home.jsx
│           ├── Login.jsx
│           ├── Register.jsx
│           ├── TestsList.jsx
│           ├── TestRoom.jsx
│           ├── CreateTest.jsx
│           ├── Profile.jsx
│           ├── Security.jsx
│           └── NotFound.jsx
│
└── back/                         # Express-бэкенд
    ├── config/
    │   └── db.js                 # Подключение MongoDB
    ├── controllers/
    │   ├── authController.js     # Бизнес-логика auth
    │   └── testController.js     # Бизнес-логика тестов
    ├── middleware/
    │   └── auth.js               # JWT verify → req.user
    ├── models/
    │   ├── User.js               # bcrypt pre-save hook
    │   └── Test.js               # toQuiz() без ответов
    ├── routes/
    │   ├── auth.js               # /api/users/*
    │   └── tests.js              # /api/tests/*
    ├── .env.example
    ├── package.json
    ├── README.md
    └── server.js                 # Точка входа
```

---

## ✦ Быстрый старт

### Требования

- Node.js 18+
- MongoDB Community Server на `localhost:27017`
- (Опционально) MongoDB Compass для визуального управления данными

### 1. Распаковать проект

```bash
unzip smarttest_final.zip
cd project
```

### 2. Запустить MongoDB

**Windows:**
```cmd
mkdir C:\data\db
"C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" --dbpath "C:\data\db"
```

**macOS / Linux:**
```bash
mongod --dbpath ~/data/db
```

### 3. Запустить бэкенд

```bash
cd back
npm install
cp .env.example .env   # заполнить JWT_SECRET
npm run dev
```

Должны увидеть:
```
✅  MongoDB connected: localhost
🚀  Server running on http://localhost:5000
```

### 4. Запустить фронтенд

```bash
cd front
npm install
npm run dev
```

Открыть [http://localhost:5173](http://localhost:5173)

---

## ✦ Переменные окружения

Создать `back/.env` на основе `.env.example`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/testify
JWT_SECRET=замените_на_случайную_строку
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

---

## ✦ Тестирование в Postman

### Регистрация

```http
POST http://localhost:5000/api/users/register
Content-Type: application/json

{
  "name": "Arsen",
  "email": "arsen@test.com",
  "password": "123456"
}
```

**Ответ:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": "...", "name": "Arsen", "email": "arsen@test.com" }
}
```

### Вход

```http
POST http://localhost:5000/api/users/login
Content-Type: application/json

{
  "email": "arsen@test.com",
  "password": "123456"
}
```

### Защищённый запрос (JWT обязателен)

```http
GET http://localhost:5000/api/users/me
Authorization: Bearer <ваш_токен>
```

### Создать тест

```http
POST http://localhost:5000/api/tests
Authorization: Bearer <ваш_токен>
Content-Type: application/json

{
  "title": "Основы JavaScript",
  "description": "Базовый синтаксис и конструкции",
  "category": "Frontend",
  "difficulty": "easy",
  "questions": [
    {
      "text": "Что выведет typeof null?",
      "options": ["null", "undefined", "object", "number"],
      "correctIndex": 2
    }
  ]
}
```

### Сдать тест

```http
POST http://localhost:5000/api/tests/<id>/submit
Authorization: Bearer <ваш_токен>
Content-Type: application/json

{
  "answers": [
    { "questionId": "<_id вопроса>", "selectedIndex": 2 }
  ]
}
```

**Ответ:**
```json
{
  "score": 1,
  "maxScore": 1,
  "percent": 100,
  "details": [{ "correct": true, "correctIndex": 2, "selectedIndex": 2 }]
}
```

---

## ✦ Коды ответов

| Код | Значение |
|-----|----------|
| `200` | Успешный запрос |
| `201` | Ресурс создан |
| `400` | Некорректные данные запроса |
| `401` | Не авторизован / токен недействителен |
| `403` | Нет прав доступа |
| `404` | Ресурс не найден |
| `500` | Внутренняя ошибка сервера |

---

## ✦ Критерии ТЗ

| Критерий | Реализация |
|----------|-----------|
| Архитектура проекта | `config/` `controllers/` `routes/` `middleware/` `models/` |
| Работа с MongoDB | Mongoose, схемы с валидацией, индексы |
| CRUD операции | GET / POST / PUT / DELETE для тестов |
| Система авторизации | JWT + bcrypt, middleware `auth.js` |
| Интеграция с frontend | CORS, proxy в Vite, двойной режим (API / localStorage) |
| Качество кода | Контроллеры отделены от роутов, именованные функции |

---

<div align="center">

**SmartTest** — построен на React + Express + MongoDB

</div>
