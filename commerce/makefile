default: help

.PHONY: help
help:
	@echo 'commerce'
	@echo 'usage: make [target] ...'

.PHONY: install
install:
	npm i -g @nestjs/cli

.PHONY: test-coverage
test-coverage: 
	npm run test:cov

.PHONY: start-dev
start-dev: 
	npm run start:dev

.PHONY: generate
generate: 
	make generate-proto

.PHONY: generate-proto
generate-proto: 
	npm run generate:proto
