import { CheckCircle2, Lightbulb, RotateCcw, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '../context/ToastContext.jsx';
import api, { getErrorMessage } from '../lib/api.js';
import { DIFFICULTY_STYLES, subjectColor } from '../lib/constants.js';

export default function QuestionCard({ question, index, onAnswered }) {
  const toast = useToast();
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [sending, setSending] = useState(false);

  const submit = async () => {
    if (!selected) return;
    setSending(true);
    try {
      const { data } = await api.post(`/questions/${question.id}/answer`, { selected_option: selected });
      setResult(data);
      onAnswered?.(data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const retry = () => {
    setSelected(null);
    setResult(null);
  };

  const optionStyle = (letter) => {
    if (!result) {
      return selected === letter ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-100' : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50';
    }
    if (letter === result.correct_option) return 'border-emerald-500 bg-emerald-50';
    if (letter === result.selected_option) return 'border-rose-400 bg-rose-50';
    return 'border-slate-200 opacity-60';
  };

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-sm font-extrabold text-slate-400">#{index + 1}</span>
        <span className={`chip ${subjectColor(question.subject)}`}>{question.subject}</span>
        <span className="chip bg-slate-100 text-slate-600">{question.topic}</span>
        <span className={`chip ${DIFFICULTY_STYLES[question.difficulty] || ''}`}>{question.difficulty}</span>
        {question.last_attempt && !result && (
          <span className={`chip ml-auto ${question.last_attempt.is_correct ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
            Última tentativa: {question.last_attempt.is_correct ? 'acertou' : 'errou'}
          </span>
        )}
      </div>
      <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-slate-800">{question.statement}</p>

      <div className="mt-4 space-y-2">
        {Object.entries(question.options).map(([letter, text]) => (
          <button
            key={letter}
            disabled={Boolean(result) || sending}
            onClick={() => setSelected(letter)}
            className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left text-sm transition ${optionStyle(letter)}`}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-600 ring-1 ring-slate-200">
              {letter}
            </span>
            <span className="pt-0.5 text-slate-700">{text}</span>
            {result && letter === result.correct_option && <CheckCircle2 className="ml-auto h-5 w-5 shrink-0 text-emerald-600" />}
            {result && letter === result.selected_option && !result.is_correct && <XCircle className="ml-auto h-5 w-5 shrink-0 text-rose-500" />}
          </button>
        ))}
      </div>

      {!result ? (
        <div className="mt-4 flex justify-end">
          <button className="btn-primary" disabled={!selected || sending} onClick={submit}>
            {sending ? 'Verificando...' : 'Responder'}
          </button>
        </div>
      ) : (
        <div className={`mt-4 rounded-xl p-4 ${result.is_correct ? 'bg-emerald-50' : 'bg-rose-50'}`}>
          <p className={`flex items-center gap-2 font-bold ${result.is_correct ? 'text-emerald-700' : 'text-rose-700'}`}>
            {result.is_correct ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
            {result.is_correct ? 'Resposta correta!' : `Resposta incorreta. Gabarito: ${result.correct_option}`}
          </p>
          <p className="mt-2 flex gap-2 text-sm text-slate-700">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <span><strong>Comentário:</strong> {result.explanation}</span>
          </p>
          <div className="mt-3 flex justify-end">
            <button className="btn-ghost px-3 py-1.5" onClick={retry}>
              <RotateCcw className="h-4 w-4" /> Tentar de novo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
