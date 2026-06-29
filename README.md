# 🍽️ Daily Diet API

API REST desenvolvida durante o desafio **Daily Diet** da Rocketseat.

O objetivo da aplicação é permitir que usuários registrem suas refeições, acompanhem se estão dentro da dieta e visualizem métricas relacionadas à alimentação.

## 🚀 Tecnologias

* Node.js
* TypeScript
* Fastify
* Knex.js
* SQLite
* Zod

## 📁 Funcionalidades

* Criar usuário
* Identificar o usuário através de cookies (`sessionId`)
* Criar refeições
* Editar refeições
* Excluir refeições
* Listar todas as refeições do usuário
* Buscar uma refeição específica
* Recuperar métricas do usuário:

  * Quantidade total de refeições
  * Quantidade de refeições dentro da dieta
  * Quantidade de refeições fora da dieta
  * Melhor sequência de refeições dentro da dieta

## 📦 Instalação

Clone o projeto:

```bash
git clone https://github.com/SEU-USUARIO/daily-diet-api.git
```

Acesse a pasta:

```bash
cd daily-diet-api
```

Instale as dependências:

```bash
npm install
```

## ⚙️ Configuração

Crie um arquivo `.env` na raiz do projeto.

Exemplo:

```env
NODE_ENV='development'
DATABASE_URL="./db/app.db"
```

## 🗄️ Executando as migrations

```bash
npm run knex migrate:latest
```

## ▶️ Executando a aplicação

Modo desenvolvimento:

```bash
npm run dev
```

A aplicação ficará disponível em:

```
http://localhost:3333
```

## 📌 Endpoints

### Usuários

| Método | Rota     | Descrição       |
| ------ | -------- | --------------- |
| POST   | `/users` | Cria um usuário |

### Refeições

| Método | Rota             | Descrição                      |
| ------ | ---------------- | ------------------------------ |
| POST   | `/meals`         | Cria uma refeição              |
| GET    | `/meals`         | Lista todas as refeições       |
| GET    | `/meals/:id`     | Busca uma refeição             |
| PUT    | `/meals/:id`     | Atualiza uma refeição          |
| DELETE | `/meals/:id`     | Remove uma refeição            |
| GET    | `/meals/summary` | Retorna as métricas do usuário |

## 🔒 Autenticação

A identificação do usuário é feita por meio de um cookie (`sessionId`) gerado na criação do usuário.

As rotas protegidas utilizam um middleware para validar a existência desse cookie.

## 👨‍💻 Autor

Desenvolvido por Renato durante os estudos da trilha de Node.js da Rocketseat.
