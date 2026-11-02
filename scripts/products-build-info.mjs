import { readFileSync, writeFileSync } from 'node:fs';
const base = JSON.parse(readFileSync('services/products/package.json', 'utf8')).version;
const version = process.env.BUILD_VERSION || base;
const commit = process.env.BUILD_COMMIT || 'local';
if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(-dev\.[1-9]\d*)?$/u.test(version) || !/^(local|[a-f0-9]{40})$/u.test(commit)) throw new Error('Metadados de build inválidos');
writeFileSync('services/products/dist/build-info.json', JSON.stringify({ version, commit }) + '\n');
