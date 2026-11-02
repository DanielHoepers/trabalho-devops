import { Injectable } from '@nestjs/common';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

@Injectable()
export class BuildInfoService {
  private readonly info: { version: string; commit: string };
  constructor() {
    const file = join(__dirname, '../build-info.json');
    this.info = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {
      version: JSON.parse(readFileSync(join(process.cwd(), process.cwd().endsWith('/products') ? 'package.json' : 'services/products/package.json'), 'utf8')).version,
      commit: 'local',
    };
    if (process.env.APP_ENV && process.env.APP_ENV !== 'local' && !existsSync(file)) throw new Error('Metadados de build obrigatórios na cloud');
  }
  get(): { version: string; commit: string } { return { ...this.info }; }
}
