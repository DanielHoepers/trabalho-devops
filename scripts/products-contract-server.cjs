// Harness de contrato HTTP: controllers reais, dependências de negócio substituídas.
require('reflect-metadata');
const { Test } = require('@nestjs/testing');
const { ConfigModule, ConfigService } = require('@nestjs/config');
const { JwtModule } = require('@nestjs/jwt');
const root = '../services/products/dist/';
const load = file => require(root + file);
async function main() {
  const { OperationsModule } = load('operations/operations.module');
  const { ProductsController } = load('modules/products/presentation/http/products.controller');
  const { InternalProductsController } = load('modules/products/presentation/http/internal-products.controller');
  const { HealthModule } = load('health/health.module');
  const { setupSwagger } = load('common/swagger/swagger.setup');
  const providers = [
    ['CreateProductUseCase', 'create-product.use-case'], ['GetProductUseCase', 'get-product.use-case'],
    ['ListProductsUseCase', 'list-products.use-case'], ['UpdateProductUseCase', 'update-product.use-case'],
  ].map(([name, file]) => ({ provide: load('modules/products/application/use-cases/' + file)[name], useValue: {} }));
  const ref = await Test.createTestingModule({
    imports: [ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true, load: [() => ({ NODE_ENV: 'development', SWAGGER_ENABLED: 'true' })] }), JwtModule.register({}), OperationsModule, HealthModule],
    controllers: [ProductsController, InternalProductsController], providers,
  }).compile();
  const app = ref.createNestApplication();
  setupSwagger(app, app.get(ConfigService));
  await app.listen(Number(process.env.CONTRACT_PORT || 3100), '0.0.0.0');
  for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => app.close().then(() => process.exit(0)));
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
