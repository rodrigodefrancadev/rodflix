# Resumo
Este projeto é uma aplicação web que permite aos usuários assistir a filmes e séries com laout estilo netflix. Ele é composto por um frontend e um backend. O frontend é responsável por exibir os filmes e séries e o backend é responsável por armazenar os dados dos filmes e séries. A aplicação é apenas para usuários selecionados, ou seja, qualquer pessoa pode se cadastrar na plataforma, mas só pode ver o catálogo depois da aprovação de um moderador. A forma gerenciar o catálogo é muito simples: todo o catálogo vai estar em uma pasta no google drive. O administrador, ao fazer alguma alteração na pasta vai no painel de admin clica em atualizar catálogo, dessa forma o sistema lê a pasta com as seguintes regras:
- Cada subpasta é um título (filme ou série).
- O nome do título é o nome da subpasta.
- Se na subpasta tiver apenas um arquivo de vídeo, ele será considerado um filme.
- Se na subpasta tiver uma ou mais subpastas, cada subpasta será considerada uma temporada e o título será considerado uma série.
Ao final é gerado um json que é carregado no sistema. 


# Tecnologias
- Frontend: React, vite, typescript, tailwindcss
- Backend: Node.js, express, typescript (clean architecture em camadas)
- Banco de dados: Postgress (prisma)
- Autenticação: JWT
- Armazenamento: Google Drive

# Observações
- O projeto deve ser responsivo
- Faça testes para no backend
- o projeto é um monorepo npm