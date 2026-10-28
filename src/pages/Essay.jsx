import { ArrowLeft, Camera, FileText, History, ImageUp, Loader2, ScanText, Sparkles, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import EssayResult from '../components/EssayResult.jsx';
import Spinner from '../components/Spinner.jsx';
import { useToast } from '../context/ToastContext.jsx';
import api, { getErrorMessage } from '../lib/api.js';
import { formatDateTime } from '../lib/dates.js';
import { recognizeEssay } from '../lib/ocr.js';

const OCR_STATUS = {
  'loading tesseract core': 'Carregando o motor de OCR...',
  'initializing tesseract': 'Inicializando OCR...',
  'loading language traineddata': 'Baixando dicionário de português...',
  'initializing api': 'Preparando leitura...',
  'recognizing text': 'Lendo o texto da imagem...',
};

function NewEssay({ onCorrected }) {
  const toast = useToast();
  const fileRef = useRef(null);
  const [theme, setTheme] = useState('');
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [ocr, setOcr] = useState({ running: false, status: '', progress: 0, confidence: null });
  const [correcting, setCorrecting] = useState(false);

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const pickImage = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Envie uma imagem (JPG, PNG ou foto do celular).');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error('Imagem muito grande (máx. 15 MB).');
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setOcr({ running: false, status: '', progress: 0, confidence: null });
  };

  const clearImage = () => {
    if (preview) URL.revokeObjectURL(preview);
    setImage(null);
    setPreview('');
  };

  const runOcr = async () => {
    if (!image) return;
    setOcr({ running: true, status: 'Iniciando...', progress: 0, confidence: null });
    try {
      const result = await recognizeEssay(image, (status, progress) =>
        setOcr((o) => ({ ...o, status: OCR_STATUS[status] || status, progress })),
      );
      if (!result.text.trim()) {
        toast.error('Não consegui identificar texto. Tente uma foto mais nítida, bem iluminada e sem sombras.');
        setOcr({ running: false, status: '', progress: 0, confidence: null });
        return;
      }
      setText((prev) => (prev.trim() ? `${prev.trim()}\n\n${result.text}` : result.text));
      setOcr({ running: false, status: 'Concluído', progress: 1, confidence: result.confidence });
      toast.success('Texto extraído! Revise e corrija a transcrição antes de enviar.');
    } catch (err) {
      console.error(err);
      toast.error('Falha no OCR. Verifique sua conexão (o dicionário é baixado na primeira vez) e tente novamente.');
      setOcr({ running: false, status: '', progress: 0, confidence: null });
    }
  };

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lines = Math.ceil(words / 10);

  const submit = async (e) => {
    e.preventDefault();
    if (text.trim().length < 50) {
      toast.error('O texto precisa ter pelo menos 50 caracteres.');
      return;
    }
    setCorrecting(true);
    try {
      const { data } = await api.post('/essays/correct', { theme: theme.trim(), text: text.trim() }, { timeout: 120000 });
      toast.success(`Redação corrigida: ${data.total_score} pontos!`);
      onCorrected(data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setCorrecting(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <div className="space-y-4">
        <div className="card p-5">
          <h2 className="flex items-center gap-2 font-bold text-slate-800"><Camera className="h-5 w-5 text-brand-600" /> Foto da redação</h2>
          <p className="mt-1 text-xs text-slate-500">Opcional: fotografe a folha manuscrita e extraia o texto com OCR direto no seu navegador.</p>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={pickImage} />
          {preview ? (
            <div className="relative mt-4">
              <img src={preview} alt="Pré-visualização da redação" className="max-h-80 w-full rounded-xl border border-slate-200 object-contain" />
              <button type="button" onClick={clearImage} className="absolute right-2 top-2 rounded-full bg-white/90 p-1 text-slate-600 shadow hover:text-rose-600" aria-label="Remover imagem">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => fileRef.current?.click()} className="mt-4 flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-200 p-8 text-sm text-slate-500 transition hover:border-brand-300 hover:bg-brand-50/40">
              <ImageUp className="h-8 w-8 text-slate-400" />
              Toque para enviar ou tirar foto
            </button>
          )}
          {preview && (
            <div className="mt-3 space-y-2">
              <button type="button" className="btn-primary w-full" onClick={runOcr} disabled={ocr.running}>
                {ocr.running ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanText className="h-4 w-4" />}
                {ocr.running ? 'Extraindo texto...' : 'Extrair texto (OCR)'}
              </button>
              <button type="button" className="btn-secondary w-full" onClick={() => fileRef.current?.click()} disabled={ocr.running}>Trocar imagem</button>
            </div>
          )}
          {(ocr.running || ocr.confidence !== null) && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-slate-500">
                <span>{ocr.status}</span>
                <span>{Math.round(ocr.progress * 100)}%</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${ocr.progress * 100}%` }} />
              </div>
              {ocr.confidence !== null && <p className="mt-2 text-xs text-slate-500">Confiança do OCR: {ocr.confidence}% — revise palavras trocadas.</p>}
            </div>
          )}
        </div>
        <div className="rounded-2xl bg-brand-50 p-4 text-xs text-brand-900">
          <p className="font-bold">Dicas para um bom OCR</p>
          <ul className="mt-1 list-inside list-disc space-y-0.5">
            <li>Luz natural, sem sombras sobre a folha</li>
            <li>Câmera paralela ao papel, folha inteira no quadro</li>
            <li>Letra legível e caneta escura</li>
          </ul>
        </div>
      </div>

      <div className="card space-y-4 p-5">
        <div>
          <label className="label" htmlFor="theme">Tema da redação</label>
          <input id="theme" className="input" required minLength={3} maxLength={300} value={theme} onChange={(e) => setTheme(e.target.value)} placeholder="Ex.: Desafios para a valorização da herança africana no Brasil" />
        </div>
        <div>
          <div className="flex items-end justify-between">
            <label className="label" htmlFor="text">Texto da redação</label>
            <span className={`mb-1 text-xs ${words < 150 ? 'text-amber-600' : 'text-slate-400'}`}>{words} palavras · ~{lines} linhas</span>
          </div>
          <textarea
            id="text"
            className="input min-h-[420px] font-serif text-[15px] leading-relaxed"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={12000}
            placeholder="Cole ou digite sua redação aqui — ou use o OCR ao lado e revise a transcrição."
          />
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">A IA avalia as 5 competências do ENEM (0 a 200 cada). Pode levar até 1 minuto.</p>
          <button type="submit" className="btn-primary px-6 py-2.5" disabled={correcting || ocr.running}>
            {correcting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {correcting ? 'Corrigindo...' : 'Corrigir com IA'}
          </button>
        </div>
      </div>
    </form>
  );
}

function EssayHistory({ onOpen }) {
  const toast = useToast();
  const [essays, setEssays] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get('/essays')
      .then(({ data }) => setEssays(data))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (essay) => {
    if (!window.confirm('Excluir esta redação do histórico?')) return;
    try {
      await api.delete(`/essays/${essay.id}`);
      setEssays((list) => list.filter((e) => e.id !== essay.id));
      toast.success('Redação excluída.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) return <Spinner label="Carregando histórico..." />;
  if (!essays.length) {
    return (
      <div className="card flex flex-col items-center gap-2 p-10 text-center">
        <FileText className="h-10 w-10 text-slate-300" />
        <p className="font-semibold text-slate-700">Você ainda não corrigiu nenhuma redação.</p>
      </div>
    );
  }

  const avg = Math.round(essays.reduce((a, e) => a + e.total_score, 0) / essays.length);

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500">{essays.length} redação(ões) · média de <strong className="text-slate-800">{avg}</strong> pontos</p>
      {essays.map((e) => (
        <div key={e.id} className="card flex items-center gap-4 p-4">
          <button onClick={() => onOpen(e.id)} className="flex flex-1 items-center gap-4 text-left">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-lg font-extrabold text-brand-700">{e.total_score}</div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-800">{e.theme}</p>
              <p className="text-xs text-slate-500">{formatDateTime(e.created_at)} · {e.competencies.map((c) => `${c.id}: ${c.score}`).join(' · ')}</p>
            </div>
          </button>
          <button onClick={() => remove(e)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label="Excluir">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

export default function Essay() {
  const toast = useToast();
  const [tab, setTab] = useState('new');
  const [result, setResult] = useState(null);
  const [loadingResult, setLoadingResult] = useState(false);

  const openEssay = async (id) => {
    setLoadingResult(true);
    try {
      const { data } = await api.get(`/essays/${id}`);
      setResult(data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoadingResult(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Correção de Redação</h1>
          <p className="mt-1 text-sm text-slate-500">OCR no navegador + IA gratuita avaliando as 5 competências do ENEM.</p>
        </div>
        {!result && (
          <div className="inline-flex rounded-xl bg-slate-100 p-1">
            <button onClick={() => setTab('new')} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold ${tab === 'new' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500'}`}>
              <Sparkles className="h-4 w-4" /> Nova
            </button>
            <button onClick={() => setTab('history')} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold ${tab === 'history' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500'}`}>
              <History className="h-4 w-4" /> Histórico
            </button>
          </div>
        )}
      </div>

      {loadingResult ? (
        <Spinner label="Abrindo correção..." />
      ) : result ? (
        <div className="space-y-4">
          <button className="btn-secondary" onClick={() => setResult(null)}>
            <ArrowLeft className="h-4 w-4" /> Voltar
          </button>
          <EssayResult essay={result} />
          {result.transcribed_text && (
            <details className="card p-5">
              <summary className="cursor-pointer font-semibold text-slate-700">Ver texto enviado</summary>
              <p className="mt-3 whitespace-pre-line font-serif text-[15px] leading-relaxed text-slate-700">{result.transcribed_text}</p>
            </details>
          )}
        </div>
      ) : tab === 'new' ? (
        <NewEssay onCorrected={setResult} />
      ) : (
        <EssayHistory onOpen={openEssay} />
      )}
    </div>
  );
}
