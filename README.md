# GymTrack - Sistema de Gerenciamento de Treinos

GymTrack é um sistema completo para gerenciamento de treinos de academia, desenvolvido com Next.js, TypeScript e SQLite.

## 🚀 Funcionalidades

- **Gerenciamento de Exercícios**: Cadastro completo de exercícios por grupo muscular
- **Fichas de Treino**: Criação de fichas personalizadas com exercícios, séries e repetições
- **Acompanhamento de Progresso**: Registro de treinos em tempo real com cronômetro
- **Histórico e Evolução**: Gráficos detalhados de progresso e estatísticas
- **Interface Responsiva**: Design moderno e intuitivo para todos os dispositivos

## 🛠️ Tecnologias

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, SQLite, Better-SQLite3
- **Gráficos**: Recharts
- **Testes**: Jest, Testing Library
- **CI/CD**: GitHub Actions

## 📦 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/gymtrack.git
cd gymtrack
```

2. Instale as dependências:
```bash
npm install
```

3. Execute o projeto:
```bash
npm run dev
```

4. Acesse http://localhost:3000

## 🧪 Testes

```
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch

# Executar testes com coverage
npm run test:coverage
```

## 📊 Estrutura do Projeto

```
gymtrack/
├── app/                    # Páginas e API routes (App Router)
│   ├── api/               # Endpoints da API
│   ├── exercises/         # Páginas de exercícios
│   ├── workouts/          # Páginas de fichas de treino
│   ├── progress/          # Páginas de progresso
│   └── history/           # Páginas de histórico
├── components/            # Componentes React reutilizáveis
├── lib/                   # Utilitários e modelos
│   ├── models/           # Modelos de dados
│   └── database.ts       # Configuração do banco
├── __tests__/            # Testes unitários e de integração
└── scripts/              # Scripts de banco de dados
```

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run start` - Inicia servidor de produção
- `npm run test` - Executa testes


## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

Desenvolvido com ❤️ para ajudar na organização e acompanhamento de treinos.
