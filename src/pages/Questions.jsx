import { BarChart3, ListChecks } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import QuestionCard from '../components/QuestionCard.jsx';
import Spinner from '../components/Spinner.jsx';
import { useToast } from '../context/ToastContext.jsx';
import api, { getErrorMessage } from '../lib/api.js';

export default function Questions() {
  const toast = useToast();
  const [meta, setMeta] = useState({ subjects: [], difficulties: [] });
  const [filters, setFilters] = useState({ subject: '', topic: '', difficulty: '', only_unanswered: false });
  const [questions, setQuestions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(() => {
    api.get('/questions/stats').then(({ data }) => setStats(data)).catch(() => {});
  }, []);

  useEffect(() => {
    api.get('/questions/meta').then(({ data }) => setMeta(data)).catch((err) => toast.error(getErrorMessage(err)));
    loadStats();
  }, [toast, loadStats]);

  useEffect(() => {
    setLoading(true);
    const params = { limit: 100 };
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params[k] = v;
    });
    api
      .get('/questions', { params })
      .then(({ data }) => setQuestions(data))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [filters, toast]);

  const topics = useMemo(() => {
    if (filters.subject) return meta.subjects.find((s) => s.name === filters.subject)?.topics || [];
    return [...new Set(meta.subjects.flatMap((s) => s.topics))].sort();
  }, [meta, filters.subject]);

  const setFilter = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFilters((f) => ({ ...f, [field]: value, ...(field === 'subject' ? { topic: '' } : {}) }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">Banco de Questões</h1>
        <p className="mt-1 text-sm text-slate-500">Questões no estilo ENEM com correção imediata e gabarito comentado.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          <div className="card grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
            <select className="input" value={filters.subject} onChange={setFilter('subject')} aria-label="Matéria">
              <option value="">Todas as matérias</option>
              {meta.subjects.map((s) => <option key={s.name} value={s.name}>{s.name} ({s.count})</option>)}
            </select>
            <select className="input" value={filters.topic} onChange={setFilter('topic')} aria-label="Assunto">
              <option value="">Todos os assuntos</option>
              {topics.map((t) => <option key={t}>{t}</option>)}
            </select>
            <select className="input" value={filters.difficulty} onChange={setFilter('difficulty')} aria-label="Dificuldade">
              <option value="">Todas as dificuldades</option>
              {meta.difficulties.map((d) => <option key={d}>{d}</option>)}
            </select>
            <label className="flex items-center gap-2 rounded-xl px-2 text-sm font-medium text-slate-600">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-200" checked={filters.only_unanswered} onChange={setFilter('only_unanswered')} />
              Só não respondidas
            </label>
          </div>

          {loading ? (
            <Spinner label="Carregando questões..." />
          ) : questions.length === 0 ? (
            <div className="card flex flex-col items-center gap-2 p-10 text-center">
              <ListChecks className="h-10 w-10 text-slate-300" />
              <p className="font-semibold text-slate-700">Nenhuma questão encontrada com esses filtros.</p>
            </div>
          ) : (
            questions.map((q, i) => <QuestionCard key={q.id} question={q} index={i} onAnswered={loadStats} />)
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-8 lg:self-start">
          <div className="card p-5">
            <h2 className="flex items-center gap-2 font-bold text-slate-800"><BarChart3 className="h-5 w-5 text-brand-600" /> Seu desempenho</h2>
            {stats && stats.total > 0 ? (
              <>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-slate-50 p-2"><p className="text-xl font-extrabold">{stats.total}</p><p className="text-[11px] text-slate-500">Respostas</p></div>
                  <div className="rounded-xl bg-emerald-50 p-2"><p className="text-xl font-extrabold text-emerald-700">{stats.correct}</p><p className="text-[11px] text-slate-500">Acertos</p></div>
                  <div className="rounded-xl bg-rose-50 p-2"><p className="text-xl font-extrabold text-rose-700">{stats.wrong}</p><p className="text-[11px] text-slate-500">Erros</p></div>
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-700">Aproveitamento geral: {stats.accuracy}%</p>
                <div className="mt-4 space-y-3">
                  {stats.by_subject.map((s) => (
                    <div key={s.subject}>
                      <div className="flex justify-between text-xs font-medium text-slate-600">
                        <span>{s.subject}</span>
                        <span>{s.correct}/{s.total} · {s.accuracy}%</span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-brand-500" style={{ width: `${s.accuracy}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="mt-3 text-sm text-slate-500">Responda questões para acompanhar seus acertos por matéria.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
