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

.PHONY: start-dev
start-dev: 
	npm run start:dev

.PHONY: generate
generate: 
	make generate-proto

.PHONY: generate-proto
generate-proto: 
	npm run generate:proto

.PHONY: test-watch
test-watch: 
	npm run test:watch

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
