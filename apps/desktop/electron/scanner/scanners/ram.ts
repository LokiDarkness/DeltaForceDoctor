import os from 'node:os';
import type { Scanner } from '../types.js';
import { pass, warn } from '../result.js';
export const ramScanner: Scanner = { id: 'ram', name: 'RAM', description: 'Checks installed and available memory.', async run() { const totalGb=Math.round(os.totalmem()/1024/1024/1024); const freeGb=Math.round(os.freemem()/1024/1024/1024); const details={ totalGb, freeGb }; return totalGb >= 16 ? pass(this.id,this.name,'Memory capacity is suitable for modern gameplay.','Keep browser and capture tools closed if stutter occurs.',details) : warn(this.id,this.name,'Installed memory is below the recommended 16 GB target.','Close background apps or consider a memory upgrade.',details,false,'medium'); } };
