# Frontend Web - Recicla Mais

Aplicação web desenvolvida com React.js e Vite.

## Instalação

```bash
npm install
```

## Execução

### Desenvolvimento
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

### Build de Produção
```bash
npm run build
```

### Preview do Build
```bash
npm run preview
```

## Estrutura

```
src/
├── components/      # Componentes reutilizáveis
├── contexts/       # Context API (AuthContext)
├── pages/          # Páginas da aplicação
├── config/         # Configurações (API, etc.)
└── App.jsx         # Componente principal
```

## Páginas

- `/login` - Página de login
- `/register` - Página de cadastro
- `/` - Página inicial (Home)
- `/map` - Mapa de denúncias
- `/create-complaint` - Criar nova denúncia
- `/my-complaints` - Minhas denúncias
- `/dashboard` - Painel de gestão (apenas gestores)

## Tecnologias

- React 18.2.0
- React Router 6.20.0
- Vite 5.0.8
- Axios 1.6.2
- React Leaflet 4.2.1
- React Toastify 9.1.3

