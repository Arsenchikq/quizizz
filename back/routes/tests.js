const express = require('express');
const auth    = require('../middleware/auth');
const {
  getAll,
  getOne,
  create,
  update,
  remove,
  submit,
} = require('../controllers/testController');

const router = express.Router();

// Публичные маршруты
router.get('/',    getAll);
router.get('/:id', getOne);

// Защищённые маршруты (требуется JWT)
router.post  ('/',           auth, create);
router.put   ('/:id',        auth, update);
router.delete('/:id',        auth, remove);
router.post  ('/:id/submit', auth, submit);

module.exports = router;
