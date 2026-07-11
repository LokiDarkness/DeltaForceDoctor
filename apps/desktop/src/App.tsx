import { Activity, BookOpen, Database, FileText, Play, ShieldCheck, Wrench } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { modules as fallbackModules } from './lib/modules';
import type { DiagnosticModule, KnowledgeError, RepairAction } from './types/electron';

const statusClasses: Record<DiagnosticModule['status'], string> = {
  idle: 'bg-slate-700 text-slate-200', running: 'bg-cyan-500/20 text-cyan-200', passed: 'bg-emerald-500/20 text-emerald-200', warning: 'bg-amber-500/20 text-amber-200', failed: 'bg-rose-500/20 text-rose-200'
};
const nav = ['Dashboard', 'Scan', 'Repair', 'Knowledge Base', 'Reports', 'Settings'];

export function App() {
  const [active, setActive] = useState('Dashboard');
  const [modules, setModules] = useState<DiagnosticModule[]>(fallbackModules);
  const [knowledge, setKnowledge] = useState<KnowledgeError[]>([]);
  const [repairs, setRepairs] = useState<RepairAction[]>([]);
  const completed = useMemo(() => modules.filter((module) => ['passed', 'warning', 'failed'].includes(module.status)).length, [modules]);
  const findings = useMemo(() => modules.reduce((sum, module) => sum + module.findings, 0), [modules]);

  useEffect(() => { void hydrate(); }, []);

  async function hydrate() {
    if (!window.doctor) return;
    const [remoteModules, remoteKnowledge, remoteRepairs] = await Promise.all([window.doctor.listModules(), window.doctor.listKnowledge(), window.doctor.listRepairs()]);
    setModules(remoteModules); setKnowledge(remoteKnowledge); setRepairs(remoteRepairs);
  }

  async function runModule(moduleId: string) {
    setModules((items) => items.map((item) => item.id === moduleId ? { ...item, status: 'running' } : item));
    const result = window.doctor ? await window.doctor.runScan(moduleId) : { ...modules.find((m) => m.id === moduleId)!, status: 'passed' as const };
    setModules((items) => items.map((item) => item.id === moduleId ? result : item));
  }

  async function runAll() {
    setModules((items) => items.map((item) => ({ ...item, status: 'running' })));
    const results = window.doctor ? await window.doctor.runAllScans() : modules.map((item) => ({ ...item, status: 'passed' as const }));
    setModules(results);
  }

  async function runRepair(repairId: string) {
    const result = window.doctor ? await window.doctor.runRepair(repairId) : { status: 'blocked', output: 'Electron bridge unavailable.' };
    alert(`${result.status}: ${result.output || 'Repair action completed.'}`);
  }

  async function exportReport(format: 'json' | 'html') {
    const output = window.doctor ? await window.doctor.exportReport(format) : `reports/delta-force-doctor-report.${format}`;
    alert(`Report exported to ${output}`);
  }

  return <main className="min-h-screen bg-[radial-gradient(circle_at_top,#12345a,#07111f_55%)] text-slate-100">
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 py-8 lg:grid-cols-[260px_1fr]">
      <aside className="rounded-3xl border border-white/10 bg-slate-950/75 p-5 shadow-2xl shadow-cyan-950/30">
        <p className="mb-6 text-sm uppercase tracking-[0.35em] text-cyan-300">DeltaForceDoctor</p>
        <nav className="space-y-2">{nav.map((item) => <button key={item} onClick={() => setActive(item)} className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${active === item ? 'bg-cyan-400 text-slate-950' : 'text-slate-300 hover:bg-white/10'}`}>{item}</button>)}</nav>
      </aside>
      <section>
        <header className="mb-6 flex flex-col gap-4 rounded-3xl border border-cyan-400/20 bg-slate-950/70 p-8 md:flex-row md:items-center md:justify-between">
          <div><p className="text-sm uppercase tracking-[0.4em] text-cyan-300">Delta Force only</p><h1 className="mt-3 text-4xl font-bold">{active}</h1><p className="mt-3 max-w-3xl text-slate-300">Clean Architecture diagnostics for launch failures, ACE checks, Windows events, drivers, Steam, OCR matches, and audited safe repairs.</p></div>
          <div className="flex flex-wrap gap-3"><button onClick={() => void runAll()} className="rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-300"><Play className="mr-2 inline h-5 w-5" />Run All</button><button onClick={() => void exportReport('html')} className="rounded-2xl border border-cyan-300/40 px-5 py-3 font-semibold text-cyan-100 hover:bg-cyan-300/10"><FileText className="mr-2 inline h-5 w-5" />HTML Report</button></div>
        </header>
        <div className="mb-6 grid gap-4 md:grid-cols-4">{[[ 'Scanners', modules.length, Activity ], [ 'Completed', completed, ShieldCheck ], [ 'Findings', findings, Database ], [ 'Safe Repairs', repairs.length || 'Ready', Wrench ]].map(([label, value, Icon]) => <div key={label as string} className="rounded-2xl border border-white/10 bg-white/5 p-5"><Icon className="mb-3 h-6 w-6 text-cyan-300" /><div className="text-2xl font-bold">{value as string}</div><div className="text-sm text-slate-400">{label as string}</div></div>)}</div>
        {(active === 'Dashboard' || active === 'Scan') && <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{modules.map((module) => <article key={module.id} className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-xl"><div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-semibold">{module.name}</h2><p className="mt-2 text-sm leading-6 text-slate-400">{module.description}</p>{module.recommendation && <p className="mt-3 text-sm text-cyan-200">{module.recommendation}</p>}</div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[module.status]}`}>{module.status}</span></div><div className="mt-5 flex items-center justify-between"><span className="text-sm text-slate-400">{module.findings} findings</span><button onClick={() => void runModule(module.id)} className="rounded-xl border border-cyan-300/40 px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-300/10">Run</button></div></article>)}</section>}
        {active === 'Repair' && <section className="grid gap-4 md:grid-cols-2">{repairs.map((repair) => <article key={repair.id} className="rounded-2xl border border-white/10 bg-slate-900/80 p-5"><h2 className="text-xl font-semibold">{repair.title}</h2><p className="mt-2 text-sm text-slate-400">{repair.description}</p><p className="mt-3 text-xs text-slate-500">{repair.requiresAdmin ? 'Requires administrator approval' : 'No administrator requirement'} · Safe allow-listed action</p><button onClick={() => void runRepair(repair.id)} className="mt-4 rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950">Run / Open</button></article>)}</section>}
        {active === 'Knowledge Base' && <section className="grid gap-4 md:grid-cols-2">{knowledge.map((item) => <article key={item.errorId} className="rounded-2xl border border-white/10 bg-slate-900/80 p-5"><div className="flex justify-between gap-4"><h2 className="text-xl font-semibold"><BookOpen className="mr-2 inline h-5 w-5 text-cyan-300" />{item.errorId} · {item.name}</h2><span className="text-sm text-amber-200">{item.severity}</span></div><p className="mt-2 text-sm text-slate-300">{item.description}</p><ul className="mt-3 list-disc pl-5 text-sm text-slate-400">{item.repairSteps.slice(0, 3).map((step) => <li key={step}>{step}</li>)}</ul></article>)}</section>}
        {active === 'Reports' && <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6"><h2 className="text-2xl font-semibold">Export diagnostics</h2><p className="mt-2 text-slate-400">Generate JSON or HTML reports containing hardware, Windows, driver, scanner, knowledge, and repair history data.</p><div className="mt-5 flex gap-3"><button onClick={() => void exportReport('json')} className="rounded-xl bg-cyan-400 px-4 py-2 font-semibold text-slate-950">JSON</button><button onClick={() => void exportReport('html')} className="rounded-xl border border-cyan-300/40 px-4 py-2 font-semibold text-cyan-100">HTML</button></div></div>}
        {active === 'Settings' && <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6"><h2 className="text-2xl font-semibold">Safety policy</h2><p className="mt-2 text-slate-400">DeltaForceDoctor never bypasses anti-cheat, never modifies game files illegally, and only opens official vendor driver pages.</p></div>}
      </section>
    </div>
  </main>;
}
