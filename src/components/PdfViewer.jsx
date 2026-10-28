import { CalendarPlus, Download, ExternalLink, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import Modal from './Modal.jsx';

/**
 * Visualizador integrado: usa o leitor nativo do navegador via <iframe>.
 * Caso o servidor do PDF bloqueie a incorporação, o aluno pode alternar para o visualizador do Google.
 */
export default function PdfViewer({ material, onClose, onSchedule }) {
  const [mode, setMode] = useState('native');

  useEffect(() => setMode('native'), [material]);

  if (!material) return null;

  const src =
    mode === 'native'
      ? `${material.pdf_url}#view=FitH`
      : `https://docs.google.com/viewer?url=${encodeURIComponent(material.pdf_url)}&embedded=true`;

  return (
    <Modal open={Boolean(material)} onClose={onClose} title={material.title} size="max-w-6xl">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-5 py-3">
        <span className="text-sm text-slate-500">{material.subject} · {material.topic}</span>
        <div className="ml-auto flex flex-wrap gap-2">
          <button className="btn-secondary px-3 py-1.5" onClick={() => setMode(mode === 'native' ? 'google' : 'native')}>
            <RefreshCw className="h-4 w-4" />
            {mode === 'native' ? 'Visualizador alternativo' : 'Visualizador nativo'}
          </button>
          <a className="btn-secondary px-3 py-1.5" href={material.pdf_url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" /> Nova aba
          </a>
          <a className="btn-secondary px-3 py-1.5" href={material.pdf_url} download target="_blank" rel="noopener noreferrer">
            <Download className="h-4 w-4" /> Baixar
          </a>
          <button className="btn-primary px-3 py-1.5" onClick={() => onSchedule(material)}>
            <CalendarPlus className="h-4 w-4" /> Agendar estudo
          </button>
        </div>
      </div>
      <div className="h-[75vh] bg-slate-100">
        <iframe key={src} title={material.title} src={src} className="h-full w-full" />
      </div>
      <p className="px-5 py-2 text-xs text-slate-400">
        No celular, alguns navegadores não exibem PDFs incorporados — use "Visualizador alternativo" ou "Nova aba".
      </p>
    </Modal>
  );
}
