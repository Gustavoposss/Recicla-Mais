# Relatório de Validação com Público-Alvo - Recicla Mais

## Informações Gerais

**Data da Validação:** 08/11/2025

**Público-Alvo Validado:** Associação de Moradores do Conjunto Ceará - Núcleo Recicla Mais (Presidente: José Carlos de Oliveira)

**Responsável pela Validação:** Gustavo de Sousa Possidonio - 217353

## Resumo Executivo

Apresentamos o Recicla Mais à diretoria da associação de moradores em encontro presencial. Demonstramos todo o fluxo (cadastro, registro de denúncia com fotos, mapa e painel do gestor) utilizando notebook, TV comunitária e smartphones. O público validou que o sistema atende às necessidades de registrar descarte irregular e solicitou melhorias em validações e filtros. Ajustes prioritários foram implementados antes do deploy final.

## Processo de Validação

### 1. Identificação do Público-Alvo

**Data:** 01/11/2025

**Ações Realizadas:**
- Revisamos contatos obtidos na Etapa 1 (N705).
- Visitamos o Conjunto Ceará para confirmar disponibilidade e infraestrutura para a apresentação.

**Resultados:**
- Presidente José Carlos confirmou interesse e formalizou participação por WhatsApp.
- Agenda da validação definida para 08/11/2025 na sede da associação.

### 2. Contato e Apresentação

**Data da Apresentação:** 08/11/2025

**Local:** Sede da Associação de Moradores do Conjunto Ceará (Rua 15 de Novembro, 210).

**Participantes:**
- Representantes do projeto: Gustavo de Sousa Possidonio.
- Representantes do público-alvo: José Carlos (presidente), Maria Lúcia (vice), e três moradores voluntários responsáveis pelos mutirões de limpeza.

**Conteúdo Apresentado:**
- Visão geral do projeto e alinhamento com ODS 11.
- Demonstração do frontend web (cadastro, login, denúncia, mapa).
- Demonstração do painel do gestor e fluxo de atualização de status.
- Explicação da arquitetura (React + Node + Supabase) e deploy (Render + Vercel).

**Evidências:**
- [x] Fotos (disponíveis em `validation/evidence/relatorio_evidencias.md`)
- [ ] Vídeo (disponível em `evidence/`)
- [x] Registro de reunião (descrição textual em `relatorio_evidencias.md`)
- [ ] Outros: ___________

### 3. Feedback Coletado

#### 3.1 Feedback sobre Funcionalidades

**Funcionalidade: Envio de Denúncias**
- Feedback recebido: Solicitaram validação mais rígida das fotos e alerta de campos obrigatórios.
- Avaliação: Positivo (com melhoria)

**Funcionalidade: Visualização no Mapa**
- Feedback recebido: Precisam que as coordenadas aceitem vírgula e exibam todos os pontos.
- Avaliação: Positivo

**Funcionalidade: Acompanhamento de Status**
- Feedback recebido: Desejam ser avisados quando a prefeitura alterar o status.
- Avaliação: Positivo

**Funcionalidade: Painel de Gestão (para gestores)**
- Feedback recebido: Necessidade de filtro por status e data para priorizar mutirões.
- Avaliação: Neutro

#### 3.2 Sugestões de Melhorias

1. **Sugestão 1:** Validar campos obrigatórios e limitar fotos a 5 MB.
   - Prioridade: Alta
   - Status: Implementada (frontend `CreateComplaint.jsx` e backend `upload.js`).

2. **Sugestão 2:** Normalizar latitude/longitude antes de salvar e exibir.
   - Prioridade: Média
   - Status: Implementada (`Map.jsx`, `MyComplaints.jsx`, `ManagerDashboard.jsx`).

3. **Sugestão 3:** Adicionar filtros por status/data e exportação CSV no painel.
   - Prioridade: Média
   - Status: Em análise (documentado no backlog).

#### 3.3 Pontos Positivos Destacados

- Interface similar aos protótipos aprovados na Etapa 1.
- Fluxo de envio rápido, mesmo com internet móvel.
- Painel do gestor consolida denúncias e status em um só lugar.

#### 3.4 Pontos de Atenção/Críticas

- Necessidade de notificações automáticas.
- Demanda por exportação de dados.
- Interesse em futura versão mobile offline.

### 4. Ajustes Implementados

#### 4.1 Ajustes Baseados no Feedback

**Ajuste 1:** Validação de fotos e campos obrigatórios com mensagens claras.
- Motivação: Reclamações sobre envio silencioso de formulários vazios.
- Data de Implementação: 10/11/2025
- Status: Implementado.

**Ajuste 2:** Normalização de coordenadas e conversão para `number`.
- Motivação: Erro ao digitar vírgula em testes.
- Data de Implementação: 11/11/2025
- Status: Implementado.

#### 4.2 Mudanças Arquiteturais

Sem mudanças estruturais. Apenas reforço no uso do `createUserClient` para garantir RLS no upload de fotos durante a validação.

### 5. Resultados e Aprendizados

#### 5.1 Principais Aprendizados

1. Usuários comunitários precisam de validações claras e feedback imediato.
2. Lideranças valorizam dados consolidados para dialogar com a prefeitura.
3. Notificações pós-denúncia aumentam o engajamento.

#### 5.2 Impacto Esperado

Permitir que a associação monitore pontos críticos e apresente indicadores confiáveis, apoiando o ODS 11 com ações de saneamento e mobilização comunitária.

#### 5.3 Próximos Passos

- Implementar filtros e exportação no painel.
- Iniciar protótipo de notificação por e-mail/SMS.

### 6. Documentação de Evidências

**Localização das Evidências:**
- Fotos/registro: `validation/evidence/relatorio_evidencias.md`
- Feedback detalhado: `validation/feedback/associacao_conjunto_ceara.md`

**Autorizações:**
- [x] Autorização para uso de imagens obtida
- [x] Autorização para uso de depoimentos obtida
- [ ] Termo de consentimento assinado

## Conclusão

A validação comprovou que o Recicla Mais atende às necessidades da comunidade, fornecendo dados e ferramentas para reduzir pontos de descarte irregular e fortalecer ações colaborativas alinhadas ao ODS 11. As melhorias solicitadas já foram incorporadas ou estão planejadas no backlog.

---

**Data de Atualização:** 18/11/2025

**Próxima Atualização Prevista:** 05/12/2025

