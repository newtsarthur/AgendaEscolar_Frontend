import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getErrorMessage } from '../lib/api.js';
import { FOCUS_OPTIONS, GRADE_YEARS } from '../lib/constants.js';

export default function Register() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', grade_year: '3º ano', focus: 'ENEM' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setLoading(true);
    try {
      await register({ ...form, name: form.name.trim(), email: form.email.trim() });
      navigate('/', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Crie sua conta" subtitle="Leva menos de um minuto e é totalmente gratuito.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label" htmlFor="name">Nome</label>
          <input id="name" className="input" required minLength={2} maxLength={80} value={form.name} onChange={set('name')} />
        </div>
        <div>
          <label className="label" htmlFor="email">E-mail</label>
          <input id="email" type="email" className="input" required autoComplete="email" value={form.email} onChange={set('email')} />
        </div>
        <div>
          <label className="label" htmlFor="password">Senha</label>
          <input id="password" type="password" className="input" required minLength={6} maxLength={72} autoComplete="new-password" value={form.password} onChange={set('password')} />
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
        {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        <button type="submit" className="btn-primary w-full py-2.5" disabled={loading}>{loading ? 'Criando conta...' : 'Criar conta'}</button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Já tem conta? <Link to="/login" className="font-semibold text-brand-600 hover:underline">Entrar</Link>
      </p>
    </AuthShell>
  );
}
