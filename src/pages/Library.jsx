import { BookOpen, CalendarPlus, Eye, FileText, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import PdfViewer from '../components/PdfViewer.jsx';
import Spinner from '../components/Spinner.jsx';
import TaskModal from '../components/TaskModal.jsx';
import { useToast } from '../context/ToastContext.jsx';
import api, { getErrorMessage } from '../lib/api.js';
import { subjectColor } from '../lib/constants.js';

export default function Library() {
  const toast = useToast();
  const [subjects, setSubjects] = useState([]);
  const [subject, setSubject] = useState('');
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);
  const [schedulePreset, setSchedulePreset] = useState(null);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(search.trim()), 350);
    return () => clearTimeout(id);
  }, [search]);

  useEffect(() => {
    api.get('/materials/subjects').then(({ data }) => setSubjects(data)).catch((err) => toast.error(getErrorMessage(err)));
  }, [toast]);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (subject) params.subject = subject;
    if (debounced) params.q = debounced;
    api
      .get('/materials', { params })
      .then(({ data }) => setMaterials(data))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [subject, debounced, toast]);

  const schedule = (material) => {
    setViewing(null);
    setSchedulePreset({
      title: `Estudar: ${material.topic} – ${material.title}`.slice(0, 140),
      subject: material.subject,
      task_type: 'Revisão',
      description: `Material: ${material.title}\n${material.pdf_url}`,
      related_material_id: material.id,
    });
  };

  const total = subjects.reduce((acc, s) => acc + s.count, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">Biblioteca</h1>
        <p className="mt-1 text-sm text-slate-500">Provas oficiais e materiais organizados por disciplina do Ensino Médio.</p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input className="input pl-9" placeholder="Buscar por título, assunto ou descrição..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
        <button
          onClick={() => setSubject('')}
          className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition ${subject === '' ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'}`}
        >
          Todas ({total})
        </button>
        {subjects.map((s) => (
          <button
            key={s.name}
            onClick={() => setSubject(s.name)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition ${subject === s.name ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'}`}
          >
            {s.name} ({s.count})
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner label="Carregando materiais..." />
      ) : materials.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 p-10 text-center">
          <BookOpen className="h-10 w-10 text-slate-300" />
          <p className="font-semibold text-slate-700">Nenhum material encontrado.</p>
          <p className="text-sm text-slate-500">Tente outra busca ou disciplina.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {materials.map((m) => (
            <div key={m.id} className="card flex flex-col p-5 transition hover:shadow-md">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-rose-50 p-2.5 text-rose-600">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap gap-1.5">
                    <span className={`chip ${subjectColor(m.subject)}`}>{m.subject}</span>
                    <span className="chip bg-slate-100 text-slate-600">{m.topic}</span>
                  </div>
                  <h3 className="mt-2 font-bold leading-snug text-slate-800">{m.title}</h3>
                </div>
              </div>
              <p className="mt-3 flex-1 text-sm text-slate-500">{m.description}</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button className="btn-secondary" onClick={() => setViewing(m)}>
                  <Eye className="h-4 w-4" /> Visualizar
                </button>
                <button className="btn-primary" onClick={() => schedule(m)}>
                  <CalendarPlus className="h-4 w-4" /> Agendar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <PdfViewer material={viewing} onClose={() => setViewing(null)} onSchedule={schedule} />
      <TaskModal open={Boolean(schedulePreset)} preset={schedulePreset} onClose={() => setSchedulePreset(null)} />
    </div>
  );
}
