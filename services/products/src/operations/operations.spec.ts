import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import request from 'supertest';
import { OperationsModule } from './operations.module';
import { BuildInfoService } from './build-info.service';

describe('operações de Produtos', () => {
  it('retorna versão pública sem aceitar override da identidade por runtime', async () => {
    const ref = await Test.createTestingModule({ imports: [OperationsModule] })
      .overrideProvider(ConfigService).useValue(new ConfigService({ APP_ENV: 'homol', APP_VERSION: 'fake' }))
      .overrideProvider(BuildInfoService).useValue({ get: () => ({ version: '0.2.0', commit: 'a'.repeat(40) }) }).compile();
    const app = ref.createNestApplication();
    await app.init();
    try {
      const response = await request(app.getHttpServer()).get('/api/v1/products/version').expect(200);
      expect(response.body).toEqual({ service: 'products-service', version: '0.2.0', commit: 'a'.repeat(40), environment: 'homol' });
    } finally { await app.close(); }
  });
  it('protege métricas e limita cardinalidade para caminhos desconhecidos', async () => {
    const ref = await Test.createTestingModule({ imports: [OperationsModule] })
      .overrideProvider(ConfigService).useValue(new ConfigService({ APP_ENV: 'dev', METRICS_TOKEN: 'test-metrics-token' })).compile();
    const app = ref.createNestApplication();
    await app.init();
    try {
      await request(app.getHttpServer()).get('/metrics').expect(401);
      await request(app.getHttpServer()).get('/metrics').set('Authorization', 'Bearer invalid').expect(401);
      await request(app.getHttpServer()).get('/private-id-123').expect(404);
      await request(app.getHttpServer()).get('/api/v1/products/version').expect(200);
      const response = await request(app.getHttpServer()).get('/metrics').set('Authorization', 'Bearer test-metrics-token').expect(200);
      expect(response.text).toContain('http_requests_total');
      expect(response.text).toContain('route="unmatched"');
      expect(response.text).not.toContain('private-id-123');
      expect(response.text).toContain('products_build_info');
    } finally { await app.close(); }
  });
});
