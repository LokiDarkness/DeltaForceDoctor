import type { Scanner } from './types.js';
import { aceScanner } from './scanners/ace.js';
import { biosScanner } from './scanners/bios.js';
import { cpuScanner } from './scanners/cpu.js';
import { deltaForceScanner } from './scanners/deltaforce.js';
import { diskScanner } from './scanners/disk.js';
import { driverScanner } from './scanners/driver.js';
import { eventViewerScanner } from './scanners/eventviewer.js';
import { gpuScanner } from './scanners/gpu.js';
import { networkScanner } from './scanners/network.js';
import { overlayScanner } from './scanners/overlay.js';
import { ramScanner } from './scanners/ram.js';
import { secureBootScanner } from './scanners/secureboot.js';
import { steamScanner } from './scanners/steam.js';
import { tpmScanner } from './scanners/tpm.js';
import { virtualizationScanner } from './scanners/virtualization.js';
import { windowsScanner } from './scanners/windows.js';

export function createScanners(): Scanner[] {
  return [cpuScanner, gpuScanner, ramScanner, diskScanner, biosScanner, tpmScanner, secureBootScanner, virtualizationScanner, windowsScanner, steamScanner, driverScanner, networkScanner, overlayScanner, aceScanner, deltaForceScanner, eventViewerScanner];
}
