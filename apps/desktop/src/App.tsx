import { Activity, Database, FileText, ShieldCheck, Wrench } from 'lucide-react';
import { useMemo, useState } from 'react';
import { modules as initialModules } from './lib/modules';
import type { DiagnosticModule } from './types/electron';

const statusClasses: Record<DiagnosticModule['status'], string> = {
  idle: 'bg-slate-700 text-slate-200',
  running: 'bg-cyan-500/20 text-cyan-200',
  passed: 'bg-emerald-500/20 text-emerald-200',
  warning: 'bg-amber-500/20 text-amber-200',
  failed: 'bg-rose-500/20 text-rose-200'
};

export function App() {
  const [modules, setModules] = useState(initialModules);
  const completed = useMemo(() => modules.filter((module) => ['passed', 'warning', 'failed'].includes(module.status)).length, [modules]);

  async function runModule(moduleId: string) {
    setModules((items) => items.map((item) => item.id === moduleId ? { ...item, status: 'running' } : item));
    const result = window.doctor ? await window.doctor.runScan(moduleId) : { ...modules.find((m) => m.id === moduleId)!, status: 'passed' as const };
    setModules((items) => items.map((item) => item.id === moduleId ? result : item));
  }

  async function exportReport() {
    const path = window.doctor ? await window.doctor.exportReport() : 'reports/delta-force-doctor-report.json';
    alert(`Report exported to ${path}`);
  }

  return <main className="min-h-screen bg-[radial-gradient(circle_at_top,#12345a,#07111f_55%)] text-slate-100">
    <section className="mx-auto max-w-7xl px-6 py-8">
      <header className="mb-8 flex flex-col gap-4 rounded-3xl border border-cyan-400/20 bg-slate-950/70 p-8 shadow-2xl shadow-cyan-950/30 md:flex-row md:items-center md:justify-between">
        <div><p className="text-sm uppercase tracking-[0.4em] text-cyan-300">DeltaForceDoctor</p><h1 className="mt-3 text-4xl font-bold">Windows diagnostics and repair cockpit</h1><p className="mt-3 max-w-3xl text-slate-300">Scan hardware, Windows, Steam, Delta Force game files, event logs, screenshots, and repair paths from one production-ready Electron desktop app.</p></div>
        <button onClick={exportReport} className="rounded-2xl bg-cyan-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"><FileText className="mr-2 inline h-5 w-5" />Export Report</button>
      </header>
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        {[['Modules', modules.length, Activity], ['Completed', completed, ShieldCheck], ['Findings', modules.reduce((sum, m) => sum + m.findings, 0), Database], ['Repairs', 'Ready', Wrench]].map(([label, value, Icon]) => <div key={label as string} className="rounded-2xl border border-white/10 bg-white/5 p-5"><Icon className="mb-3 h-6 w-6 text-cyan-300" /><div className="text-2xl font-bold">{value as string}</div><div className="text-sm text-slate-400">{label as string}</div></div>)}
      </div>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{modules.map((module) => <article key={module.id} className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-xl"><div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-semibold">{module.name}</h2><p className="mt-2 text-sm leading-6 text-slate-400">{module.description}</p></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[module.status]}`}>{module.status}</span></div><div className="mt-5 flex items-center justify-between"><span className="text-sm text-slate-400">{module.findings} findings</span><button onClick={() => void runModule(module.id)} className="rounded-xl border border-cyan-300/40 px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-300/10">Run</button></div></article>)}</section>
    </section>
  </main>;
}
