import { Loader2 } from 'lucide-react';

export default function Spinner({ label, className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-2 py-8 text-sm text-slate-500 ${className}`}>
      <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
      {label && <span>{label}</span>}
    </div>
  );
}
