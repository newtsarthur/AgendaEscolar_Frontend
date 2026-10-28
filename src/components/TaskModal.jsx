import { useEffect, useState } from 'react';
import { useToast } from '../context/ToastContext.jsx';
import api, { getErrorMessage } from '../lib/api.js';
import { SUBJECTS, TASK_STATUSES, TASK_TYPES } from '../lib/constants.js';
import { defaultDueDate, parseLocal, toInputValue } from '../lib/dates.js';
import Modal from './Modal.jsx';

function buildForm(task, preset) {
  if (task) {
    return {
      title: task.title,
      subject: task.subject,
      description: task.description || '',
      due_date: toInputValue(parseLocal(task.due_date)),
      task_type: task.task_type,
      status: task.status,
      related_material_id: task.related_material_id || null,
    };
  }
  return {
    title: '',
    subject: SUBJECTS[0],
    description: '',
    due_date: toInputValue(defaultDueDate()),
    task_type: 'Revisão',
    status: 'Pendente',
    related_material_id: null,
    ...preset,
  };
}

/**
 * Formulário de criação/edição de tarefas.
 * - `task`: tarefa existente (modo edição)
 * - `preset`: valores iniciais (ex.: vindo da Biblioteca com "Agendar estudo")
 */
export default function TaskModal({ open, onClose, task = null, preset = null, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState(() => buildForm(task, preset));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm(buildForm(task, preset));
  }, [open, task, preset]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, due_date: `${form.due_date}:00` };
      const { data } = task ? await api.put(`/tasks/${task.id}`, payload) : await api.post('/tasks', payload);
      toast.success(task ? 'Tarefa atualizada!' : 'Tarefa adicionada à agenda!');
      onSaved?.(data);
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const subjects = SUBJECTS.includes(form.subject) ? SUBJECTS : [form.subject, ...SUBJECTS];

  return (
    <Modal open={open} onClose={onClose} title={task ? 'Editar tarefa' : 'Nova tarefa de estudo'}>
      <form onSubmit={handleSubmit} className="space-y-4 p-5">
        <div>
          <label className="label" htmlFor="title">Título</label>
          <input id="title" className="input" required maxLength={140} value={form.title} onChange={set('title')} placeholder="Ex.: Revisar funções do 1º grau" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="subject">Disciplina</label>
            <select id="subject" className="input" value={form.subject} onChange={set('subject')}>
              {subjects.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="due_date">Data e hora</label>
            <input id="due_date" type="datetime-local" className="input" required value={form.due_date} onChange={set('due_date')} />
          </div>
          <div>
            <label className="label" htmlFor="task_type">Tipo</label>
            <select id="task_type" className="input" value={form.task_type} onChange={set('task_type')}>
              {TASK_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="status">Status</label>
            <select id="status" className="input" value={form.status} onChange={set('status')}>
              {TASK_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="label" htmlFor="description">Descrição (opcional)</label>
          <textarea id="description" className="input min-h-[90px]" maxLength={2000} value={form.description} onChange={set('description')} placeholder="Capítulos, lista de exercícios, metas..." />
        </div>
        {form.related_material_id && (
          <p className="rounded-xl bg-brand-50 px-3 py-2 text-xs font-medium text-brand-700">📎 Vinculada a um material da Biblioteca.</p>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
        </div>
      </form>
    </Modal>
  );
}
