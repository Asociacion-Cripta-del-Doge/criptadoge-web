# ==============================================================================
# Frontend Dockerfile - DESARROLLO con Vite
# ==============================================================================

# Versión de Node configurable desde docker-compose
FROM node:24-alpine

WORKDIR /app

# Copiar dependencias
COPY package*.json ./
RUN npm install

# Copiar código (se sobrescribirá con volumen)
COPY . .

ENV VITE_PORT=5173

EXPOSE ${VITE_PORT}

# Comando de desarrollo
CMD ["npm", "run", "dev"]