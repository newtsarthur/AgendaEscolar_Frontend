import { UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { getErrorMessage } from '../lib/api.js';
import { FOCUS_OPTIONS, GRADE_YEARS } from '../lib/constants.js';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ name: '', grade_year: '3º ano', focus: 'ENEM' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) setForm({ name: user.name, grade_year: user.grade_year, focus: user.focus });
  }, [user]);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ ...form, name: form.name.trim() });
      toast.success('Perfil atualizado!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-extrabold text-slate-800">Meu perfil</h1>
      <p className="mt-1 text-sm text-slate-500">Essas informações ajudam a personalizar seus estudos.</p>
      <div className="card mt-6 p-6">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
            <UserRound className="h-7 w-7" />
          </div>
          <div>
            <p className="font-bold text-slate-800">{user?.name}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="name">Nome</label>
            <input id="name" className="input" required minLength={2} maxLength={80} value={form.name} onChange={set('name')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="grade_year">Ano escolar</label>
              <select id="grade_year" className="input" value={form.grade_year} onChange={set('grade_year')}>
                {GRADE_YEARS.map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="focus">Foco</label>
              <select id="focus" className="input" value={form.focus} onChange={set('focus')}>
                {FOCUS_OPTIONS.map((f) => <option key={f}>{f}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Salvando...' : 'Salvar alterações'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
