FROM node:24-alpine3.20 AS base

RUN corepack enable
RUN corepack prepare yarn@4.12.0 --activate

WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./

FROM base AS deps
RUN yarn install --immutable

FROM deps AS dev
COPY . .
RUN npx prisma generate

EXPOSE 3000

CMD ["yarn", "start:dev"]

FROM deps AS build
COPY . .
RUN npx prisma generate
RUN yarn build

FROM node:24-alpine3.20 AS prod

RUN corepack enable
RUN corepack prepare yarn@4.12.0 --activate

WORKDIR /app

ENV NODE_ENV=production

COPY package.json yarn.lock .yarnrc.yml ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts

EXPOSE 3000

CMD ["yarn", "start:prod"]
