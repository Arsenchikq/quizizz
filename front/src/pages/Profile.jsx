import { useState } from 'react';
import { Link }     from 'react-router-dom';
import { useAuth }  from '../context/AuthContext';

export const Profile = () => {
  const { user, tests, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm]   = useState({ fullname: user.fullname||user.username||'', bio: user.bio||'', avatar: user.avatar||'' });
  const [saved, setSaved] = useState(false);

  const myTests = tests.filter(t => t.authorEmail === user.email);
  const onChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = () => {
    updateProfile(form); setEditing(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <section className="profile-page">
      <div className="container">
        {saved && <div className="alert alert-success" style={{marginBottom:20}}><i className="bi bi-check-circle" /> Профиль обновлён</div>}

        <div className="profile-hero">
          <img src={user.avatar} alt="" className="profile-avatar" />
          <div className="profile-info">
            {editing ? (
              <div style={{display:'grid',gap:12,maxWidth:420}}>
                <div className="form-group"><label className="form-label">Полное имя</label><input name="fullname" className="form-control" value={form.fullname} onChange={onChange} /></div>
                <div className="form-group"><label className="form-label">О себе</label><input name="bio" className="form-control" value={form.bio} onChange={onChange} placeholder="Краткое описание" /></div>
                <div className="form-group"><label className="form-label">URL аватара</label><input name="avatar" className="form-control" value={form.avatar} onChange={onChange} /></div>
                <div style={{display:'flex',gap:8}}>
                  <button className="btn btn-primary btn-sm" onClick={handleSave}><i className="bi bi-check-lg" /> Сохранить</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setEditing(false)}>Отмена</button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="profile-name">{user.fullname || user.username}</h1>
                <p className="profile-email"><i className="bi bi-envelope" style={{marginRight:5}} />{user.email}</p>
                {user.bio && <p className="profile-bio">{user.bio}</p>}
                <div className="profile-counters">
                  <div className="profile-counter"><strong>{user.results?.length||0}</strong>пройдено</div>
                  <div className="profile-counter"><strong>{myTests.length}</strong>создано</div>
                </div>
                <div style={{marginTop:16,display:'flex',gap:8}}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}><i className="bi bi-pencil" /> Редактировать</button>
                  <Link to="/security" className="btn btn-ghost btn-sm"><i className="bi bi-shield-lock" /> Безопасность</Link>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="profile-grid">
          <div className="panel">
            <div className="panel-head">
              <h2>Мои тесты</h2>
              <Link to="/create" className="btn btn-ghost btn-sm"><i className="bi bi-plus-lg" /></Link>
            </div>
            <div className="panel-body">
              {myTests.length === 0 ? (
                <div className="empty-state"><i className="bi bi-file-earmark-plus" /><p>Нет созданных тестов</p><Link to="/create" className="btn btn-primary btn-sm">Создать первый</Link></div>
              ) : (
                <ul>{myTests.map(test => (
                  <li key={test.id} className="mini-test-item">
                    <div>
                      <div className="mini-test-title">{test.title}</div>
                      <div className="mini-test-meta">{test.questions.length} вопр. · {test.difficulty}</div>
                    </div>
                    <Link to={`/room/${test.id}`} className="btn btn-ghost btn-sm"><i className="bi bi-play" /></Link>
                  </li>
                ))}</ul>
              )}
            </div>
          </div>

          <div className="panel">
            <div className="panel-head"><h2>История прохождений</h2></div>
            <div className="panel-body">
              {!user.results?.length ? (
                <div className="empty-state"><i className="bi bi-clock-history" /><p>История пуста</p><Link to="/tests" className="btn btn-primary btn-sm">Пройти тест</Link></div>
              ) : (
                <table className="data-table">
                  <thead><tr><th>Тест</th><th>Результат</th><th>Дата</th></tr></thead>
                  <tbody>
                    {user.results.slice(0,8).map((res, i) => (
                      <tr key={i}>
                        <td style={{fontWeight:500,color:'var(--text)'}}>{res.title}</td>
                        <td><span className="score-pill">{res.score}/{res.total}</span></td>
                        <td style={{fontFamily:'var(--fm)',fontSize:'.68rem'}}>{res.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
