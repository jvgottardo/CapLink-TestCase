# Etapa 1: build
FROM node:20-alpine AS builder

WORKDIR /app

# Copia apenas os arquivos necessários pro npm install
COPY package*.json ./

# Instala apenas dependências de produção
RUN npm ci --omit=dev

# Copia o restante do projeto
COPY . .

# Etapa 2: execução (imagem final)
FROM node:20-alpine

WORKDIR /app

# Copia apenas o resultado final da etapa anterior
COPY --from=builder /app ./

# Define variável de ambiente
ENV NODE_ENV=production
ENV PORT=3000

# Expõe a porta
EXPOSE 3000

# Comando de inicialização
CMD ["npm", "run", "start"]
