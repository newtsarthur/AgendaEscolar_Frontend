import { BookOpen, CalendarCheck, GraduationCap, PenLine } from 'lucide-react';

export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-gradient-to-br from-brand-700 via-brand-600 to-indigo-500 p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-white/15 p-2.5"><GraduationCap className="h-6 w-6" /></div>
          <span className="text-lg font-extrabold">Agenda Escolar Inteligente</span>
        </div>
        <div>
          <h2 className="text-4xl font-extrabold leading-tight">Sua rotina de estudos para o ENEM, organizada em um só lugar.</h2>
          <ul className="mt-8 space-y-4 text-brand-100">
            <li className="flex items-center gap-3"><CalendarCheck className="h-5 w-5" /> Agenda de provas, trabalhos e revisões</li>
            <li className="flex items-center gap-3"><BookOpen className="h-5 w-5" /> Biblioteca com provas oficiais e banco de questões</li>
            <li className="flex items-center gap-3"><PenLine className="h-5 w-5" /> Correção de redação com OCR + IA nas 5 competências</li>
          </ul>
        </div>
        <p className="text-sm text-brand-200">100% gratuito · feito para estudantes do Ensino Médio</p>
      </div>
      <div className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="rounded-xl bg-brand-600 p-2 text-white"><GraduationCap className="h-5 w-5" /></div>
            <span className="font-extrabold">Agenda Escolar Inteligente</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
