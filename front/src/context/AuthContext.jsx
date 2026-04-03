import { createContext, useState, useEffect, useContext } from 'react';
import { initialTests } from '../data/testsData';

const AuthContext = createContext(null);
const API = 'http://localhost:5000/api';

async function http(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, {
    method, headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Ошибка ${res.status}`);
  return data;
}
const post  = (path, body, token) => http('POST',  path, body, token);
const patch = (path, body, token) => http('PATCH', path, body, token);

function normalizeTest(t) {
  return {
    id:          t._id || t.id,
    title:       t.title,
    description: t.description || '',
    category:    t.category    || '',
    difficulty:  normalizeDiff(t.difficulty),
    timeLimit:   t.timeLimit   || 0,
    questions:   (t.questions || []).map(q => ({
      id:      q._id || q.id,
      text:    q.text,
      type:    q.type || 'single',
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
function reverseDiff(d) {
  const map = { 'Легкий':'easy','Средний':'medium','Сложный':'hard','Хардкор':'hard' };
  return map[d] || 'easy';
}

/* ── Локальный реестр пользователей (для панели администратора) ── */
const getStoredUsers = () => JSON.parse(localStorage.getItem('smarttest_users') || '[]');
const syncUserReg = (u) => {
  const list = getStoredUsers();
  const idx  = list.findIndex(x => x.email === u.email);
  const entry = { email:u.email, username:u.username||u.name||'', role:u.role||'student',
    avatar:u.avatar||'', resultsCount:(u.results||[]).length, registeredAt:u.registeredAt||new Date().toISOString() };
  if (idx >= 0) list[idx] = { ...list[idx], ...entry };
  else          list.push(entry);
  localStorage.setItem('smarttest_users', JSON.stringify(list));
};

/* ── Глобальный рейтинг ── */
const getLb  = () => JSON.parse(localStorage.getItem('smarttest_lb') || '[]');
const pushLb = (e) => { const lb = getLb(); lb.push(e); localStorage.setItem('smarttest_lb', JSON.stringify(lb)); };

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(null);
  const [tests,   setTests]   = useState(initialTests);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser  = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (savedToken && savedUser) { setToken(savedToken); setUser(savedUser); }
    fetch(`${API}/tests`)
      .then(r => r.json())
      .then(data => { if (data.tests?.length > 0) setTests(data.tests.map(normalizeTest)); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const _save = (u, t) => {
    setUser(u); setToken(t);
    localStorage.setItem('currentUser', JSON.stringify(u));
    localStorage.setItem('token', t);
    syncUserReg(u);
  };

  const register = async ({ username, email, password, role }) => {
    const data = await post('/users/register', { name: username, email, password });
    const u = { ...data.user, role: role || 'student', registeredAt: new Date().toISOString() };
    _save(u, data.token);
  };

  const login = async (email, password) => {
    const data = await post('/users/login', { email, password });
    _save(data.user, data.token);
  };

  const logout = () => {
    setUser(null); setToken(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
  };

  const updateProfile = async (formData) => {
    try {
      const data    = await patch('/users/me', formData, token);
      const updated = { ...user, ...data.user };
      setUser(updated); localStorage.setItem('currentUser', JSON.stringify(updated)); syncUserReg(updated);
    } catch {
      const updated = { ...user, ...formData };
      setUser(updated); localStorage.setItem('currentUser', JSON.stringify(updated)); syncUserReg(updated);
    }
  };

  const updateSecurity = async (newPassword) => {
    try { await patch('/users/password', { password: newPassword }, token); } catch {}
  };

  const saveTestResult = (testTitle, score, total) => {
    const result  = { date: new Date().toLocaleDateString('ru-RU'), title: testTitle, score, total };
    const updated = { ...user, results: [result, ...(user.results || [])] };
    setUser(updated); localStorage.setItem('currentUser', JSON.stringify(updated)); syncUserReg(updated);
    pushLb({ userEmail:user.email, username:user.username||user.name||user.email,
      avatar:user.avatar, testTitle, score, total,
      percent: Math.round((score/total)*100), date: new Date().toISOString() });
  };

  const addNewTest = async (newTest) => {
    const payload = {
      title: newTest.title, description: newTest.description,
      category: newTest.category, difficulty: reverseDiff(newTest.difficulty),
      timeLimit: newTest.timeLimit || 0,
      questions: newTest.questions.map(q => ({
        text: q.text, type: q.type || 'single', options: q.options, correctIndex: q.correct,
      })),
    };
    try {
      const data  = await post('/tests', payload, token);
      const saved = normalizeTest({ ...data.test, authorEmail: user.email });
      setTests(prev => [saved, ...prev]);
    } catch {
      const local = { ...newTest, id: Date.now(), authorEmail: user.email };
      setTests(prev => [local, ...prev]);
    }
  };

  /* ── Администраторские функции ── */
  const getAllUsers = () => getStoredUsers();
  const updateUserRole = (email, role) => {
    const list = getStoredUsers();
    const idx  = list.findIndex(u => u.email === email);
    if (idx >= 0) { list[idx].role = role; localStorage.setItem('smarttest_users', JSON.stringify(list)); }
    if (user?.email === email) {
      const updated = { ...user, role };
      setUser(updated); localStorage.setItem('currentUser', JSON.stringify(updated));
    }
  };
  const deleteTestAdmin = (testId) => setTests(prev => prev.filter(t => String(t.id) !== String(testId)));
  const getLeaderboard  = () => {
    const byUser = {};
    getLb().forEach(e => {
      if (!byUser[e.userEmail]) byUser[e.userEmail] = { ...e, totalTests:0, totalScore:0, totalPossible:0 };
      byUser[e.userEmail].totalTests++;
      byUser[e.userEmail].totalScore    += e.score;
      byUser[e.userEmail].totalPossible += e.total;
    });
    return Object.values(byUser)
      .map(u => ({ ...u, avgPercent: Math.round((u.totalScore/u.totalPossible)*100) }))
      .sort((a,b) => b.avgPercent - a.avgPercent || b.totalTests - a.totalTests);
  };

  return (
    <AuthContext.Provider value={{
      user, token, tests, loading,
      login, register, logout,
      updateProfile, updateSecurity, saveTestResult, addNewTest,
      getAllUsers, updateUserRole, deleteTestAdmin, getLeaderboard,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
