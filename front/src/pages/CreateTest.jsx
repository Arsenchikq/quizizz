import { useState }    from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth }     from '../context/AuthContext';

const DIFFS = ['Легкий','Средний','Сложный','Хардкор'];
const CATS  = ['Frontend','Backend','Database','DevOps','Алгоритмы','Другое'];
const mkQ   = () => ({ id: Date.now()+Math.random(), text:'', options:['','','',''], correct:0 });

export const CreateTest = () => {
  const { addNewTest } = useAuth();
  const navigate       = useNavigate();
  const [meta, setMeta] = useState({ title:'', description:'', difficulty:'Легкий', category:'Frontend' });
  const [questions, setQuestions] = useState([mkQ()]);
  const [errors, setErrors]       = useState({});

  const onMeta = e => setMeta(p => ({ ...p, [e.target.name]: e.target.value }));
  const addQ   = () => setQuestions(p => [...p, mkQ()]);
  const removeQ = idx => setQuestions(p => p.filter((_,i) => i!==idx));
  const setQText  = (qi,v) => setQuestions(p => p.map((q,i) => i===qi ? {...q,text:v} : q));
  const setOpt    = (qi,oi,v) => setQuestions(p => p.map((q,i) => i===qi ? {...q,options:q.options.map((o,j) => j===oi?v:o)} : q));
  const setCorr   = (qi,v) => setQuestions(p => p.map((q,i) => i===qi ? {...q,correct:Number(v)} : q));

  const validate = () => {
    const e = {};
    if (!meta.title.trim())       e.title = true;
    if (!meta.description.trim()) e.desc  = true;
    questions.forEach((q,qi) => {
      if (!q.text.trim()) e[`q${qi}`] = true;
      q.options.forEach((o,oi) => { if (!o.trim()) e[`q${qi}o${oi}`] = true; });
    });
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    addNewTest({ id:Date.now(), title:meta.title.trim(), description:meta.description.trim(), difficulty:meta.difficulty, category:meta.category, questions });
    navigate('/tests');
  };

  return (
    <section className="create-page">
      <div className="container">
        <div className="page-header">
          <div><h1 className="page-title">Конструктор теста</h1><p className="page-meta">{questions.length} вопросов</p></div>
          <button className="btn btn-primary" onClick={handleSave}><i className="bi bi-floppy" /> Сохранить</button>
        </div>

        <div className="section-card">
          <div className="section-card-head"><h2>Настройки теста</h2></div>
          <div className="section-card-body">
            <div className="form-group">
              <label className="form-label">Название</label>
              <input name="title" className={`form-control${errors.title?' error':''}`} placeholder="Например: React Hooks Deep Dive" value={meta.title} onChange={onMeta} />
            </div>
            <div className="form-group">
              <label className="form-label">Описание</label>
              <input name="description" className={`form-control${errors.desc?' error':''}`} placeholder="Краткое описание" value={meta.description} onChange={onMeta} />
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div className="form-group">
                <label className="form-label">Сложность</label>
                <select name="difficulty" className="form-control" value={meta.difficulty} onChange={onMeta}>{DIFFS.map(d=><option key={d}>{d}</option>)}</select>
              </div>
              <div className="form-group">
                <label className="form-label">Категория</label>
                <select name="category" className="form-control" value={meta.category} onChange={onMeta}>{CATS.map(c=><option key={c}>{c}</option>)}</select>
              </div>
            </div>
          </div>
        </div>

        {questions.map((q,qi) => (
          <div key={q.id} className="question-block">
            <div className="question-block-head">
              <span className="question-block-num"><i className="bi bi-hash" /> Вопрос {qi+1}</span>
              {questions.length > 1 && <button className="btn btn-ghost btn-sm" style={{color:'var(--err)'}} onClick={() => removeQ(qi)}><i className="bi bi-trash" /></button>}
            </div>
            <div className="question-block-body">
              <div className="form-group">
                <label className="form-label">Текст вопроса</label>
                <input className={`form-control${errors[`q${qi}`]?' error':''}`} placeholder="Что такое...?" value={q.text} onChange={e => setQText(qi,e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Варианты ответов <span style={{color:'var(--text-3)'}}>— отметьте правильный</span></label>
                <div className="options-constructor">
                  {q.options.map((opt,oi) => (
                    <div className="option-row" key={oi}>
                      <input type="radio" className="option-radio" name={`c_${q.id}`} checked={q.correct===oi} onChange={() => setCorr(qi,oi)} />
                      <input className={`form-control${errors[`q${qi}o${oi}`]?' error':''}`} placeholder={`Вариант ${String.fromCharCode(65+oi)}`} value={opt} onChange={e => setOpt(qi,oi,e.target.value)} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}

        <button className="btn btn-secondary btn-full" onClick={addQ} style={{marginBottom:32}}>
          <i className="bi bi-plus-lg" /> Добавить вопрос
        </button>
      </div>
    </section>
  );
};
