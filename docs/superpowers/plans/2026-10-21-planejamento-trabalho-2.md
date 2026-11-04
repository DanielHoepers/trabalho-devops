# Planejamento do Trabalho 2 - CI/CD e Observabilidade

> Para execução por agentes: implementar uma etapa por vez com a skill `superpowers:executing-plans`; se o usuário escolher delegação, usar `superpowers:subagent-driven-development`. Os checkboxes acompanham a implementação futura.

**Objetivo:** evoluir os microsserviços do T1 para ter integração contínua, imagens publicadas, deploy automático em DEV e HOMOL e métricas visíveis em dashboards.
**Arquitetura:** manter Auth, Produtos, Estoque e Pedidos independentes, com um pipeline por serviço. Preservar Nginx como entrada externa, comunicação REST interna, bancos próprios, CQRS, Outbox e RabbitMQ; adicionar a infraestrutura do T2 ao redor dessa base.
**Stack:** GitHub Actions, Docker, PostgreSQL, RabbitMQ, Nginx, Prometheus e Grafana; SonarQube ou SonarCloud; Render ou provedor equivalente a escolher.
**Fontes:** PDF `T2 - Especificação - DevOps-V1.pdf` (3 páginas), `AGENTS.md` e [especificação do projeto](../../especificacao-delivery-microservicos.md), versão 2.10.
**Data:** 21/10/2026.
**Status:** planejamento; pipelines, deploys e monitoramento ainda não implementados por esta tarefa.

## 1. Visão geral rápida

O T2 pede aproveitar o sistema do T1 e automatizar o caminho entre alteração de código e aplicação disponível na nuvem:

```text
Branch de trabalho → PR para develop → CI → imagem publicada → deploy DEV
                       develop → PR para main → CI → imagem → deploy HOMOL
Microsserviços → métricas coletadas pelo Prometheus → dashboards no Grafana
```

A publicação e o deploy devem ocorrer somente depois das verificações. Em PR, executar validação sem publicar imagens nem realizar deploy.

### O que você pode pedir para a IA fazer

- Analisar o projeto e comparar o que existe com os requisitos do T2.
- Preparar os arquivos do GitHub Actions, um pipeline por microsserviço.
- Configurar testes, cobertura e integração com Sonar.
- Preparar publicação de imagens Docker e versionamento semântico.
- Preparar configurações separadas para DEV e HOMOL.
- Instrumentar os serviços e configurar Prometheus e Grafana.
- Criar scripts de validação, README e roteiro de apresentação.

Contas, responsáveis pelos serviços, orçamento e acessos externos precisam ser definidos por você/equipe. A IA pode preparar arquivos e orientar a configuração; cadastrar secrets deve ocorrer diretamente nas plataformas. Nesta tarefa, o resultado é este plano. Push, merge e publicação externa dependem de solicitação explícita, conforme `AGENTS.md`.

## 2. Requisitos do enunciado e evidências de entrega

| Requisito obrigatório do PDF | Como demonstrar | Etapa |
|---|---|---|
| Reutilizar os microsserviços do T1 | Sistema existente continua funcionando após as mudanças | 2 e 10 |
| Git Flow com `main`, `develop` e `feature/*` | Histórico e branches; resolver conflito com a regra local antes de criar branches | 1 |
| GitHub Actions: build, testes e SonarQube ou SonarCloud | Execução real com logs e resultado de análise | 4 e 5 |
| Deploy automático: `develop` → DEV; `main` → HOMOL | Alteração integrada dispara o deploy no ambiente correto | 7 |
| Render ou equivalente | Aplicações acessíveis na nuvem | 3 e 7 |
| Swagger habilitado em DEV e desabilitado em HOMOL | Interface e JSON funcionam em DEV; ambos indisponíveis em HOMOL | 3 e 7 |
| Dockerfile, build automático e publicação de imagem | Imagem de cada serviço publicada em registry | 6 |
| Semantic Versioning | Versão `MAJOR.MINOR.PATCH`, tags e imagem rastreáveis | 6 |
| Dependabot e secrets do GitHub | Configuração ativa e secrets usados pelo workflow | 4 |
| Prometheus e Grafana | Coleta funcionando e dashboards com dados dos serviços | 8 e 9 |
| Um microsserviço por aluno | Tabela de responsáveis preenchida | 1 |
| Cada serviço implantado separadamente, um pipeline por serviço | Workflow e unidade de deploy identificáveis para cada serviço | 5 e 7 |
| Repositório, pipeline funcional, URLs DEV/HOMOL, dashboards e README | Links e roteiro reproduzível na documentação final | 10 |

