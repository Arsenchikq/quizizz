import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Register = () => {
  const [form, setForm]       = useState({ username: '', email: '', password: '', confirm: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate     = useNavigate();

  const onChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) return setError('Заполните все поля');
    if (form.password.length < 6)       return setError('Пароль минимум 6 символов');
    if (form.password !== form.confirm) return setError('Пароли не совпадают');

    setLoading(true);
    try {
      await register(form);
      navigate('/profile', { replace: true });
    } catch (err) {
      // Показываем реальную ошибку от сервера
      if (err.message.includes('fetch') || err.message.includes('Failed')) {
        setError('Сервер недоступен. Запустите back: npm run dev в папке back/');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-card">
        <header>
          <div className="auth-logo"><div className="logo-dot" /> SmartTest</div>
          <h1>Регистрация</h1>
          <p>Создайте аккаунт для доступа к тестам</p>
        </header>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 16 }}>
            <i className="bi bi-exclamation-circle" /> {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="username" className="form-label">Имя пользователя</label>
            <input id="username" name="username" type="text" className="form-control"
              placeholder="johndoe" value={form.username} onChange={onChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input id="email" name="email" type="email" className="form-control"
              placeholder="you@example.com" value={form.email} onChange={onChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">Пароль</label>
            <input id="password" name="password" type="password" className="form-control"
              placeholder="Мин. 6 символов" value={form.password} onChange={onChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="confirm" className="form-label">Подтверждение пароля</label>
            <input id="confirm" name="confirm" type="password" className="form-control"
              placeholder="Повторите пароль" value={form.confirm} onChange={onChange} required />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading
              ? <><i className="bi bi-arrow-repeat" /> Создаём аккаунт...</>
              : <><i className="bi bi-person-check" /> Зарегистрироваться</>}
          </button>
        </form>

        <p className="auth-footer">Уже есть аккаунт? <Link to="/login">Войти</Link></p>
      </div>
    </section>
  );
};
