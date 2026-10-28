import { AlertTriangle, Clock, Pencil, Trash2 } from 'lucide-react';
import { STATUS_STYLES, TASK_STATUSES, TYPE_STYLES, subjectColor } from '../lib/constants.js';
import { formatDateTime, formatTime, parseLocal } from '../lib/dates.js';

export default function TaskCard({ task, onEdit, onDelete, onStatusChange, showDate = false }) {
  const due = parseLocal(task.due_date);
  const overdue = task.status !== 'Concluída' && due < new Date();
  const done = task.status === 'Concluída';

  return (
    <div className={`card p-3.5 transition hover:shadow-md ${done ? 'opacity-70' : ''} ${overdue ? 'border-rose-200' : ''}`}>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className={`chip ${subjectColor(task.subject)}`}>{task.subject}</span>
        <span className={`chip ${TYPE_STYLES[task.task_type] || ''}`}>{task.task_type}</span>
        {overdue && (
          <span className="chip bg-rose-100 text-rose-700">
            <AlertTriangle className="mr-1 h-3 w-3" /> Atrasada
          </span>
        )}
      </div>
      <p className={`mt-2 text-sm font-semibold text-slate-800 ${done ? 'line-through' : ''}`}>{task.title}</p>
      {task.description && <p className="mt-1 line-clamp-2 text-xs text-slate-500">{task.description}</p>}
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1 text-xs text-slate-500">
          <Clock className="h-3.5 w-3.5" /> {showDate ? formatDateTime(due) : formatTime(due)}
        </span>
        <div className="flex items-center gap-1">
          <select
            aria-label="Alterar status"
            value={task.status}
            onChange={(e) => onStatusChange(task, e.target.value)}
            className={`rounded-lg border-0 py-1 pl-2 pr-7 text-xs font-semibold focus:ring-2 focus:ring-brand-200 ${STATUS_STYLES[task.status]}`}
          >
            {TASK_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <button onClick={() => onEdit(task)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-600" aria-label="Editar">
            <Pencil className="h-4 w-4" />
          </button>
          <button onClick={() => onDelete(task)} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label="Excluir">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
