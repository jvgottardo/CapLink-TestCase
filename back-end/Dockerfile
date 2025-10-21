# Etapa 1: build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

# Instala todas dependências (incluindo dev, pra gerar o Prisma)
RUN npm install

# Copia o restante do projeto
COPY . .

# Gera o cliente Prisma dentro do container
RUN npx prisma generate

# Etapa 2: execução (imagem final)
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app ./

ENV NODE_ENV=production
ENV PORT=3000

# Instala apenas dependências de produção
RUN npm ci --omit=dev

EXPOSE 3000

CMD ["npm", "run", "start"]