O PDF não informa prazo, quantidade de integrantes, orçamento, registry obrigatório, métricas específicas, percentual de cobertura ou necessidade de alertas. A cobertura de 50% vem das regras existentes do projeto. GHCR, métricas sugeridas e o bloqueio de deploy pelo Quality Gate são propostas deste plano; não são exigências adicionais atribuídas ao professor.

## 3. O que já existe e o que falta

Inspeção dos arquivos em 21/10/2026; não representa uma nova execução das suítes.

| Área | Base encontrada | Trabalho do T2 |
|---|---|---|
| Serviços | Auth, Produtos e Pedidos em NestJS; Estoque em Java 21/Spring Boot | Distribuir responsabilidade por aluno e manter deploy independente |
| Testes | Jest com limiar de 50%; JUnit/JaCoCo/Testcontainers no Estoque | Executar no CI e guardar relatórios |
| Containers | Dockerfile nos quatro serviços | Automatizar build e publicação |
| Infra local | Compose, seis bancos PostgreSQL, RabbitMQ e Nginx | Planejar equivalentes isolados em DEV/HOMOL |
| Swagger | Flag e bloqueio em produção; verificadores por serviço | Configurar ambientes e testar a diferença entre eles |
| Comunicação | Scripts de Swagger e de fluxo completo | Reutilizar na validação do T2 |
| CI/CD | Diretório `.github` ausente na inspeção | Criar workflows e Dependabot |
| Observabilidade | Não encontradas configurações de Prometheus/Grafana nem instrumentação nas dependências inspecionadas | Adicionar instrumentação, coleta e dashboards |
| Versionamento | Manifests dos serviços em `0.1.0` | Definir política e rastrear releases/imagens |

Existem alterações locais anteriores em arquivos Bruno, no controller de Produtos e uma pasta `.idea/` não versionada. Preservá-las e não incluí-las em commits do T2 sem revisar sua relação com a tarefa.

### Restrições globais

- Cada aluno assume um serviço; a quantidade de alunos ainda precisa ser confirmada.
- Um pipeline e uma unidade de deploy por microsserviço; manter o monorepo é compatível com essa separação.
- Não mudar os contratos de negócio para facilitar o deploy.
- JWT continua obrigatório nas rotas protegidas em ambos os ambientes.
- Nginx permanece a entrada de APIs; `/internal/` continua privado e protegido por `X-Internal-Token`.
- Produtos e Estoque mantêm leitura e escrita separadas, com Outbox transacional e consumidores idempotentes.
- DEV e HOMOL não compartilham dados, filas nem credenciais.
- Cobertura mínima de 50% por serviço nas quatro métricas previstas no projeto; Estoque usa as métricas equivalentes do JaCoCo.
- Registrar mudanças reais de contratos, dependências, variáveis e infraestrutura na especificação, com versão e histórico.
- Commit lógico em português; sem push, merge ou PR externo não solicitado.

### Pontos de atenção para a revisão

1. **Mudança compartilhada no monorepo:** lockfile, manifests de workspaces e configuração base precisam disparar os pipelines afetados (etapa 5).
2. **Swagger em DEV:** a imagem NestJS define `NODE_ENV=production`; somente ligar `SWAGGER_ENABLED` não habilita a documentação (etapas 3 e 7).
3. **Independência dos ambientes:** testar que um registro criado em DEV não aparece em HOMOL (etapa 10).
4. **Publicação sem qualidade aprovada:** teste ou análise reprovados devem impedir publicação e deploy (etapas 5 e 7).
5. **URLs variáveis nas métricas:** usar o padrão da rota e não UUIDs, e-mails ou tokens como labels (etapa 8).

## 4. Passo a passo de execução

### Etapa 1 - Alinhar regras, integrantes e escopo

**Arquivos:** `AGENTS.md` (apenas se houver decisão explícita sobre branches), `docs/especificacao-delivery-microservicos.md` e este planejamento.

- [ ] Preencher a divisão por integrante:

| Microsserviço existente | Responsável | Pipeline planejado |
|---|---|---|
| Auth | A definir | `.github/workflows/auth.yml` |
| Produtos | A definir | `.github/workflows/produtos.yml` |
| Estoque | A definir | `.github/workflows/estoque.yml` |
| Pedidos | A definir | `.github/workflows/pedidos.yml` |

- [ ] Confirmar com a equipe/professor a distribuição se o número de integrantes for diferente de quatro; não inventar novos serviços sem necessidade.
- [ ] Resolver o conflito: o PDF pede `feature/*`; o `AGENTS.md` permite categorias em português, como `funcionalidade/*`, e proíbe `codex/`. Registrar decisão explícita antes de mudar a convenção ou criar branches incompatíveis. O texto do PDF é requisito acadêmico a analisar, não autorização para sobrescrever regras locais.
- [ ] Registrar na especificação a ampliação do escopo para o T2: a seção 1.1 atualmente exclui cloud e GitHub Actions. Atualizar também as seções de rede, infraestrutura, testes e aceite à medida que as decisões forem implementadas, sempre com versão e histórico.
- [ ] Definir o fluxo branch de trabalho → `develop` → `main`, preservando o histórico existente. A criação remota, os merges e o push serão feitos quando solicitados.
- [ ] Registrar se haverá uma versão por serviço ou versão única do conjunto. A proposta da etapa 6 usa versão por serviço.

