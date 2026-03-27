import { createContext, useState, useEffect, useContext } from 'react';
import { initialTests } from '../data/testsData';

const AuthContext = createContext(null);
const API = 'http://localhost:5000/api';

// ── HTTP helpers ──────────────────────────────────────────────────────────────
async function http(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res  = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Ошибка ${res.status}`);
  return data;
}

const post  = (path, body, token) => http('POST',  path, body, token);
const patch = (path, body, token) => http('PATCH', path, body, token);

// ── Нормализовать тест из MongoDB → формат фронта ─────────────────────────────
function normalizeTest(t) {
  return {
    id:          t._id || t.id,
    title:       t.title,
    description: t.description || '',
    category:    t.category    || '',
    difficulty:  normalizeDiff(t.difficulty),
    questions:   (t.questions || []).map(q => ({
      id:      q._id || q.id,
      text:    q.text,
      options: q.options,
      correct: q.correctIndex ?? q.correct ?? 0,
    })),
    authorEmail: t.authorEmail || '',
  };
}

function normalizeDiff(d) {
  const map = { easy:'Легкий', medium:'Средний', hard:'Сложный', hard2:'Хардкор' };
  return map[d] || d || 'Легкий';
}

// ── Provider ──────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(null);
  const [tests,   setTests]   = useState(initialTests);
  const [loading, setLoading] = useState(true);

  // Загрузить сессию + тесты при старте
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser  = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (savedToken && savedUser) { setToken(savedToken); setUser(savedUser); }

    // Загружаем тесты из MongoDB
    fetch(`${API}/tests`)
      .then(r => r.json())
      .then(data => {
        if (data.tests && data.tests.length > 0) {
          setTests(data.tests.map(normalizeTest));
        }
        // если MongoDB недоступна — остаются initialTests
      })
      .catch(() => { /* оставляем initialTests */ })
      .finally(() => setLoading(false));
  }, []);

  // Сохранить пользователя и токен
  const _save = (u, t) => {
    setUser(u); setToken(t);
    localStorage.setItem('currentUser', JSON.stringify(u));
    localStorage.setItem('token', t);
  };

  // ── Регистрация ────────────────────────────────────────────────────────
  const register = async ({ username, email, password }) => {
    const data = await post('/users/register', { name: username, email, password });
    _save(data.user, data.token);
  };

  // ── Вход ───────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const data = await post('/users/login', { email, password });
    _save(data.user, data.token);
  };

  // ── Выход ──────────────────────────────────────────────────────────────
  const logout = () => {
    setUser(null); setToken(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
  };

  // ── Обновить профиль ───────────────────────────────────────────────────
  const updateProfile = async (formData) => {
    try {
      const data    = await patch('/users/me', formData, token);
      const updated = { ...user, ...data.user };
      setUser(updated);
      localStorage.setItem('currentUser', JSON.stringify(updated));
    } catch {
      const updated = { ...user, ...formData };
      setUser(updated);
      localStorage.setItem('currentUser', JSON.stringify(updated));
    }
  };

  // ── Сменить пароль ─────────────────────────────────────────────────────
  const updateSecurity = async (newPassword) => {
    try { await patch('/users/password', { password: newPassword }, token); } catch { /* ignore */ }
  };

  // ── Сохранить результат теста ──────────────────────────────────────────
  const saveTestResult = (testTitle, score, total) => {
    const result  = { date: new Date().toLocaleDateString(), title: testTitle, score, total };
    const updated = { ...user, results: [result, ...(user.results || [])] };
    setUser(updated);
    localStorage.setItem('currentUser', JSON.stringify(updated));
  };

  // ── Создать тест → сохранить в MongoDB ────────────────────────────────
  const addNewTest = async (newTest) => {
    // Конвертируем формат фронта → формат API
    const payload = {
      title:       newTest.title,
      description: newTest.description,
      category:    newTest.category,
      difficulty:  reverseDiff(newTest.difficulty),
      questions:   newTest.questions.map(q => ({
        text:         q.text,
        options:      q.options,
        correctIndex: q.correct,
      })),
    };

    try {
      // Сохранить в MongoDB
      const data = await post('/tests', payload, token);
      const saved = normalizeTest({ ...data.test, authorEmail: user.email });
      setTests(prev => [saved, ...prev]);
    } catch {
      // Fallback: только локально
      const local = { ...newTest, id: Date.now(), authorEmail: user.email };
      setTests(prev => [local, ...prev]);
    }
  };

  return (
    <AuthContext.Provider value={{
      user, token, tests, loading,
      login, register, logout,
      updateProfile, updateSecurity,
      saveTestResult, addNewTest,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

function reverseDiff(d) {
  const map = { 'Легкий':'easy', 'Средний':'medium', 'Сложный':'hard', 'Хардкор':'hard' };
  return map[d] || 'easy';
}

export const useAuth = () => useContext(AuthContext);
