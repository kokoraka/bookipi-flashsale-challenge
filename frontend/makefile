default: help

.PHONY: help
help:
	@echo 'frontend'
	@echo 'usage: make [target] ...'

.PHONY: install
install:
	npm install

.PHONY: start
start:
	npm start

.PHONY: test-coverage
test-coverage:
	npm run test:cov

.PHONY: test-analyze
test-analyze:
	make test-coverage
	make analyze-sonar

.PHONY: analyze-sonar
analyze-sonar:
	npm run analyze:sonar

.PHONY: infra-install
infra-install:
	npm run build
	docker compose -f ./development/docker-compose.yml up -d --build --scale frontend-app=3

.PHONY: infra-start
infra-start:
	docker compose -f ./development/docker-compose.yml up -d --scale frontend-app=3

.PHONY: infra-stop
infra-stop:
	docker compose -f ./development/docker-compose.yml down

.PHONY: infra-restart
infra-restart:
	docker compose -f ./development/docker-compose.yml restart
