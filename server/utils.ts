import path from 'path';
import { fileURLToPath } from 'url';

// Handle path resolution for both ESM and CommonJS
export function getDirname() {
  try {
    // For ESM
    if (typeof import.meta.url !== 'undefined') {
      return path.dirname(fileURLToPath(import.meta.url));
    }
  } catch (e) {
    // Ignore errors
  }
  
  // For CommonJS or fallback
  return typeof __dirname !== 'undefined' ? __dirname : process.cwd();
}

// Get the project root directory
export function getProjectRoot() {
  return path.resolve(getDirname(), '..');
}

// Resolve a path relative to the project root
export function resolveFromRoot(...pathSegments: string[]) {
  return path.resolve(getProjectRoot(), ...pathSegments);
}
