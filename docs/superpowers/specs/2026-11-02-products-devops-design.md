# DevOps de Produtos — desenho aprovado

Produtos terá pipeline próprio GitHub Actions, imagem pública Docker Hub
`d2gtrabalhos/products-service`, DEV em develop e HOMOL em main. Somente
serviços gratuitos; Prometheus/Grafana locais para demonstração. A alternativa
Grafana Cloud foi considerada e descartada pelo usuário para esta entrega.

Como no Inventory do Daniel, Render receberá HTTPS diretamente, inclusive na
rota interna protegida por X-Internal-Token; Nginx local continuará bloqueando
/internal/. Pedidos chama Produtos e Inventory; não criar chamada entre estes.
Dados: quatro bancos lógicos próprios e mensageria separada por ambiente.

Versão pública: GET /api/v1/products/version sem JWT, resposta
{service, version, commit, environment}. Versão/commit pertencem ao build;
APP_ENV identifica ambiente. Porta: PORT, PRODUCTS_PORT, 3000.
Swagger DEV ligado; HOMOL desligado, inclusive se flag incorreta.

SemVer inicial 0.2.0; develop publica 0.2.0-dev.<run_number>, main publica
0.2.0. Git tags prefixadas products-v. Publicar após testes/cobertura e Quality
Gate; implantar por digest e validar identidade. Retentativa reutiliza artefato;
nunca substituir versão estável por outro commit. Após promoção, DEV avança
para 0.2.1 sem mudar HOMOL.

SonarQube Cloud: usar sessão Safari do usuário, projeto exclusivo e plano OSS
com branches. Sem trial pago nem bypass do gate. Docker Hub autenticado como
d2gtrabalhos. Métricas /metrics protegidas por token exclusivo, prom-client,
labels limitadas, dashboard DEV/HOMOL, validação no CI e coleta local contínua
enquanto os containers estiverem ativos.

Fora do escopo: alterar negócio, dados ou pipeline do Inventory; modificar
Pedidos sem coordenação; recursos pagos. Acesso ao plano OSS, secrets,
capacidade de dados gratuita e IDs cloud são pré-condições verificáveis.
