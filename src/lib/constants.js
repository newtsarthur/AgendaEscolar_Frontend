export const SUBJECTS = ['Matemática', 'Física', 'Química', 'Biologia', 'História', 'Geografia', 'Português', 'Redação'];

export const GRADE_YEARS = ['1º ano', '2º ano', '3º ano', 'Cursinho'];

export const FOCUS_OPTIONS = ['ENEM', 'Vestibular', 'ENEM e Vestibular', 'Concurso', 'Reforço escolar'];

export const TASK_TYPES = ['Compromisso', 'Trabalho', 'Prova', 'Revisão'];

export const TASK_STATUSES = ['Pendente', 'Em Andamento', 'Concluída'];

export const SUBJECT_COLORS = {
  Matemática: 'bg-blue-100 text-blue-700',
  Física: 'bg-violet-100 text-violet-700',
  Química: 'bg-emerald-100 text-emerald-700',
  Biologia: 'bg-lime-100 text-lime-700',
  História: 'bg-amber-100 text-amber-800',
  Geografia: 'bg-teal-100 text-teal-700',
  Português: 'bg-rose-100 text-rose-700',
  Redação: 'bg-fuchsia-100 text-fuchsia-700',
};

export const STATUS_STYLES = {
  Pendente: 'bg-slate-100 text-slate-700',
  'Em Andamento': 'bg-amber-100 text-amber-800',
  Concluída: 'bg-emerald-100 text-emerald-700',
};

export const TYPE_STYLES = {
  Compromisso: 'bg-sky-100 text-sky-700',
  Trabalho: 'bg-indigo-100 text-indigo-700',
  Prova: 'bg-rose-100 text-rose-700',
  Revisão: 'bg-purple-100 text-purple-700',
};

export const DIFFICULTY_STYLES = {
  Fácil: 'bg-emerald-100 text-emerald-700',
  Média: 'bg-amber-100 text-amber-800',
  Difícil: 'bg-rose-100 text-rose-700',
};

export function subjectColor(subject) {
  return SUBJECT_COLORS[subject] || 'bg-slate-100 text-slate-700';
}
