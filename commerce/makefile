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

.PHONY: start-dev
start-dev: 
	npm run start:dev

.PHONY: test-watch
test-watch: 
	npm run test:watch

.PHONY: test-coverage
test-coverage: 
	npm run test:cov

.PHONY: test-performance
test-performance: 
	make monitor-process-window-background
	k6 run --scenario spike test/order.performance-spec.ts

.PHONY: test-analyze
test-analyze:
	make test-coverage
	make analyze-sonar

.PHONY: analyze-sonar
analyze-sonar:
	npm run analyze:sonar

.PHONY: monitor-process-window-background
monitor-process-window-background: 
# window script
	@powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process powershell -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File ./scripts/monitor-service.ps1' -WindowStyle Minimized"
	@powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process powershell -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File ./scripts/monitor-database.ps1' -WindowStyle Minimized"

.PHONY: infra-install
infra-install:
	make infra-start
	./development/mysql/replication.sh

.PHONY: infra-start
infra-start:
	docker compose up -d

.PHONY: infra-stop
infra-stop:
	docker compose down

.PHONY: infra-restart
infra-restart:
	docker compose restart
