import { resolvePort, validateCloudConfig, databaseTls } from './runtime-config';

describe('configuração cloud', () => {
  it('prioriza PORT e mantém fallback local', () => {
    expect(resolvePort({ PORT: '10000', PRODUCTS_PORT: '3001' })).toBe(10000);
    expect(resolvePort({ PRODUCTS_PORT: '3001' })).toBe(3001);
    expect(resolvePort({})).toBe(3000);
  });
  it.each(['', '0', '-1', '65536', 'abc', '3.5'])('rejeita porta inválida %s', port => {
    expect(() => resolvePort({ PORT: port })).toThrow();
  });
  it('recusa credenciais ausentes ou fictícias na cloud', () => {
    expect(() => validateCloudConfig({ APP_ENV: 'dev' })).toThrow();
    expect(() => validateCloudConfig({ APP_ENV: 'other' })).toThrow();
    expect(() => validateCloudConfig({})).not.toThrow();
  });
  it('exige swagger desligado na homologação', () => {
    expect(() => validateCloudConfig({ APP_ENV: 'homol', SWAGGER_ENABLED: 'true' })).toThrow();
  });
  it('aceita nome de usuário válido sem aceitar senha fictícia', () => {
    const cfg: Record<string, string> = { APP_ENV: 'dev', JWT_SECRET: 'test-jwt', INTERNAL_SERVICE_TOKEN: 'test-internal', METRICS_TOKEN: 'test-metrics', RABBITMQ_URL: 'amqps://products:test-broker-secret@broker.example/dev' };
    for (const side of ['WRITE', 'READ']) {
      for (const field of ['HOST', 'NAME', 'USER']) cfg[`PRODUCTS_${side}_DB_${field}`] = 'products';
      cfg[`PRODUCTS_${side}_DB_PASSWORD`] = 'test-database-secret';
    }
    expect(() => validateCloudConfig(cfg)).not.toThrow();
    cfg.PRODUCTS_WRITE_DB_PASSWORD = 'products';
    expect(() => validateCloudConfig(cfg)).toThrow();
  });
  it.each([['INTERNAL_SERVICE_TOKEN', 'change-me-internal-development'], ['JWT_SECRET', 'change-me-in-development'], ['METRICS_TOKEN', 'change-me-internal-development'], ['PRODUCTS_WRITE_DB_PASSWORD', 'products'], ['PRODUCTS_READ_DB_PASSWORD', 'products'], ['RABBITMQ_URL', 'amqp://products:products@rabbitmq:5672'], ['RABBITMQ_URL', 'amqps://products:products@broker.example/dev'], ['RABBITMQ_URL', 'amqps://products:guest@broker.example/dev']])('bloqueia segredo público em %s', (key, value) => {
    const cfg: Record<string, string> = { APP_ENV: 'homol', NODE_ENV: 'production', SWAGGER_ENABLED: 'false', JWT_SECRET: 'test-jwt', INTERNAL_SERVICE_TOKEN: 'test-internal', METRICS_TOKEN: 'test-metrics', RABBITMQ_URL: 'amqps://products:test-broker-secret@broker.example/dev' };
    for (const side of ['WRITE', 'READ']) {
      for (const field of ['HOST', 'NAME', 'USER', 'PASSWORD']) cfg[`PRODUCTS_${side}_DB_${field}`] = 'test-database-config';
    }
    expect(() => validateCloudConfig(cfg)).not.toThrow();
    cfg[key] = value;
    expect(() => validateCloudConfig(cfg)).toThrow();
  });
  it('habilita TLS com validação de certificado', () => {
    expect(databaseTls('true')).toEqual({ rejectUnauthorized: true });
    expect(databaseTls(undefined)).toBe(false);
  });
});
