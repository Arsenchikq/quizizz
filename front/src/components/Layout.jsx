import { useState, useRef, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [exitModal, setExitModal] = useState(false);
  const menuRef = useRef(null);
  const isActive = (p) => location.pathname === p ? 'active' : '';

  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleLogout = () => { logout(); setExitModal(false); navigate('/login'); };

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container">
          <Link to="/" className="logo">
            <div className="logo-dot" />
            SmartTest
          </Link>
          <nav className="site-nav">
            <Link to="/" className={`nav-link ${isActive('/')}`}>Главная</Link>
            {user ? (
              <>
                <Link to="/tests"  className={`nav-link ${isActive('/tests')}`}>Каталог</Link>
                <Link to="/create" className={`nav-link ${isActive('/create')}`}>Создать</Link>
                <div className="user-menu" ref={menuRef}>
                  <button className="user-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
                    <img src={user.avatar} alt="" className="user-avatar" />
                    <span>{user.username || user.name}</span>
                    <i className={`bi bi-chevron-${menuOpen ? 'up' : 'down'}`} />
                  </button>
                  {menuOpen && (
                    <nav className="dropdown-menu">
                      <Link to="/profile"  className="dropdown-item" onClick={() => setMenuOpen(false)}><i className="bi bi-person" /> Профиль</Link>
                      <Link to="/security" className="dropdown-item" onClick={() => setMenuOpen(false)}><i className="bi bi-shield-lock" /> Безопасность</Link>
                      <button className="dropdown-item danger" onClick={() => { setMenuOpen(false); setExitModal(true); }}><i className="bi bi-box-arrow-right" /> Выйти</button>
                    </nav>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login"    className={`nav-link ${isActive('/login')}`}>Войти</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Регистрация</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {exitModal && (
        <div className="modal-overlay" role="dialog">
          <div className="modal">
            <h3>Выход из системы</h3>
            <p>Вы уверены? Для повторного входа потребуется пароль.</p>
            <div className="modal-actions">
              <button onClick={handleLogout} className="btn btn-danger"><i className="bi bi-box-arrow-right" /> Выйти</button>
              <button onClick={() => setExitModal(false)} className="btn btn-secondary">Отмена</button>
            </div>
          </div>
        </div>
      )}

      <main className="content-area"><Outlet /></main>

      <footer className="site-footer">
        <div className="container">
          <span className="footer-brand">SmartTest</span>
          <span className="footer-copy">© 2026 — Платформа тестирования знаний</span>
          <div className="footer-links">
            <Link to="/tests">Каталог</Link>
            <Link to="/create">Создать тест</Link>
            <Link to="/profile">Профиль</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
