# Recicla Mais

## Descrição do Projeto
O Recicla Mais é uma plataforma multiplataforma (web e mobile) que conecta cidadãos aos órgãos de gestão ambiental para reportar e monitorar denúncias de lixo em áreas urbanas de Fortaleza.

## Problema Abordado e Justificativa
O descarte irregular de lixo em áreas urbanas de Fortaleza gera graves problemas ambientais, de saúde pública e de qualidade de vida, especialmente em bairros mais vulneráveis. Atualmente, não há um canal de comunicação direto e eficiente que conecte a comunidade aos órgãos de gestão ambiental para a resolução ágil desses problemas.

A plataforma contribui diretamente para o ODS 11: Cidades e Comunidades Sustentáveis, ao auxiliar na criação de cidades mais limpas, seguras e resilientes.

## Objetivos do Sistema

### Principal
Criar uma plataforma multiplataforma (web e mobile) que permita que cidadãos reportem e acompanhem denúncias de lixo de forma simples e intuitiva.

### Secundários
- Fornecer aos órgãos públicos um painel de gestão para visualizar, priorizar e responder às denúncias
- Aumentar a conscientização da comunidade sobre o descarte correto do lixo e a importância da reciclagem
- Melhorar a eficiência da coleta de lixo e a gestão ambiental da cidade

## Escopo do Projeto

### Funcionalidades Principais (In-Scope)
**Usuário Cidadão (Mobile/Web):**
- Cadastro e login de usuário
- Envio de denúncia com foto e geolocalização
- Visualização de denúncias próprias e de outros no mapa
- Acompanhamento do status de suas denúncias (Enviada, Em Análise, Resolvida)

**Usuário Gestor Público (Web):**
- Login seguro para gestores da prefeitura
- Painel de controle com mapa interativo das denúncias
- Filtros e busca por status, data e localização
- Atualização do status das denúncias

### Funcionalidades Fora do Escopo (Out-of-Scope) para a Etapa 2
- Sistema de gamificação ou recompensas para usuários
- Chat integrado para comunicação entre cidadãos e gestores
- Sistema de rota otimizada para a coleta de lixo

## Visão Geral da Arquitetura

O sistema adota uma Arquitetura em Camadas com separação clara de responsabilidades:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Supabase      │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │   Web       │ │◄──►│ │   API       │ │◄──►│ │  Database   │ │
│ │ (React.js)  │ │    │ │  REST       │ │    │ │ (PostgreSQL)│ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │  Mobile     │ │    │ │  Express.js │ │    │ │  Auth       │ │
│ │(React Native)│ │    │ └─────────────┘ │    │ │  Storage    │ │
│ └─────────────┘ │    └─────────────────┘    │ └─────────────┘ │
└─────────────────┘                           └─────────────────┘
```

## Tecnologias Propostas

- **Frontend Web:** React.js
- **Frontend Mobile:** React Native
- **Backend:** Node.js com Express.js
- **Banco de Dados:** Supabase (PostgreSQL)
- **Autenticação:** Supabase Auth
- **Armazenamento:** Supabase Storage
- **Mapeamento:** API de Mapas (Google Maps API ou Mapbox)

## Cronograma para Etapa 2 (N708)

### Fase 1 (Semanas 1-2): Desenvolvimento do Backend e Modelagem de Dados
- Configuração do ambiente de desenvolvimento
- Configuração do Supabase e criação das tabelas
- Criação das APIs REST para usuários e denúncias
- Criação da documentação das APIs

### Fase 2 (Semanas 3-4): Desenvolvimento do Frontend
- Construção da interface web (React.js)
- Construção da interface mobile (React Native)
- Integração das APIs com as telas do sistema

### Fase 3 (Semanas 5-6): Testes e Refinamento
- Testes funcionais e de usabilidade
- Correção de bugs
- Refinamento das interfaces e da documentação

### Fase 4 (Semana 7): Entrega Final
- Revisão final do projeto
- Preparação da apresentação

## Integrantes da Equipe e Seus Papéis

Gustavo de Sousa Possidonio - 217353

## Como Contribuir

1. Clone o repositório
2. Instale as dependências
3. Configure o ambiente de desenvolvimento
4. Siga as convenções de código estabelecidas
