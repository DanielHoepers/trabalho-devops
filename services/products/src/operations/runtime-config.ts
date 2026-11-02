const publicSecrets = new Set(['change-me-in-development', 'change-me-internal-development', 'products', 'inventory', 'guest', 'rabbitmq', 'change-me']);

type Environment = Record<string, string | undefined>;
export function resolvePort(env: Environment): number {
  const raw = env.PORT ?? env.PRODUCTS_PORT ?? '3000';
  if (!/^\d+$/.test(raw) || Number(raw) < 1 || Number(raw) > 65535) throw new Error('Porta inválida');
  return Number(raw);
}
export function databaseTls(enabled: string | undefined): false | { rejectUnauthorized: true } {
  return enabled === 'true' ? { rejectUnauthorized: true } : false;
}
export function validateCloudConfig(env: Environment): void {
  if (!env.APP_ENV || env.APP_ENV === 'local') return;
  if (!['dev', 'homol'].includes(env.APP_ENV)) throw new Error('APP_ENV deve ser local, dev ou homol');
  if (env.APP_ENV === 'homol' && (env.SWAGGER_ENABLED !== 'false' || env.NODE_ENV !== 'production')) throw new Error('HOMOL exige Swagger desligado e NODE_ENV=production');
  const keys = ['JWT_SECRET', 'INTERNAL_SERVICE_TOKEN', 'METRICS_TOKEN', 'RABBITMQ_URL',
    ...['WRITE', 'READ'].flatMap(side => ['HOST', 'NAME', 'USER', 'PASSWORD'].map(field => `PRODUCTS_${side}_DB_${field}`))];
  for (const key of keys) {
    const value = env[key];
    const secret = key.endsWith('PASSWORD') || key.endsWith('TOKEN') || key.endsWith('SECRET');
    if (!value?.trim() || (secret && publicSecrets.has(value))) throw new Error(`Configuração cloud ausente ou fictícia: ${key}`);
  }
  try {
    const broker = new URL(env.RABBITMQ_URL!);
    if (broker.protocol !== 'amqps:' || !broker.hostname || !broker.username || !broker.password || publicSecrets.has(decodeURIComponent(broker.password))) throw new Error();
  } catch {
    throw new Error('RABBITMQ_URL exige AMQPS e credenciais próprias');
  }
  if (env.METRICS_TOKEN === env.INTERNAL_SERVICE_TOKEN || env.METRICS_TOKEN === env.JWT_SECRET) throw new Error('Token de métricas deve ser exclusivo');
}
