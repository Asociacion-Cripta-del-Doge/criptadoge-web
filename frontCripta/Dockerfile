# ==============================================================================
# Frontend Dockerfile - DESARROLLO con Vite
# ==============================================================================

# Versión de Node configurable desde docker-compose
FROM node:latest

WORKDIR /app

# Copiar dependencias
COPY package*.json ./
RUN npm install

# Copiar código (se sobrescribirá con volumen)
COPY . .

ENV VITE_PORT=5173

EXPOSE ${VITE_PORT}