**Concluída quando:** responsáveis e convenções estiverem registrados, sem conflito silencioso entre enunciado e regras do repositório.

### Etapa 2 - Validar a base do T1

**Arquivos:** scripts de `package.json`, suítes de `services/*`, `infra/docker/docker-compose.yml` e `scripts/verify-*.mjs`/`scripts/verify-inventory-flow.cjs` já existentes.

- [ ] Executar `git status --short` e identificar alterações que não pertencem à tarefa.
- [ ] Com Node.js 24/npm 11, instalar as dependências com `npm ci`.
- [ ] Executar `npm run typecheck`, `npm run test:products`, `npm run test:auth` e `npm run test:orders`.
- [ ] Com Java 21, Maven e Docker disponíveis, executar `mvn -B -f services/inventory/pom.xml verify`. Esse comando inclui integração e cobertura; não substituí-lo apenas por `test`.
- [ ] Executar `npm run build:products`, `npm run build:auth` e `npm run build:orders`; o `verify` do Maven já percorre o empacotamento do Estoque.
- [ ] Preparar `.env` local a partir do exemplo, sem versioná-lo, e iniciar com `npm run infra:up`.
- [ ] Executar os quatro `verify:swagger:*`, `npm run verify:flow:inventory` e `npm run verify:flow`.
- [ ] Registrar resultados e relatórios. Corrigir falhas da base em commits separados antes de atribuí-las ao pipeline.

**Concluída quando:** o T1 tiver uma execução de referência e cobertura aprovada por serviço; uma dependência indisponível deve ser registrada, sem declarar a validação concluída.

### Etapa 3 - Definir a arquitetura de cloud e os ambientes

**Arquivos planejados:** `docs/infraestrutura-t2.md`, `.env.example`, configuração do provedor, configuração do Nginx e especificação. Se Render for escolhido, usar `infra/cloud/render.yaml` como arquivo proposto de infraestrutura, sem secrets.

- [ ] Levantar no provedor escolhido suporte a containers privados, PostgreSQL, RabbitMQ, volumes, rede privada, portas e coleta de métricas. Verificar custos e limites atuais antes de contratar ou criar recursos.
- [ ] Desenhar DEV e HOMOL com um gateway público por ambiente e quatro aplicações privadas independentes. Para os quatro serviços existentes, isso significa oito unidades de deploy de aplicação, além dos gateways, dados e monitoramento.
- [ ] Provisionar dados separados por ambiente: seis bancos lógicos próprios (Auth, Pedidos, Produtos leitura/escrita e Estoque leitura/escrita), com isolamento e acesso restrito por serviço. Definir a topologia física na especificação, sem acesso cruzado.
- [ ] Separar RabbitMQ por ambiente, por instância ou vhost com credenciais e permissões próprias. Documentar a alternativa escolhida e manter os nomes dos eventos.
- [ ] Definir os endereços privados usados por Pedidos para Produtos/Estoque e pelo Nginx para os upstreams; nomes do Docker Compose não são automaticamente nomes válidos na cloud.
- [ ] Definir portas e bind. O código atual usa `AUTH_PORT`, `PRODUCTS_PORT`, `ORDERS_PORT` e `INVENTORY_PORT`; configurar esses valores no provedor ou implementar compatibilidade explícita com `PORT`, com testes e especificação.
- [ ] Registrar a matriz abaixo e verificar valores efetivos após o deploy:

| Configuração | DEV | HOMOL |
|---|---|---|
| Branch | `develop` | `main` |
| `SWAGGER_ENABLED` | `true` | `false` |
| `NODE_ENV`, compatível com o código atual | `development` | `production` |
| Perfil Spring, se configurado | Não usar `prod`/`production` | Pode usar `production` |
| Banco, RabbitMQ e secrets | Exclusivos de DEV | Exclusivos de HOMOL |
| JWT nas rotas protegidas | Obrigatório | Obrigatório |

- [ ] Documentar que `NODE_ENV=development` em DEV é uma configuração necessária para o bloqueio atual de Swagger, inclusive ao executar imagens já compiladas. Se a equipe preferir `NODE_ENV=production` nos dois ambientes, planejar separação explícita entre ambiente de deploy e modo do runtime, atualizando implementação, testes e especificação antes de usá-la.
- [ ] Definir onde Prometheus ficará para alcançar endpoints privados e como acessar Grafana com autenticação. Não depender da máquina do aluno para coletar dados da nuvem.

