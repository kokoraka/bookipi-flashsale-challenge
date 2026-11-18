-include .env
export

default: help

.PHONY: help
help:
	@echo 'commerce'
	@echo 'usage: make [target] ...'

.PHONY: install
install:
	npm i -g @nestjs/cli
# window script
# 	choco install k6
	go install go.k6.io/xk6/cmd/xk6@latest
	xk6 build --with github.com/grafana/xk6-faker
	npm install

.PHONY: start
start: 
	npm run start

.PHONY: test-performance
test-performance: 
	k6 run --scenario spike test/product.performance-spec.ts
	k6 run --scenario spike test/order.performance-spec.ts

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
	docker compose -f ./development/docker-compose.yml up -d mysql-db-1 mysql-db-2 mysql-db-3 phpmyadmin proxy cache messaging
	./development/mysql/replication.sh

.PHONY: infra-start
infra-start:
	npm run build
	docker compose -f ./development/docker-compose.yml up -d --build --scale commerce-api=3 commerce-api gateway

.PHONY: infra-stop
infra-stop:
	docker compose -f ./development/docker-compose.yml down

.PHONY: infra-restart
infra-restart:
	docker compose -f ./development/docker-compose.yml restart

.PHONY: monitor-process-window-background
monitor-process-window-background: 
# window script
	@powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process powershell -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File ./scripts/monitor-service.ps1' -WindowStyle Minimized"

.PHONY: monitor-connection-window
monitor-connection-window: 
# window script
	@powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process powershell -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File ./scripts/monitor-connection.ps1'"
