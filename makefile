
default: help

.PHONY: help
help:
	@echo 'flashsale'
	@echo 'usage: make [target] ...'

.PHONY: install
install:
	docker network create app-network
	$(MAKE) -C commerce install
	$(MAKE) -C commerce infra-install
	$(MAKE) -C frontend install
	$(MAKE) -C frontend infra-install

.PHONY: start
start:
	$(MAKE) -C commerce start
	$(MAKE) -C frontend start

.PHONY: test
test:
	$(MAKE) -C commerce test-coverage
	$(MAKE) -C frontend test-coverage

.PHONY: test-performance
test-performance:
	$(MAKE) -C commerce test-performance

.PHONY: infra-start
infra-start:
	$(MAKE) -C commerce infra-start
	$(MAKE) -C frontend infra-start

# do nothing target
%:
	@: