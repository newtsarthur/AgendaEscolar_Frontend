import { AlertTriangle, CalendarClock, CheckCircle2, ChevronLeft, ChevronRight, CircleDashed, Plus, Target } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Spinner from '../components/Spinner.jsx';
import TaskCard from '../components/TaskCard.jsx';
import TaskModal from '../components/TaskModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import api, { getErrorMessage } from '../lib/api.js';
import { SUBJECTS, TASK_STATUSES } from '../lib/constants.js';
import {
  addDays,
  formatDayLabel,
  formatShortDay,
  isSameDay,
  parseLocal,
  startOfDay,
  startOfWeek,
  toLocalISO,
} from '../lib/dates.js';

const VIEWS = [
  { id: 'day', label: 'Dia' },
  { id: 'week', label: 'Semana' },
  { id: 'all', label: 'Todas' },
];

function StatCard({ icon: Icon, label, value, tone }) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <div className={`rounded-xl p-2.5 ${tone}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-extrabold leading-none text-slate-800">{value}</p>
        <p className="mt-1 text-xs font-medium text-slate-500">{label}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [view, setView] = useState('week');
  const [refDate, setRefDate] = useState(() => startOfDay(new Date()));
  const [statusFilter, setStatusFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [qStats, setQStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, task: null, preset: null });

  const range = useMemo(() => {
    if (view === 'day') return { start: refDate, end: addDays(refDate, 1) };
    if (view === 'week') {
      const start = startOfWeek(refDate);
      return { start, end: addDays(start, 7) };
    }
    return null;
  }, [view, refDate]);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (range) {
        params.start = toLocalISO(range.start);
        params.end = toLocalISO(range.end);
      }
      if (statusFilter) params.status = statusFilter;
      if (subjectFilter) params.subject = subjectFilter;
      const { data } = await api.get('/tasks', { params });
      setTasks(data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [range, statusFilter, subjectFilter, toast]);

  const loadSummary = useCallback(async () => {
    try {
      const [s, q] = await Promise.all([api.get('/tasks/summary'), api.get('/questions/stats')]);
      setSummary(s.data);
      setQStats(q.data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }, [toast]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const refresh = () => {
    loadTasks();
    loadSummary();
  };

  const handleStatusChange = async (task, status) => {
    setTasks((list) => list.map((t) => (t.id === task.id ? { ...t, status } : t)));
    try {
      await api.put(`/tasks/${task.id}`, { status });
      loadSummary();
    } catch (err) {
      toast.error(getErrorMessage(err));
      loadTasks();
    }
  };

  const handleDelete = async (task) => {
    if (!window.confirm(`Excluir a tarefa "${task.title}"?`)) return;
    try {
      await api.delete(`/tasks/${task.id}`);
      toast.success('Tarefa excluída.');
      refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const openNew = (date) => {
    const preset = date ? { due_date: toLocalISO(new Date(date.getFullYear(), date.getMonth(), date.getDate(), 19, 0)).slice(0, 16) } : null;
    setModal({ open: true, task: null, preset });
  };

  const navigate = (dir) => {
    if (view === 'day') setRefDate((d) => addDays(d, dir));
    if (view === 'week') setRefDate((d) => addDays(d, 7 * dir));
  };

  const weekDays = useMemo(() => (view === 'week' && range ? Array.from({ length: 7 }, (_, i) => addDays(range.start, i)) : []), [view, range]);

  const rangeLabel =
    view === 'day'
      ? formatDayLabel(refDate)
      : view === 'week' && range
        ? `${range.start.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} – ${addDays(range.end, -1).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}`
        : 'Todas as tarefas';

  const firstName = user?.name?.split(' ')[0] || 'estudante';
  const counts = summary?.counts || {};
  const cardProps = { onEdit: (task) => setModal({ open: true, task, preset: null }), onDelete: handleDelete, onStatusChange: handleStatusChange };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Olá, {firstName}! 📚</h1>
          <p className="mt-1 text-sm text-slate-500">
            {user?.grade_year} · Foco em {user?.focus}. Bora organizar a semana?
          </p>
        </div>
        <button className="btn-primary" onClick={() => openNew(null)}>
          <Plus className="h-4 w-4" /> Nova tarefa
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard icon={CircleDashed} label="Pendentes" value={counts['Pendente'] ?? '–'} tone="bg-slate-100 text-slate-600" />
        <StatCard icon={CalendarClock} label="Em andamento" value={counts['Em Andamento'] ?? '–'} tone="bg-amber-100 text-amber-700" />
        <StatCard icon={CheckCircle2} label="Concluídas" value={counts['Concluída'] ?? '–'} tone="bg-emerald-100 text-emerald-700" />
        <StatCard icon={AlertTriangle} label="Atrasadas" value={summary?.overdue ?? '–'} tone="bg-rose-100 text-rose-700" />
        <StatCard
          icon={Target}
          label={`Acerto em questões (${qStats?.total ?? 0})`}
          value={qStats ? `${qStats.accuracy}%` : '–'}
          tone="bg-brand-100 text-brand-700"
        />
      </div>

      <div className="card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-xl bg-slate-100 p-1">
              {VIEWS.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setView(v.id)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${view === v.id ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500'}`}
                >
                  {v.label}
                </button>
              ))}
            </div>
            {view !== 'all' && (
              <div className="flex items-center gap-1">
                <button className="btn-ghost p-2" onClick={() => navigate(-1)} aria-label="Anterior"><ChevronLeft className="h-4 w-4" /></button>
                <button className="btn-secondary px-3 py-1.5" onClick={() => setRefDate(startOfDay(new Date()))}>Hoje</button>
                <button className="btn-ghost p-2" onClick={() => navigate(1)} aria-label="Próximo"><ChevronRight className="h-4 w-4" /></button>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select className="input w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filtrar por status">
              <option value="">Todos os status</option>
              {TASK_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select className="input w-auto" value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} aria-label="Filtrar por disciplina">
              <option value="">Todas as disciplinas</option>
              {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <p className="mt-3 text-sm font-semibold capitalize text-slate-700">{rangeLabel}</p>
      </div>

      {loading ? (
        <Spinner label="Carregando tarefas..." />
      ) : view === 'week' ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-7">
          {weekDays.map((day) => {
            const dayTasks = tasks.filter((t) => isSameDay(parseLocal(t.due_date), day));
            const today = isSameDay(day, new Date());
            return (
              <div key={day.toISOString()} className={`rounded-2xl border p-2.5 ${today ? 'border-brand-200 bg-brand-50/60' : 'border-slate-200 bg-slate-100/50'}`}>
                <div className="mb-2 flex items-center justify-between px-1">
                  <span className={`text-xs font-bold uppercase ${today ? 'text-brand-700' : 'text-slate-500'}`}>{formatShortDay(day)}</span>
                  <button onClick={() => openNew(day)} className="rounded-md p-1 text-slate-400 hover:bg-white hover:text-brand-600" aria-label="Adicionar neste dia">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {dayTasks.length === 0 && <p className="px-1 py-3 text-center text-xs text-slate-400">Livre</p>}
                  {dayTasks.map((t) => <TaskCard key={t.id} task={t} {...cardProps} />)}
                </div>
              </div>
            );
          })}
        </div>
      ) : tasks.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-10 text-center">
          <CalendarClock className="h-10 w-10 text-slate-300" />
          <p className="font-semibold text-slate-700">Nenhuma tarefa por aqui.</p>
          <p className="text-sm text-slate-500">Adicione uma revisão, prova ou trabalho — ou agende um estudo direto da Biblioteca.</p>
          <button className="btn-primary mt-2" onClick={() => openNew(view === 'day' ? refDate : null)}>
            <Plus className="h-4 w-4" /> Adicionar tarefa
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tasks.map((t) => <TaskCard key={t.id} task={t} showDate={view === 'all'} {...cardProps} />)}
        </div>
      )}

      <TaskModal
        open={modal.open}
        task={modal.task}
        preset={modal.preset}
        onClose={() => setModal({ open: false, task: null, preset: null })}
        onSaved={refresh}
      />
    </div>
  );
}
