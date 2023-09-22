.PHONY: build
build: ## Build the development docker image.
	docker compose build

.PHONY: start
start: ## Start the development docker container.
	docker compose up -d

.PHONY: stop
stop: ## Stop the development docker container.
	docker compose down

.PHONY: build-development
build-development: ## Build the development docker image.
	docker compose build development

.PHONY: start-development
start-development: ## Start the development docker container.
	docker compose up development -d

.PHONY: stop-development
stop-development: ## Stop the development docker container.
	docker compose down development
  
.PHONY: build-uat
build-production: ## Build the production docker image.
	docker compose build uat

.PHONY: start-uat
start-production: ## Start the production docker container.
	docker compose up uat -d

.PHONY: stop-uat
stop-production: ## Stop the production docker container.
	docker compose down uat

.PHONY: build-production
build-production: ## Build the production docker image.
	docker compose build production

.PHONY: start-production
start-production: ## Start the production docker container.
	docker compose up production   -d

.PHONY: stop-production
stop-production: ## Stop the production docker container.
	docker compose down production