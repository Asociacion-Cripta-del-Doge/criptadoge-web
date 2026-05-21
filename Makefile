SHELL := /bin/bash

DOCKER_COMPOSE ?= docker compose
FRONT_DIR ?= frontCripta
BACK_DIR ?= backCripta

.DEFAULT_GOAL := help

.PHONY: help env-init up up-build up-prod up-prod-build down down-prod restart ps ps-prod logs logs-prod logs-front logs-back logs-db logs-mongo logs-nginx clean clean-prod prune \
	shell-front shell-back shell-db shell-mongo \
	front-install front-dev front-build front-lint \
	back-install back-dev back-build back-lint back-test back-test-e2e back-format

help: ## Muestra esta ayuda
	@echo "Comandos disponibles:"
	@grep -E '^[a-zA-Z0-9_-]+:.*?## ' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-18s %s\n", $$1, $$2}'

env-init: ## Crea .env desde .env.example si no existe
	@test -f .env || cp .env.example .env

up: ## Levanta todos los servicios (modo detach)
	@$(DOCKER_COMPOSE) up -d

up-build: ## Reconstruye imágenes y levanta servicios
	@$(DOCKER_COMPOSE) up -d --build

up-prod: ## Levanta todos los servicios en produccion (modo detach)
	@$(DOCKER_COMPOSE) -f docker-compose.prod.yml up -d

up-prod-build: ## Reconstruye imagenes y levanta servicios en produccion
	@$(DOCKER_COMPOSE) -f docker-compose.prod.yml up -d --build

down: ## Baja todos los servicios
	@$(DOCKER_COMPOSE) down

down-prod: ## Baja todos los servicios de produccion
	@$(DOCKER_COMPOSE) -f docker-compose.prod.yml down

restart: ## Reinicia todos los servicios
	@$(DOCKER_COMPOSE) restart

ps: ## Muestra estado de contenedores
	@$(DOCKER_COMPOSE) ps

ps-prod: ## Muestra estado de contenedores de produccion
	@$(DOCKER_COMPOSE) -f docker-compose.prod.yml ps

logs: ## Sigue logs de todos los servicios
	@$(DOCKER_COMPOSE) logs -f --tail=200

logs-prod: ## Sigue logs de todos los servicios de produccion
	@$(DOCKER_COMPOSE) -f docker-compose.prod.yml logs -f --tail=200

logs-front: ## Sigue logs del frontend
	@$(DOCKER_COMPOSE) logs -f --tail=200 front

logs-back: ## Sigue logs del backend
	@$(DOCKER_COMPOSE) logs -f --tail=200 back

logs-db: ## Sigue logs de PostgreSQL
	@$(DOCKER_COMPOSE) logs -f --tail=200 db

logs-mongo: ## Sigue logs de MongoDB
	@$(DOCKER_COMPOSE) logs -f --tail=200 mongo

logs-nginx: ## Sigue logs de Nginx
	@$(DOCKER_COMPOSE) logs -f --tail=200 nginx

clean: ## Baja servicios y elimina volúmenes huérfanos
	@$(DOCKER_COMPOSE) down -v --remove-orphans

clean-prod: ## Baja servicios de produccion y elimina volumenes
	@$(DOCKER_COMPOSE) -f docker-compose.prod.yml down -v --remove-orphans

prune: ## Limpia recursos Docker no usados (sistema)
	@docker system prune -f

shell-front: ## Abre shell en el contenedor frontend
	@$(DOCKER_COMPOSE) exec front sh

shell-back: ## Abre shell en el contenedor backend
	@$(DOCKER_COMPOSE) exec back sh

shell-db: ## Abre psql dentro del contenedor de PostgreSQL
	@$(DOCKER_COMPOSE) exec db psql -U $${POSTGRES_USER:-postgres} -d $${POSTGRES_DB:-backCripta}

shell-mongo: ## Abre mongosh dentro del contenedor de MongoDB
	@$(DOCKER_COMPOSE) exec mongo mongosh

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
