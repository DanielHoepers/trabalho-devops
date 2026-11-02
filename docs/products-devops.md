# DevOps de Produtos

Estado: implementação local em validação; serviços externos só serão marcados
como concluídos após suas evidências. O Inventory do Daniel é preservado.

## Configuração GitHub

Repositório: guilhermeschr/trabalho-devops. Workflow Products.

| Tipo | Nome | Local |
|---|---|---|
| Secret | PRODUCTS_SONAR_TOKEN | Repositório |
| Variable | PRODUCTS_SONAR_ORGANIZATION | Repositório |
| Variable | PRODUCTS_SONAR_PROJECT_KEY | Repositório |
| Variable | PRODUCTS_DOCKERHUB_USERNAME | Repositório: d2gtrabalhos |
| Secret | PRODUCTS_DOCKERHUB_TOKEN | Repositório: publicação apenas |
| Variable | PRODUCTS_DEPLOY_ENABLED | Repositório; true só após preparar ambientes |
| Secret | PRODUCTS_RENDER_API_KEY | Environment DEV/HOMOL |
| Variable | PRODUCTS_RENDER_SERVICE_ID | Environment DEV/HOMOL |
| Variable | PRODUCTS_APP_URL | Environment DEV/HOMOL; origem HTTPS |

DEV restringe develop; HOMOL restringe main. Para deploy automático do T2,
não exigir aprovação manual em cada execução. Não alterar variáveis Inventory.
Não executar pull_request_target com código não confiável. Configurar proteção
de branches com os checks reais após a primeira execução; não usar bypass.

## SonarQube Cloud

Organização OSS `guilhermeschr` e projeto `guilhermeschr_products` (Delivery Products)
criados pelo Safari em 02/11/2026. Usar projeto próprio,
main principal, develop longa, análise automática desligada e análise CI com
LCOV. Plano Free comum não substitui suporte OSS a branches. Não iniciar trial.
Inicializar main antes das demais análises; configurar referências do Sonar sem
publicar/deployar uma main incompleta. Identificadores públicos em Variables,
token em Secrets; não documentar seu valor.

Docker Hub: repositório público `d2gtrabalhos/products-service` criado em 02/11/2026,
ainda sem imagem publicada durante esta preparação.

## Render e dependências

Criar products-dev e products-homol, imagem pública
`docker.io/d2gtrabalhos/products-service`, plano gratuito. Runtime recebe PORT.
Sem deploy automático paralelo no painel; CD usa API e digest aprovado.

Pré-condição: confirmar capacidade gratuita dos provedores existentes para
products_dev_write, products_dev_read, products_homol_write,
products_homol_read e mensageria própria por ambiente. Não usar bancos do
Inventory. Se não houver capacidade/permissão gratuita, registrar bloqueio
antes de criar recursos. Não contratar plano pago.

Variáveis de runtime: APP_ENV, NODE_ENV, SWAGGER_ENABLED, JWT_SECRET,
INTERNAL_SERVICE_TOKEN, METRICS_TOKEN, PRODUCTS_DB_SSL,
PRODUCTS_{WRITE,READ}_DB_{HOST,PORT,NAME,USER,PASSWORD}, RABBITMQ_URL,
RABBITMQ_EXCHANGE e RABBITMQ_PRODUCTS_QUEUE. Use PostgreSQL TLS validado e
AMQPS externos. Tokens internos/JWT devem corresponder aos serviços do mesmo
ambiente; métricas têm token independente. Health check /health é liveness;
valide migrações, broker e convergência CQRS também antes de aprovar a entrega.

DEV: APP_ENV=dev, NODE_ENV=development, SWAGGER_ENABLED=true.
HOMOL: APP_ENV=homol, NODE_ENV=production, SWAGGER_ENABLED=false.

## Releases e promoção

Versão oficial em services/products/package.json e package-lock.json.
0.2.0-dev.<run_number> em develop, 0.2.0 em main. Git tags products-v<versão>.
Publicar release só após qualidade; retentativas reaproveitam digest e não
sobrescrevem versão existente de outro commit. Incremente versão antes de uma
nova entrega estável. Não usar latest. Consulte GET /api/v1/products/version.

Após DEV aprovado, promover develop → main/HOMOL. Depois, numa nova feature,
incrementar somente versão para 0.2.1 e integrar em develop. HOMOL permanece
0.2.0 enquanto DEV publica 0.2.1-dev.<build>.

Rollback: escolher digest anterior aprovado e implantar no serviço correto;
verificar versão e contratos. Não apagar bancos, migrações ou volumes.

## Validação e evidências

Executar testes Produtos, tipagem, build, testes Python de release/deploy,
Swagger UI/JSON, Docker build e fluxo Compose. Monitoramento segue
../monitoring/products/README.md. Guardar URLs dos pipelines e Sonar, URLs
DEV/HOMOL, tags Git, digests, respostas de versão e dashboard com dados reais.
Não registrar tokens, URLs com credenciais nem chaves de deploy.

- [ ] Projeto Sonar OSS e Quality Gate remotos
- [ ] Credenciais GitHub configuradas
- [ ] Imagens Docker Hub e releases publicadas
- [ ] Render DEV/HOMOL e CD automático
- [ ] CQRS cloud e comunicação autenticada
- [ ] Prometheus/Grafana com dados reais
- [ ] DEV na próxima PATCH, HOMOL na estável


## Evidências locais de 02/11/2026

- Produtos: 75 testes Jest aprovados; cobertura acima de 50% nas quatro métricas.
- Auth: 52 testes; Pedidos: 82 testes, ambos aprovados com cobertura.
- Tipagem de todos os workspaces e build de Produtos aprovados.
- Dockerfile construído; metadados conferidos no arquivo e nas labels da imagem.
- 12 testes Python de releases/deploy aprovados; actionlint sem avisos.
- Promtool aprovou configuração e duas regras com targets/tokens fictícios.
- Infra de teste isolada products-devops-test, porta 18080: Swagger UI/JSON e
  versão pública aprovados; fluxo completo e fluxo Inventory aprovados.
- Revisão independente: corrigido bloqueio de token interno público e de
  credenciais RabbitMQ locais na cloud; regressões verificadas RED → GREEN.
- PRODUCTS_SONAR_TOKEN e Variables PRODUCTS_SONAR_ORGANIZATION,
  PRODUCTS_SONAR_PROJECT_KEY e PRODUCTS_DOCKERHUB_USERNAME cadastrados no GitHub.

As evidências locais não comprovam publicação de imagem, deploy remoto nem
coleta de métricas dos ambientes cloud.