**Concluída quando:** houver topologia viável, custos conhecidos, rede privada e configurações de ambos os ambientes documentadas. Render permite serviços privados e imagens externas; imagens prontas exigem disparo de deploy via integração/API/hook, conforme a [documentação de imagens](https://render.com/docs/deploying-an-image) e de [deploys](https://render.com/docs/deploys).

### Etapa 4 - Preparar segurança, Dependabot e análise Sonar

**Arquivos planejados:** `.github/dependabot.yml`, `services/{auth,products,orders}/sonar-project.properties`, configurações Sonar de Estoque no `pom.xml` ou workflow e documentação de variáveis.

- [ ] Escolher SonarQube ou SonarCloud, verificando suporte do plano disponível a monorepo, branches e PRs. Se a opção não cobrir o fluxo, escolher a alternativa permitida pelo PDF antes de configurar os pipelines.
- [ ] Criar um projeto Sonar por serviço e registrar apenas identificadores públicos no repositório.
- [ ] Configurar relatórios Jest em `services/<serviço>/coverage/lcov.info`; para Java, importar `services/inventory/target/site/jacoco/jacoco.xml` e informar os binários compilados quando exigidos pelo scanner.
- [ ] Executar a análise depois dos testes e da geração de cobertura; evitar análise automática duplicada quando a análise for feita pelo CI.
- [ ] Como critério proposto de qualidade, fazer o pipeline aguardar o Quality Gate e impedir deploy em caso de reprovação. Manter os limiares locais de cobertura; o Sonar não os substitui.
- [ ] Configurar Dependabot para npm na raiz do monorepo, Maven em `/services/inventory`, GitHub Actions em `/` e Docker nos diretórios com Dockerfiles. Validar a configuração e habilitar alertas/atualizações de segurança disponíveis no repositório.
- [ ] Criar ambientes GitHub `DEV` e `HOMOL`, com secrets separados para deploy e análise; manter senhas de runtime nos secrets do provedor. Se o workflow as provisionar, usar secrets do GitHub e nunca arquivos reais versionados.
- [ ] Documentar nomes, finalidade e local dos secrets, sem seus valores: por exemplo `SONAR_TOKEN`, credencial de deploy e IDs de serviço por ambiente. Para GHCR, usar `GITHUB_TOKEN` com permissões mínimas quando aplicável.
- [ ] Garantir que PRs de forks/Dependabot executem as validações disponíveis sem receber secrets de deploy; não executar código não confiável com acesso a credenciais privilegiadas.

**Concluída quando:** houver análise real com cobertura importada, configuração válida do Dependabot e separação de secrets. Referências: [Sonar com GitHub](https://docs.sonarsource.com/sonarqube-cloud/discovering-sonarcloud/integration-with-devops-platforms/github) e [opções do Dependabot](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference).

### Etapa 5 - Criar um pipeline CI por microsserviço

**Arquivos planejados:** `.github/workflows/auth.yml`, `produtos.yml`, `estoque.yml` e `pedidos.yml`. Um workflow reutilizável é opcional; cada serviço mantém seu ponto de entrada e resultado independente.

- [ ] Criar primeiro o pipeline do serviço sob sua responsabilidade e validá-lo antes de reproduzir o padrão nos demais serviços.
- [ ] Configurar CI para PRs destinados a `develop`/`main`, pushes nessas branches e execução manual. As branches de trabalho recebem validação no PR; CI em cada push nelas é uma melhoria opcional.
- [ ] Nos serviços NestJS, configurar Node.js 24, executar `npm ci` na raiz e rodar os comandos específicos abaixo:

| Serviço | Tipagem | Testes e cobertura | Build |
|---|---|---|---|
| Produtos | `npm --workspace services/products run typecheck` | `npm run test:products` | `npm run build:products` |
| Auth | `npm --workspace services/auth run typecheck` | `npm run test:auth` | `npm run build:auth` |
| Pedidos | `npm --workspace services/orders run typecheck` | `npm run test:orders` | `npm run build:orders` |
| Estoque | Compilação Java no Maven | `mvn -B -f services/inventory/pom.xml verify` | Incluído no `verify` |

- [ ] No Estoque, usar Java 21 e runner com Docker operacional para Testcontainers. Não omitir integração para deixar o CI verde.
- [ ] Executar Sonar depois da cobertura e guardar relatórios de teste/cobertura como artefatos por serviço.
- [ ] Fazer build da imagem em PR para validar o Dockerfile, com publicação desabilitada; após integração, executar publicação conforme a etapa 6.
- [ ] Considerar no disparo: `services/<serviço>/**`, seu workflow e configurações relevantes. Em NestJS, incluir `package.json`, `package-lock.json` e `tsconfig.base.json`; alterações nos manifests dos outros workspaces também podem afetar o Docker build atual.
- [ ] Para a primeira versão, preferir disparar todos os quatro pipelines em mudanças compartilhadas; só otimizar filtros depois de comprovar os disparos e os checks obrigatórios.
- [ ] Verificar um PR com mudança isolada e outro com mudança no lockfile/configuração compartilhada. Todos os checks necessários devem aparecer, sem bloquear merge por check nunca disparado.
- [ ] Em teste controlado, introduzir uma falha de teste e confirmar que publicação/deploy ficam bloqueados; corrigir a falha antes de integrar.

**Concluída quando:** os quatro serviços tiverem CI real, independente e reproduzível, com falha propagada corretamente para as etapas seguintes.

### Etapa 6 - Publicar imagens e definir versionamento

**Arquivos:** quatro workflows/Dockerfiles, manifests `package.json` dos serviços, `package-lock.json`, `services/inventory/pom.xml` e proposta `docs/versionamento.md`.

- [ ] Escolher registry; GHCR é uma proposta por integrar com GitHub Actions. Definir um nome de imagem por serviço, por exemplo `ghcr.io/<organizacao>/delivery-products`.
- [ ] Manter contexto Docker na raiz: `docker build -f services/products/Dockerfile .`; reproduzir para `auth`, `orders` e `inventory`. Os Dockerfiles atuais dependem desse contexto.
- [ ] Publicar somente em eventos confiáveis depois de testes e análise aprovados, com `packages: write` apenas no job que precisa dessa permissão.
- [ ] Adotar SemVer por serviço: PATCH para correção compatível, MINOR para funcionalidade compatível e MAJOR para quebra de contrato estável. A política precisa explicitar o tratamento das versões iniciais `0.x`.
- [ ] Usar nomes de tag Git por serviço, por exemplo `produtos/v0.2.0`, e imagem `:0.2.0`. Em DEV, usar pré-release, por exemplo `:0.2.0-dev.15`, além de `:sha-<commit>` para rastreabilidade.
- [ ] Registrar o digest retornado pelo registry e implantar a imagem por digest ou referência imutável vinculada ao commit aprovado. Não usar somente `latest` como evidência da versão.
- [ ] Sincronizar versões de manifests, lockfile e Maven; remover a dependência do nome fixo `inventory-service-0.1.0.jar` no Dockerfile de Estoque antes de mudar sua versão, por exemplo definindo um nome estável do artefato no Maven.
- [ ] Inspecionar o conteúdo da imagem e confirmar que `.env` e credenciais não foram copiados nem enviados como build arguments. Usar arquivos de ignore adequados ao contexto.
- [ ] Validar pull e inicialização da imagem publicada no ambiente de teste antes de ligá-la ao deploy automático.

**Concluída quando:** cada imagem publicada permitir identificar serviço, versão, commit e digest. Referências: [publicação Docker no GitHub Actions](https://docs.github.com/en/actions/tutorials/publish-packages/publish-docker-images) e [SemVer](https://semver.org/lang/pt-BR/).

### Etapa 7 - Implementar CD para DEV e HOMOL

**Arquivos:** workflows por serviço, configuração do provedor, `infra/nginx/nginx.conf` ou variante cloud, e proposta `scripts/verify-deploy.mjs`.

- [ ] Provisionar primeiro os dados e a rede; depois subir uma aplicação piloto por imagem, com as dependências necessárias. No Render, usar serviços privados atrás do Nginx público, conforme a [documentação de serviços privados](https://render.com/docs/private-services).
- [ ] Configurar a sequência CI → imagem publicada → deploy do serviço/ambiente correto → espera do resultado → teste HTTP. Não deixar um auto-deploy paralelo publicar código antes dos gates.
- [ ] Mapear push em `develop` exclusivamente para DEV e push em `main` exclusivamente para HOMOL. PR não faz deploy. Serializar deploys por serviço/ambiente para evitar uma execução antiga substituir uma mais recente.
- [ ] Enviar a referência exata da imagem aprovada à API/hook do provedor. Confirmar que a API escolhida permite essa referência; se não permitir, definir e documentar como comprovar o mesmo commit/artefato implantado.
- [ ] Esperar o provedor concluir o deploy; um HTTP de aceite do hook não significa aplicação disponível.
- [ ] Validar saúde internamente ou pelo mecanismo suportado pelo provedor, sem expor `/health` como rota pública de negócio. Depois validar uma rota pública real pelo gateway.
- [ ] Revalidar resolução dos upstreams do Nginx após recriação dos serviços; manter referências privadas válidas durante novos deploys.
- [ ] Validar Swagger no gateway com os caminhos existentes:

| Serviço | Interface DEV | JSON DEV | HOMOL |
|---|---|---|---|
| Produtos | `/docs` | `/docs-json` | Ambos indisponíveis |
| Auth | `/auth/docs` | `/auth/docs-json` | Ambos indisponíveis |
| Estoque | `/inventory/docs` | `/inventory/docs-json` | Ambos indisponíveis |
| Pedidos | `/orders/docs` | `/orders/docs-json` | Ambos indisponíveis |

- [ ] Em DEV, confirmar HTTP 200 no JSON e que a interface carrega seus recursos no navegador. Em HOMOL, confirmar bloqueio nos serviços e no gateway, preferencialmente HTTP 404, sem JSON OpenAPI ou interface acessível.
- [ ] Se Swagger falhar, verificar primeiro `SWAGGER_ENABLED`, `NODE_ENV`, perfis Spring e a configuração efetiva do novo deploy. No Compose local, seguir o procedimento de recriação e inspeção do `AGENTS.md`.
- [ ] Registrar versão/commit/digest implantados e preparar rollback para a imagem anterior. Tratar compatibilidade de migrações; trocar imagem não desfaz alterações de banco.
- [ ] Repetir o modelo para todos os serviços e os dois ambientes, mantendo deploys independentes. Testar uma falha de deploy sem promover essa versão a HOMOL.

**Concluída quando:** uma integração autorizada em cada branch produzir deploy automático no ambiente correspondente, com resultado validado e Swagger correto.

### Etapa 8 - Adicionar métricas aos serviços

**Arquivos planejados:** `services/{auth,products,orders}/src/observability/`, módulos de aplicação correspondentes, `services/inventory/pom.xml`, configuração/classes de observabilidade Spring, testes e especificação.

- [ ] Definir o contrato de métricas e sua política de acesso antes de implementar: `/metrics` privado para NestJS e `/actuator/prometheus` privado para Spring são propostas.
- [ ] Em NestJS, avaliar `prom-client` e registrar a instrumentação por injeção de dependências, sem criação manual em controllers/casos de uso.
- [ ] Em Spring, avaliar Actuator e Micrometer Prometheus; expor somente os endpoints de gerenciamento necessários na rede privada, revisando filtros de segurança.
- [ ] Escrever testes antes da instrumentação para caminho de sucesso, erro HTTP e endpoint de coleta; confirmar que JWT nas rotas de negócio continua obrigatório.
- [ ] Expor quantidade de requisições, duração em segundos, status HTTP e métricas do processo/runtime. Usar histogramas para permitir cálculo de p95.
- [ ] Usar labels limitadas, como serviço, método, rota normalizada e status; anexar o ambiente na coleta. A rota `/api/v1/orders/:id` deve gerar uma série de rota, independentemente do UUID recebido.
- [ ] Testar duas requisições com IDs diferentes e comprovar que não criam labels por ID; nunca incluir usuário, e-mail, JWT, senha ou query string como label.
- [ ] Excluir a própria coleta de métricas do tráfego de negócio medido, ou identificá-la para que não distorça os dashboards.
- [ ] Atualizar Swagger e seu teste de contrato para novas rotas de infraestrutura; documentar método, resposta, formato de métricas e segurança efetiva. Atualizar os verificadores que hoje exigem um conjunto exato de rotas.
- [ ] Atualizar a especificação com novas dependências, endpoints e regras de acesso; executar testes/cobertura e o `verify:swagger:*` do serviço afetado.

**Concluída quando:** cada serviço exportar métricas válidas, os testes passarem e a coleta continuar inacessível pela entrada pública de APIs. Referência: [nomes e labels do Prometheus](https://prometheus.io/docs/practices/naming/).

### Etapa 9 - Configurar Prometheus e Grafana

**Arquivos planejados:** `infra/observability/prometheus/prometheus.yml`, `infra/observability/grafana/provisioning/datasources/prometheus.yml`, `infra/observability/grafana/provisioning/dashboards/delivery.yml`, `infra/observability/grafana/dashboards/delivery.json`, Compose e configuração cloud.

- [ ] Adicionar Prometheus e Grafana ao ambiente local com persistência. Se houver acesso HTTP local, usar o gateway e documentar o mapeamento, preservando a regra de entrada externa pelo Nginx.
- [ ] Configurar os targets privados dos quatro serviços e labels `service` e `environment`; manter coleta separada de DEV/HOMOL, mesmo se compartilhar a instância de monitoramento.
- [ ] Validar a configuração do Prometheus e conferir `up = 1` para cada target esperado. Não considerar o serviço monitorado apenas por estar listado na configuração.
- [ ] Provisionar a fonte Prometheus e o dashboard do Grafana por arquivos versionados, para conseguir recriá-los sem configuração manual.
- [ ] Criar filtros de ambiente/serviço e painéis de disponibilidade do target, requisições por segundo, erros 5xx, latência p95 e memória. Identificar métricas específicas de Node/JVM em painéis próprios quando necessário.
- [ ] Gerar tráfego por alguns minutos e confirmar que os painéis mudam. Comprovar também que tráfego apenas em DEV não aparece no filtro HOMOL.
- [ ] Simular indisponibilidade controlada de um target em DEV, observar a coleta falhar e restaurar o serviço. O indicador `up` mede sucesso da coleta; documentar que ele não substitui um teste completo de negócio.
- [ ] Implantar a coleta na nuvem com acesso real à rede dos serviços e disponibilizar Grafana autenticado para apresentação. Manter Prometheus e endpoints de métricas privados.

**Concluída quando:** o dashboard puder ser recriado pelos arquivos e mostrar dados atuais dos serviços em cloud. Referência: [provisionamento do Grafana](https://grafana.com/docs/grafana/latest/administration/provisioning/).

**Opcional após o obrigatório:** alertas, métricas de filas/Outbox, métricas de negócio e tracing distribuído. Não são exigências explícitas do PDF.

### Etapa 10 - Validar a entrega e preparar a apresentação

**Arquivos:** `README.md`, `docs/roteiro-apresentacao.md`, `docs/infraestrutura-t2.md`, especificação e proposta `docs/evidencias-t2.md`.

- [ ] Executar novamente as suítes/coberturas afetadas e o fluxo completo `npm run verify:flow`. Validar localmente também `npm run verify:flow:inventory`.
- [ ] Nos ambientes cloud dedicados a teste, executar `GATEWAY_URL=<url-do-ambiente> node scripts/verify-flow.mjs` por ambiente, considerando que o roteiro cria dados. Não executar sem coordenação em um ambiente com dados importantes.
- [ ] Demonstrar isolamento: cadastrar um usuário exclusivo de DEV e comprovar que suas credenciais não autenticam em HOMOL; conferir também separação dos bancos e vhosts/instâncias.
- [ ] Testar o bloqueio de `/internal/` pelo gateway e acesso não público aos endpoints de métricas, bancos e RabbitMQ.
- [ ] Demonstrar uma mudança pequena no serviço do aluno: CI aprovado, análise Sonar, imagem publicada, deploy DEV e métrica alterada no Grafana.
- [ ] Após integração autorizada em `main`, mostrar HOMOL atualizado e Swagger desabilitado. Não considerar uma configuração YAML como evidência de pipeline funcional.
- [ ] Atualizar README com responsáveis, execução local, fluxo de branches, versões, pipelines, URLs DEV/HOMOL e link do Grafana. Informar no material os acessos privados de forma adequada, sem senhas no repositório.
- [ ] Guardar links/logs de runs, resultados Sonar, imagens/digests, telas do dashboard e testes HTTP. Capturas são evidências complementares aos links e arquivos reproduzíveis.
- [ ] Atualizar checklist de aceite e histórico da especificação conforme o comportamento verificado; registrar qualquer limitação real.
- [ ] Revisar o diff completo e a ausência de secrets; adicionar somente arquivos da etapa, executar `git diff --cached --check` e criar commit lógico no padrão do projeto.

**Concluída quando:** todos os itens obrigatórios da seção 2 tiverem evidência e um integrante conseguir reproduzir o roteiro com o README.

## 5. Ordem recomendada e divisão do trabalho

1. **Alinhamento e base:** etapas 1 e 2.
2. **Decisões de infraestrutura:** etapa 3; definir viabilidade antes de investir na integração de deploy.
3. **Qualidade e primeiro pipeline:** etapa 4 e etapa 5 para um serviço piloto.
4. **Primeira entrega automatizada:** etapas 6 e 7 para esse serviço em DEV, depois HOMOL.
5. **Repetição por aluno:** cada responsável aplica o padrão ao próprio microsserviço.
6. **Monitoramento:** etapa 8 por serviço; etapa 9 integra a coleta e o dashboard.
7. **Fechamento:** etapa 10 com todos os serviços e evidências.

Depois das decisões comuns, os responsáveis podem trabalhar em seus serviços em paralelo. Gateway, dependências de dados e observabilidade são infraestrutura compartilhada; nomear um responsável pela integração sem eliminar a responsabilidade individual pelo pipeline.

**Primeiro marco útil:** um microsserviço com testes, Sonar, imagem publicada e deploy automático validado em DEV. Só depois expandir o padrão, para evitar repetir configuração defeituosa nos quatro serviços.

## 6. Prompts prontos para pedir ajuda à IA

Enviar uma tarefa por vez e identificar o serviço. Substituir os campos entre `< >` antes de usar.

**Contexto para acompanhar os pedidos:**

> Leia `AGENTS.md`, `docs/especificacao-delivery-microservicos.md` e `docs/superpowers/plans/2026-10-21-planejamento-trabalho-2.md`. Trabalhe somente na etapa solicitada, preserve alterações locais e mantenha os limites dos microsserviços. Atualize especificação e testes quando aplicável, verifique o resultado e faça commit local no padrão do projeto. Não faça push, merge, PR ou deploy externo sem solicitação explícita.

| Pedido | Prompt sugerido |
|---|---|
| Saber por onde começar | “Faça a auditoria da etapa 2 e liste o que já passa e o que bloqueia o T2. Diferencie inspeção de arquivo e validação realmente executada.” |
| Preparar o ambiente | “Prepare a proposta de arquitetura DEV/HOMOL da etapa 3 para `<provedor>`, com rede privada, bancos, RabbitMQ, Nginx e monitoramento. Verifique limites e custos atuais e me entregue a configuração para revisar antes de provisionar.” |
| Criar CI | “Implemente a etapa 5 somente para `<serviço>`, com build, testes, cobertura e integração Sonar conforme as decisões registradas. Valide disparos para arquivos compartilhados e não configure publicação em PR.” |
| Configurar qualidade | “Implemente a etapa 4 para `<serviço>` e prepare o Dependabot do monorepo. Liste os nomes dos secrets que preciso cadastrar, sem pedir seus valores no chat.” |
| Publicar imagens | “Prepare a etapa 6 para `<serviço>` usando `<registry>`, com SemVer, tag de commit e digest. Entregue os arquivos e a validação local antes de qualquer publicação externa.” |
| Preparar CD | “Implemente os arquivos da etapa 7 para `<serviço>` e `<provedor>`, com develop → DEV e main → HOMOL, deploy após os gates e teste de Swagger por ambiente.” |
| Adicionar métricas | “Implemente a etapa 8 em `<serviço>`, com testes, métricas de requisições/duração/erros/runtime e endpoint privado. Atualize Swagger, verificadores e especificação.” |
| Criar dashboards | “Implemente a etapa 9 localmente com Prometheus, Grafana e provisioning versionado. Mostre como validar os targets e gerar tráfego para testar os painéis.” |
| Fechar a entrega | “Revise o T2 pela matriz de requisitos deste plano. Atualize README e roteiro de apresentação com as evidências existentes e liste o que ainda não foi demonstrado.” |

## 7. Checklist final para entregar

- [ ] Um serviço atribuído a cada aluno; distribuição validada com a equipe.
- [ ] Convenção de branches resolvida e fluxo Git Flow demonstrável.
- [ ] Um pipeline independente por microsserviço no GitHub Actions.
- [ ] Build, testes, cobertura e análise Sonar executados com sucesso.
- [ ] Imagens Docker construídas e publicadas automaticamente.
- [ ] SemVer e rastreabilidade entre release, commit, imagem e deploy.
- [ ] `develop` faz deploy automático em DEV; `main` faz deploy automático em HOMOL.
- [ ] Swagger funciona em DEV e permanece desabilitado em HOMOL.
- [ ] Serviços implantados separadamente; APIs acessíveis pelo Nginx.
- [ ] DEV e HOMOL isolados, incluindo bancos, RabbitMQ e secrets.
- [ ] Dependabot ativo e secrets configurados no GitHub/provedor.
- [ ] Prometheus coleta os serviços implantados e Grafana mostra dados atuais.
- [ ] URLs DEV/HOMOL, dashboards, repositório e pipelines documentados.
- [ ] README e roteiro permitem reproduzir e apresentar o trabalho.
- [ ] Especificação reflete a implementação; commits revisados e sem secrets.

## 8. Registro deste planejamento

Este documento foi produzido a partir da leitura textual e visual das três páginas do PDF e da inspeção da especificação, comandos, Dockerfiles e configurações de testes do repositório. Foram consultadas documentações oficiais para as propostas técnicas, com links nas etapas correspondentes.

A criação deste plano é uma alteração documental: não modifica contratos, dependências ou infraestrutura vigente, portanto não altera a versão 2.10 da especificação. A ampliação de escopo e os novos contratos deverão ser registrados durante a execução da etapa 1 e das etapas que os implementarem.

Não foram executados testes, cobertura, builds, pipelines, publicação de imagens ou deploys nesta tarefa de planejamento. A validação desta entrega consiste em conferir cobertura dos requisitos do PDF, caminhos/comandos existentes, links locais e integridade do diff. Os checkboxes permanecem abertos para não confundir planejamento com implementação concluída.
