default: help

.PHONY: help
help:
	@echo 'frontend'
	@echo 'usage: make [target] ...'

.PHONY: test-coverage
test-coverage:
	npm run test:cov

.PHONY: install
install:
	npm install

.PHONY: generate
generate:
	npm run generate:orvalapi

.PHONY: build
build:
	npm run deploy -- --mode $(MODE)

.PHONY: render
render:
	npm run render

# do nothing target
%:
	@: