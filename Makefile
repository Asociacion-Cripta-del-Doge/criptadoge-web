SHELL := /bin/bash

DOCKER_COMPOSE ?= docker compose
FRONT_DIR ?= frontCripta
BACK_DIR ?= backCripta
DEV_ENV ?= .env.development
PROD_ENV ?= .env.production

DEV_COMPOSE := $(DOCKER_COMPOSE) --env-file $(DEV_ENV)
PROD_COMPOSE := $(DOCKER_COMPOSE) --env-file $(PROD_ENV) -f docker-compose.prod.yml

.DEFAULT_GOAL := help

.PHONY: help env-init env-init-dev env-init-prod up up-build up-prod up-prod-build down down-prod restart ps ps-prod logs logs-prod logs-front logs-back logs-db logs-mongo logs-nginx clean clean-prod prune \
	shell-front shell-back shell-db shell-mongo \
	front-install front-dev front-build front-lint \
	back-install back-dev back-build back-lint back-test back-test-e2e back-format

help: ## Muestra esta ayuda
	@echo "Comandos disponibles:"
	@grep -E '^[a-zA-Z0-9_-]+:.*?## ' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-18s %s\n", $$1, $$2}'

env-init: ## Crea .env desde .env.example si no existe
	@test -f .env || cp .env.example .env

env-init-dev: ## Crea .env.development desde el ejemplo si no existe
	@test -f $(DEV_ENV) || cp .env.development.example $(DEV_ENV)

env-init-prod: ## Crea .env.production desde el ejemplo si no existe
	@test -f $(PROD_ENV) || cp .env.production.example $(PROD_ENV)

up: ## Levanta todos los servicios de desarrollo (modo detach)
	@$(DEV_COMPOSE) up -d

up-build: ## Reconstruye imagenes y levanta servicios de desarrollo
	@$(DEV_COMPOSE) up -d --build

up-prod: ## Levanta todos los servicios en produccion (modo detach)
	@$(PROD_COMPOSE) up -d

up-prod-build: ## Reconstruye imagenes y levanta servicios en produccion
	@$(PROD_COMPOSE) up -d --build

down: ## Baja todos los servicios de desarrollo
	@$(DEV_COMPOSE) down

down-prod: ## Baja todos los servicios de produccion
	@$(PROD_COMPOSE) down

restart: ## Reinicia todos los servicios de desarrollo
	@$(DEV_COMPOSE) restart

ps: ## Muestra estado de contenedores de desarrollo
	@$(DEV_COMPOSE) ps

ps-prod: ## Muestra estado de contenedores de produccion
	@$(PROD_COMPOSE) ps

logs: ## Sigue logs de todos los servicios de desarrollo
	@$(DEV_COMPOSE) logs -f --tail=200

logs-prod: ## Sigue logs de todos los servicios de produccion
	@$(PROD_COMPOSE) logs -f --tail=200

logs-front: ## Sigue logs del frontend de desarrollo
	@$(DEV_COMPOSE) logs -f --tail=200 front

logs-back: ## Sigue logs del backend de desarrollo
	@$(DEV_COMPOSE) logs -f --tail=200 back

logs-db: ## Sigue logs de PostgreSQL de desarrollo
	@$(DEV_COMPOSE) logs -f --tail=200 db

logs-mongo: ## Sigue logs de MongoDB de desarrollo
	@$(DEV_COMPOSE) logs -f --tail=200 mongo

logs-nginx: ## Sigue logs de Nginx de desarrollo
	@$(DEV_COMPOSE) logs -f --tail=200 nginx

clean: ## Baja servicios de desarrollo y elimina volumenes huerfanos
	@$(DEV_COMPOSE) down -v --remove-orphans

clean-prod: ## Baja servicios de produccion y elimina volumenes
	@$(PROD_COMPOSE) down -v --remove-orphans

prune: ## Limpia recursos Docker no usados (sistema)
	@docker system prune -f

shell-front: ## Abre shell en el contenedor frontend de desarrollo
	@$(DEV_COMPOSE) exec front sh

shell-back: ## Abre shell en el contenedor backend de desarrollo
	@$(DEV_COMPOSE) exec back sh

shell-db: ## Abre psql dentro del contenedor de PostgreSQL de desarrollo
	@$(DEV_COMPOSE) exec db psql -U $${POSTGRES_USER:-postgres} -d $${POSTGRES_DB:-backCripta}

shell-mongo: ## Abre mongosh dentro del contenedor de MongoDB de desarrollo
	@$(DEV_COMPOSE) exec mongo mongosh

front-install: ## Instala dependencias del frontend (local)
	@cd $(FRONT_DIR) && npm install

front-dev: ## Ejecuta frontend en modo desarrollo (local)
	@cd $(FRONT_DIR) && npm run dev

front-build: ## Compila frontend (local)
	@cd $(FRONT_DIR) && npm run build

front-lint: ## Lint del frontend (local)
	@cd $(FRONT_DIR) && npm run lint

back-install: ## Instala dependencias del backend (local, Yarn 4)
	@cd $(BACK_DIR) && corepack enable && corepack yarn install

back-dev: ## Ejecuta backend en modo desarrollo (local)
	@cd $(BACK_DIR) && corepack yarn start:dev

back-build: ## Compila backend (local)
	@cd $(BACK_DIR) && corepack yarn build

back-lint: ## Lint del backend (local)
	@cd $(BACK_DIR) && corepack yarn lint

back-test: ## Tests unitarios backend (local)
	@cd $(BACK_DIR) && corepack yarn test

back-test-e2e: ## Tests e2e backend (local)
	@cd $(BACK_DIR) && corepack yarn test:e2e

back-format: ## Formatea backend (local)
	@cd $(BACK_DIR) && corepack yarn format
