import os from 'node:os';
import type { Scanner } from '../types.js';
import { pass, warn } from '../result.js';
export const cpuScanner: Scanner = { id: 'cpu', name: 'CPU', description: 'Collects processor model, architecture, and core availability.', async run() { const cpus=os.cpus(); const details={ model: cpus[0]?.model ?? 'unknown', logicalCores: cpus.length, architecture: os.arch() }; return cpus.length >= 4 ? pass(this.id,this.name,'CPU inventory collected successfully.','No CPU action required.',details) : warn(this.id,this.name,'CPU has fewer than 4 logical cores.','Close background workloads before launching Delta Force.',details,false,'low'); } };
