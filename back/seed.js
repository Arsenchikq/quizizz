require('dotenv').config();
const mongoose = require('mongoose');
const Test     = require('./models/Test');

const tests = [
  {
    title: 'Основы React',
    difficulty: 'easy',
    category: 'Frontend',
    description: 'Компоненты, пропсы, хуки useState и useEffect — база для каждого React-разработчика.',
    isPublished: true,
    questions: [
      { text: 'Что возвращает хук useState?', options: ['Объект с методами', 'Массив [state, setState]', 'Число', 'Promise'], correctIndex: 1 },
      { text: 'Куда монтируется React-приложение?', options: ['В <head>', 'В <body>', 'В div с id="root"', 'В <script>'], correctIndex: 2 },
      { text: 'Как передать данные дочернему компоненту?', options: ['Через state', 'Через Context', 'Через props', 'Через Redux'], correctIndex: 2 },
      { text: 'Зачем нужен атрибут key в списках?', options: ['Для стилизации', 'Для оптимизации рендеринга', 'Это обязательный HTML-атрибут', 'Для сортировки'], correctIndex: 1 },
      { text: 'Что такое JSX?', options: ['HTML внутри JS', 'Расширение Java', 'JSON Extended', 'Библиотека CSS'], correctIndex: 0 },
      { text: 'Когда вызывается useEffect с пустым массивом зависимостей?', options: ['При каждом рендере', 'Только при монтировании', 'Только при размонтировании', 'Никогда'], correctIndex: 1 },
    ],
  },
  {
    title: 'Python — Базовый уровень',
    difficulty: 'easy',
    category: 'Backend',
    description: 'Синтаксис, типы данных, функции и встроенные методы Python.',
    isPublished: true,
    questions: [
      { text: 'Как вывести текст в консоль?', options: ['console.log()', 'echo()', 'print()', 'write()'], correctIndex: 2 },
      { text: 'Какой тип данных является неизменяемым?', options: ['List', 'Dictionary', 'Set', 'Tuple'], correctIndex: 3 },
      { text: 'Как объявить функцию?', options: ['func name():', 'def name():', 'function name():', 'fn name():'], correctIndex: 1 },
      { text: 'Результат выражения 2 ** 3?', options: ['6', '5', '8', '9'], correctIndex: 2 },
      { text: 'Что возвращает len("hello")?', options: ['4', '5', '6', 'Error'], correctIndex: 1 },
      { text: 'Что делает метод .strip()?', options: ['Удаляет символы из середины', 'Убирает пробелы по краям', 'Разделяет строку', 'Преобразует в список'], correctIndex: 1 },
    ],
  },
  {
    title: 'SQL & Базы данных',
    difficulty: 'hard',
    category: 'Database',
    description: 'SELECT, JOIN, агрегатные функции, индексы и ключи реляционных баз данных.',
    isPublished: true,
    questions: [
      { text: 'Какая команда получает данные из таблицы?', options: ['GET', 'FETCH', 'SELECT', 'PULL'], correctIndex: 2 },
      { text: 'Как полностью удалить таблицу?', options: ['DELETE TABLE', 'DROP TABLE', 'REMOVE TABLE', 'CLEAR TABLE'], correctIndex: 1 },
      { text: 'Что такое Primary Key?', options: ['Уникальный идентификатор строки', 'Внешний ключ', 'Зашифрованное поле', 'Индекс таблицы'], correctIndex: 0 },
      { text: 'Какой JOIN возвращает все строки левой таблицы?', options: ['INNER JOIN', 'RIGHT JOIN', 'LEFT JOIN', 'CROSS JOIN'], correctIndex: 2 },
      { text: 'Какая функция считает сумму значений?', options: ['COUNT()', 'AVG()', 'SUM()', 'TOTAL()'], correctIndex: 2 },
      { text: 'Что делает оператор HAVING?', options: ['Фильтрует строки до группировки', 'Фильтрует группы после GROUP BY', 'Сортирует результат', 'Объединяет таблицы'], correctIndex: 1 },
    ],
  },
  {
    title: 'JavaScript Pro',
    difficulty: 'hard',
    category: 'Frontend',
    description: 'Замыкания, прототипы, асинхронность, Event Loop и особенности языка.',
    isPublished: true,
    questions: [
      { text: 'Что выведет typeof null?', options: ['"null"', '"undefined"', '"object"', '"number"'], correctIndex: 2 },
      { text: 'Какой метод добавляет элемент в конец массива?', options: ['pop()', 'push()', 'shift()', 'unshift()'], correctIndex: 1 },
      { text: 'Что такое Promise?', options: ['Синхронная функция', 'Объект для работы с асинхронными операциями', 'Массив', 'Тип данных'], correctIndex: 1 },
      { text: "Чему равно '2' + 2?", options: ['"4"', '"22"', 'NaN', 'Error'], correctIndex: 1 },
      { text: 'Как остановить всплытие события?', options: ['event.stopPropagation()', 'event.preventDefault()', 'event.stop()', 'return false'], correctIndex: 0 },
      { text: 'Что такое замыкание?', options: ['Функция без параметров', 'Функция с доступом к переменным внешней области видимости', 'Стрелочная функция', 'Рекурсивная функция'], correctIndex: 1 },
    ],
  },
  {
    title: 'Node.js & Express',
    difficulty: 'hard',
    category: 'Backend',
    description: 'Маршруты, middleware, HTTP-методы и архитектура REST API на Express.js.',
    isPublished: true,
    questions: [
      { text: 'Что такое middleware в Express?', options: ['База данных', 'Функция обработки запроса с доступом к req, res, next', 'Маршрут', 'HTML-шаблон'], correctIndex: 1 },
      { text: 'Какой метод запускает сервер?', options: ['app.start()', 'app.listen()', 'app.run()', 'server.begin()'], correctIndex: 1 },
      { text: 'Что содержит req.body?', options: ['Параметры URL', 'Тело HTTP-запроса', 'Заголовки запроса', 'Cookie'], correctIndex: 1 },
      { text: 'HTTP-статус "Ресурс не найден"?', options: ['200', '401', '404', '500'], correctIndex: 2 },
      { text: 'Что делает next() в middleware?', options: ['Завершает обработку запроса', 'Передаёт управление следующему обработчику', 'Перенаправляет запрос', 'Логирует данные'], correctIndex: 1 },
      { text: 'Какой пакет нужен для переменных окружения?', options: ['config', 'env-vars', 'dotenv', 'process'], correctIndex: 2 },
    ],
  },
  {
    title: 'MongoDB & Mongoose',
    difficulty: 'medium',
    category: 'Database',
    description: 'Документо-ориентированная БД: схемы, модели, CRUD-операции и агрегации.',
    isPublished: true,
    questions: [
      { text: 'Что является аналогом таблицы в MongoDB?', options: ['Document', 'Collection', 'Schema', 'Index'], correctIndex: 1 },
      { text: 'Какой метод Mongoose создаёт документ?', options: ['Model.insert()', 'Model.create()', 'Model.add()', 'Model.save()'], correctIndex: 1 },
      { text: 'Как найти документ по _id?', options: ['Model.find(_id)', 'Model.findById(id)', 'Model.search(id)', 'Model.get(id)'], correctIndex: 1 },
      { text: 'Что делает метод .lean()?', options: ['Очищает коллекцию', 'Возвращает plain JS объект', 'Сжимает данные', 'Индексирует поле'], correctIndex: 1 },
      { text: 'Какой оператор используется для обновления поля?', options: ['$update', '$set', '$change', '$modify'], correctIndex: 1 },
    ],
  },
  {
    title: 'CSS & Flexbox/Grid',
    difficulty: 'easy',
    category: 'Frontend',
    description: 'Позиционирование, Flexbox, CSS Grid и современные возможности стилизации.',
    isPublished: true,
    questions: [
      { text: 'Какое значение display создаёт flex-контейнер?', options: ['block', 'inline', 'flex', 'grid'], correctIndex: 2 },
      { text: 'Как центрировать элемент по горизонтали и вертикали в Flexbox?', options: ['text-align: center', 'align-items: center + justify-content: center', 'margin: auto', 'position: center'], correctIndex: 1 },
      { text: 'Что делает grid-template-columns?', options: ['Задаёт количество строк', 'Определяет количество и размер столбцов', 'Управляет отступами', 'Задаёт цвет фона'], correctIndex: 1 },
      { text: 'Какое свойство управляет порядком flex-элементов?', options: ['z-index', 'order', 'flex-grow', 'align-self'], correctIndex: 1 },
      { text: 'Что такое CSS Custom Properties?', options: ['Переменные препроцессора', 'Переменные вида --name доступные в CSS', 'JavaScript переменные', 'SCSS переменные'], correctIndex: 1 },
    ],
  },
  {
    title: 'Git & Контроль версий',
    difficulty: 'easy',
    category: 'DevOps',
    description: 'Основные команды Git, работа с ветками, merge, rebase и pull requests.',
    isPublished: true,
    questions: [
      { text: 'Какая команда инициализирует репозиторий?', options: ['git start', 'git init', 'git create', 'git new'], correctIndex: 1 },
      { text: 'Как добавить все изменения в индекс?', options: ['git add *', 'git add .', 'git stage all', 'git commit --all'], correctIndex: 1 },
      { text: 'Что делает git pull?', options: ['Отправляет изменения на сервер', 'Загружает изменения с удалённого репозитория', 'Создаёт ветку', 'Удаляет коммит'], correctIndex: 1 },
      { text: 'Как создать и переключиться на новую ветку?', options: ['git branch new', 'git checkout -b new', 'git switch new', 'git new branch'], correctIndex: 1 },
      { text: 'Что такое merge conflict?', options: ['Ошибка синтаксиса', 'Конфликт при слиянии веток с изменениями одних строк', 'Ошибка сервера', 'Удалённая ветка не найдена'], correctIndex: 1 },
    ],
  },
  {
    title: 'TypeScript Основы',
    difficulty: 'medium',
    category: 'Frontend',
    description: 'Типы, интерфейсы, дженерики и отличия TypeScript от JavaScript.',
    isPublished: true,
    questions: [
      { text: 'Как указать тип переменной?', options: ['=>', '::', ':', 'as'], correctIndex: 2 },
      { text: 'Что такое interface в TypeScript?', options: ['Класс без реализации', 'Описание структуры объекта', 'Тип для функций', 'Абстрактный класс'], correctIndex: 1 },
      { text: 'Чем type отличается от interface?', options: ['Ничем', 'type нельзя расширить', 'type гибче — может описывать union, tuple и примитивы', 'interface работает быстрее'], correctIndex: 2 },
      { text: 'Что делает оператор as?', options: ['Приводит тип', 'Сравнивает типы', 'Создаёт тип', 'Удаляет тип'], correctIndex: 0 },
      { text: 'Что такое generic тип?', options: ['Универсальный тип-параметр', 'Базовый тип', 'Тип по умолчанию', 'Импортированный тип'], correctIndex: 0 },
    ],
  },
  {
    title: 'REST API & HTTP',
    difficulty: 'medium',
    category: 'Backend',
    description: 'HTTP-методы, статусы, заголовки, архитектура REST и принципы проектирования API.',
    isPublished: true,
    questions: [
      { text: 'Какой HTTP-метод используется для создания ресурса?', options: ['GET', 'POST', 'PUT', 'DELETE'], correctIndex: 1 },
      { text: 'Что означает статус 401?', options: ['Ресурс не найден', 'Нет авторизации', 'Запрос некорректен', 'Сервер упал'], correctIndex: 1 },
      { text: 'Чем PUT отличается от PATCH?', options: ['PUT быстрее', 'PUT заменяет ресурс целиком, PATCH — частично', 'PATCH создаёт ресурс', 'Они одинаковые'], correctIndex: 1 },
      { text: 'Что такое CORS?', options: ['Тип шифрования', 'Механизм разрешения кросс-доменных запросов', 'Формат данных', 'Протокол передачи'], correctIndex: 1 },
      { text: 'В каком заголовке передаётся JWT?', options: ['Content-Type', 'Authorization', 'Accept', 'X-Token'], correctIndex: 1 },
    ],
  },
  {
    title: 'Алгоритмы и структуры данных',
    difficulty: 'hard',
    category: 'Алгоритмы',
    description: 'Сложность алгоритмов, сортировки, стеки, очереди и базовые структуры данных.',
    isPublished: true,
    questions: [
      { text: 'Какова сложность бинарного поиска?', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], correctIndex: 1 },
      { text: 'Что такое стек (Stack)?', options: ['FIFO структура', 'LIFO структура', 'Двусвязный список', 'Хеш-таблица'], correctIndex: 1 },
      { text: 'Сложность сортировки пузырьком в худшем случае?', options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'], correctIndex: 2 },
      { text: 'Какая структура используется для BFS?', options: ['Стек', 'Очередь', 'Дерево', 'Хеш-таблица'], correctIndex: 1 },
      { text: 'Что такое хеш-коллизия?', options: ['Ошибка компилятора', 'Ситуация когда разные ключи дают одинаковый хеш', 'Переполнение стека', 'Бесконечная рекурсия'], correctIndex: 1 },
      { text: 'Какой алгоритм сортировки самый быстрый в среднем?', options: ['Bubble Sort', 'Merge Sort', 'Quick Sort', 'Insertion Sort'], correctIndex: 2 },
    ],
  },
  {
    title: 'Безопасность веб-приложений',
    difficulty: 'hard',
    category: 'DevOps',
    description: 'XSS, CSRF, SQL-инъекции, JWT, HTTPS и основы защиты веб-приложений.',
    isPublished: true,
    questions: [
      { text: 'Что такое XSS-атака?', options: ['Перехват трафика', 'Внедрение вредоносного скрипта в страницу', 'DDoS-атака', 'Взлом пароля'], correctIndex: 1 },
      { text: 'Для чего используется bcrypt?', options: ['Шифрование трафика', 'Хеширование паролей', 'Генерация токенов', 'Сжатие данных'], correctIndex: 1 },
      { text: 'Что такое CSRF?', options: ['Межсайтовая подделка запроса', 'SQL-инъекция', 'XSS-атака', 'Брутфорс'], correctIndex: 0 },
      { text: 'Из скольких частей состоит JWT токен?', options: ['1', '2', '3', '4'], correctIndex: 2 },
      { text: 'Что такое SQL-инъекция?', options: ['Медленный SQL-запрос', 'Внедрение вредоносного SQL-кода через пользовательский ввод', 'Ошибка соединения с БД', 'Дублирование данных'], correctIndex: 1 },
    ],
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/testify');
    console.log('✅  MongoDB connected');

    const existing = await Test.countDocuments();
    if (existing > 0) {
      console.log(`ℹ️   Tests already seeded (${existing} found). Skipping.`);
      console.log('    To reseed run: node seed.js --force');
      if (!process.argv.includes('--force')) {
        await mongoose.disconnect();
        return;
      }
      await Test.deleteMany({});
      console.log('🗑️   Old tests removed');
    }

    const inserted = await Test.insertMany(tests);
    console.log(`✅  Seeded ${inserted.length} tests into MongoDB`);
  } catch (err) {
    console.error('❌  Seed error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌  MongoDB disconnected');
  }
}

seed();
