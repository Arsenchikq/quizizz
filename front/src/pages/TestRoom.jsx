import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LETTERS = ['A','B','C','D'];

export const TestRoom = () => {
  const { id }  = useParams();
  const navigate = useNavigate();
  const { tests, saveTestResult } = useAuth();
  const test = tests.find(t => t.id === Number(id));

  const [currentQ,  setCurrentQ]  = useState(0);
  const [selected,  setSelected]  = useState(null);
  const [revealed,  setRevealed]  = useState(false);
  const [score,     setScore]     = useState(0);
  const [finished,  setFinished]  = useState(false);

  if (!test) return (
    <div className="not-found">
      <div className="not-found-code">404</div>
      <h1>Тест не найден</h1>
      <p>Возможно, тест был удалён или ссылка неверна</p>
      <Link to="/tests" className="btn btn-secondary" style={{marginTop:16}}><i className="bi bi-arrow-left" /> К каталогу</Link>
    </div>
  );

  const total = test.questions.length;
  const q     = test.questions[currentQ];
  const pct   = Math.round(((currentQ + (revealed ? 1 : 0)) / total) * 100);

  const handleSelect = (idx) => {
    if (revealed) return;
    setSelected(idx);
    setRevealed(true);
    if (idx === q.correct) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (currentQ + 1 < total) { setCurrentQ(c => c+1); setSelected(null); setRevealed(false); }
    else setFinished(true);
  };

  const handleSave = () => { saveTestResult(test.title, score, total); navigate('/profile'); };

  if (finished) {
    const pctScore = Math.round((score / total) * 100);
    return (
      <div className="result-page">
        <div className="container">
          <p className="result-eyebrow"><i className="bi bi-flag-fill" /> Тест завершён — {test.title}</p>
          <div className="result-score-wrap">
            <div className="result-score">{score}</div>
            <div className="result-max">/{total}</div>
          </div>
          <p className="result-percent">{pctScore}% правильных ответов</p>
          <div className="result-actions">
            <button className="btn btn-primary" onClick={handleSave}><i className="bi bi-save" /> Сохранить результат</button>
            <Link to="/tests" className="btn btn-secondary"><i className="bi bi-collection" /> К каталогу</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="test-room-page">
      <div className="container">
        <div className="progress-header">
          <div className="progress-info">
            <div className="progress-title">{test.title}</div>
            <div style={{fontFamily:'var(--fm)',fontSize:'.65rem',color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.08em'}}>{test.category} · {test.difficulty}</div>
          </div>
          <div className="progress-right">
            <div className="progress-bar-wrap"><div className="progress-bar-fill" style={{width:`${pct}%`}} /></div>
            <span className="progress-count">{currentQ+1}/{total}</span>
          </div>
        </div>

        <p className="question-label"><i className="bi bi-hash" /> Вопрос {currentQ+1}</p>
        <h2 className="question-text">{q.text}</h2>

        <ul className="options-grid">
          {q.options.map((opt, idx) => {
            let cls = 'option-btn';
            if (revealed) {
              if (idx === q.correct)     cls += ' correct';
              else if (idx === selected) cls += ' wrong';
              else                       cls += ' disabled';
            }
            return (
              <li key={idx}>
                <button className={cls} onClick={() => handleSelect(idx)} disabled={revealed && idx !== q.correct && idx !== selected}>
                  <span className="option-index">{LETTERS[idx]}</span>
                  {opt}
                  {revealed && idx === q.correct  && <i className="bi bi-check-lg option-icon" />}
                  {revealed && idx === selected && idx !== q.correct && <i className="bi bi-x-lg option-icon" />}
                </button>
              </li>
            );
          })}
        </ul>

        {revealed && (
          <div className="next-btn-row">
            <button className="btn btn-primary" onClick={handleNext}>
              {currentQ+1 < total ? <><i className="bi bi-arrow-right" /> Следующий</> : <><i className="bi bi-flag" /> Завершить</>}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
