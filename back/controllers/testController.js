const Test = require('../models/Test');
const User = require('../models/User');

// ── GET /api/tests ────────────────────────────────────────────────────────────
exports.getAll = async (req, res) => {
  try {
    const { difficulty, category, q } = req.query;
    const filter = { isPublished: true };

    if (difficulty) filter.difficulty = difficulty;
    if (category)   filter.category   = category;
    if (q)          filter.title      = { $regex: q, $options: 'i' };

    const tests = await Test.find(filter)
      .select('-questions.correctIndex')   // не отдаём правильные ответы
      .sort('-createdAt')
      .lean();

    res.json({ tests, count: tests.length });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// ── GET /api/tests/:id ────────────────────────────────────────────────────────
exports.getOne = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id).lean();
    if (!test) return res.status(404).json({ message: 'Тест не найден' });

    // Убираем правильные ответы перед отправкой клиенту
    const safe = {
      ...test,
      questions: test.questions.map(({ text, options, _id }) => ({
        _id, text, options,
      })),
    };

    res.json({ test: safe });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// ── POST /api/tests ───────────────────────────────────────────────────────────
exports.create = async (req, res) => {
  try {
    const { title, description, category, difficulty, questions, timeLimitMin } = req.body;

    if (!title || !category || !questions?.length) {
      return res.status(400).json({ message: 'Укажите название, категорию и вопросы' });
    }

    const test = await Test.create({
      title,
      description,
      category,
      difficulty,
      questions,
      timeLimitMin,
      author: req.user._id,
    });

    res.status(201).json({ test });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const msg = Object.values(err.errors).map((e) => e.message).join(', ');
      return res.status(400).json({ message: msg });
    }
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// ── PUT /api/tests/:id ────────────────────────────────────────────────────────
exports.update = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ message: 'Тест не найден' });

    if (test.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Нет прав для редактирования' });
    }

    const allowed = ['title', 'description', 'category', 'difficulty', 'questions', 'isPublished', 'timeLimitMin'];
    allowed.forEach((f) => {
      if (req.body[f] !== undefined) test[f] = req.body[f];
    });

    await test.save();
    res.json({ test });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// ── DELETE /api/tests/:id ─────────────────────────────────────────────────────
exports.remove = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ message: 'Тест не найден' });

    const isOwner = test.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Нет прав для удаления' });
    }

    await test.deleteOne();
    res.json({ message: 'Тест удалён' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// ── POST /api/tests/:id/submit ────────────────────────────────────────────────
exports.submit = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ message: 'Тест не найден' });

    const { answers } = req.body; // [{ questionId, selectedIndex }]
    if (!answers?.length) {
      return res.status(400).json({ message: 'Передайте массив answers' });
    }

    let score = 0;
    const details = test.questions.map((q) => {
      const ans     = answers.find((a) => a.questionId === q._id.toString());
      const correct = ans?.selectedIndex === q.correctIndex;
      if (correct) score++;
      return {
        questionId:    q._id,
        text:          q.text,
        correctIndex:  q.correctIndex,
        selectedIndex: ans?.selectedIndex ?? null,
        correct,
      };
    });

    // Сохранить результат в историю пользователя
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        completedTests: {
          $each:     [{ test: test._id, score, maxScore: test.questions.length }],
          $position: 0,
          $slice:    50,
        },
      },
    });

    res.json({
      score,
      maxScore: test.questions.length,
      percent:  Math.round((score / test.questions.length) * 100),
      details,
    });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};
