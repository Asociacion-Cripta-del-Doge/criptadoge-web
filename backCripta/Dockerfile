# Dockerfile
FROM node:24-alpine3.20

# Activar Corepack para usar Yarn 4
RUN corepack enable
RUN corepack prepare yarn@4.12.0 --activate

WORKDIR /app

# Copiamos package.json y yarn.lock primero para cachear dependencias
COPY package.json yarn.lock ./

# Instalamos dependencias con Yarn 4
RUN yarn install --immutable

# Copiamos el resto del proyecto
COPY . .

# Exponemos el puerto
EXPOSE 3000

# Comando por defecto
CMD ["yarn", "start:dev"]
