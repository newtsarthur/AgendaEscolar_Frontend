import { Cpu, Lightbulb, ThumbsUp } from 'lucide-react';

function scoreTone(score, max) {
  const pct = score / max;
  if (pct >= 0.8) return { text: 'text-emerald-600', bar: 'bg-emerald-500' };
  if (pct >= 0.6) return { text: 'text-brand-600', bar: 'bg-brand-500' };
  if (pct >= 0.4) return { text: 'text-amber-600', bar: 'bg-amber-500' };
  return { text: 'text-rose-600', bar: 'bg-rose-500' };
}

export default function EssayResult({ essay }) {
  const total = scoreTone(essay.total_score, 1000);
  const isHeuristic = essay.provider === 'heuristica-local';

  return (
    <div className="space-y-4">
      <div className="card flex flex-col items-center gap-4 p-6 sm:flex-row">
        <div className="flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-full border-8 border-slate-100">
          <span className={`text-3xl font-extrabold ${total.text}`}>{essay.total_score}</span>
          <span className="text-xs font-medium text-slate-400">de 1000</span>
        </div>
        <div className="text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Tema</p>
          <p className="font-bold text-slate-800">{essay.theme}</p>
          {essay.summary && <p className="mt-2 text-sm text-slate-600">{essay.summary}</p>}
          <p className={`mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${isHeuristic ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
            <Cpu className="h-3.5 w-3.5" /> {isHeuristic ? 'Estimativa heurística (IA indisponível)' : `Corrigido por ${essay.provider}`}
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {essay.competencies.map((c) => {
          const tone = scoreTone(c.score, 200);
          return (
            <div key={c.id} className="card p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-slate-400">{c.id}</p>
                  <p className="text-sm font-semibold text-slate-800">{c.name}</p>
                </div>
                <span className={`text-lg font-extrabold ${tone.text}`}>{c.score}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${(c.score / 200) * 100}%` }} />
              </div>
              <p className="mt-3 text-sm text-slate-600">{c.feedback}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="card p-5">
          <h3 className="flex items-center gap-2 font-bold text-emerald-700"><ThumbsUp className="h-5 w-5" /> Pontos fortes</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {essay.strengths.length ? essay.strengths.map((s, i) => <li key={i} className="flex gap-2"><span className="text-emerald-500">•</span>{s}</li>) : <li className="text-slate-400">—</li>}
          </ul>
        </div>
        <div className="card p-5">
          <h3 className="flex items-center gap-2 font-bold text-amber-700"><Lightbulb className="h-5 w-5" /> Sugestões de melhoria</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {essay.improvements.length ? essay.improvements.map((s, i) => <li key={i} className="flex gap-2"><span className="text-amber-500">•</span>{s}</li>) : <li className="text-slate-400">—</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
