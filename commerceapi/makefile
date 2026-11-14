default: help

.PHONY: help
help:
	@echo 'commerce_api'
	@echo 'usage: make [target] ...'

.PHONY: install
install:
	npm install -g swagger-cli
	npm install @openapitools/openapi-generator-cli -g

.PHONY: verify-swagger
verify-swagger:
	swagger-cli bundle main.yml --type json > main.all.json
	swagger-cli validate main.all.json 

.PHONY: generate-swagger
generate-swagger:
	swagger-cli bundle main.yml --type yaml > main.all.yml

.PHONY: generate-openapi-commerce
generate-openapi-commerce:
	make generate-swagger
	cd ../ && openapi-generator-cli generate \
		-i ./commerceapi/main.all.yml \
		-g typescript \
		-o ./commerce/src/restgen \
		--global-property=models,supportingFiles \
		--additional-properties=platform=node,modelPropertyNaming=snake_case,supportsES6=true,importFileExtension=.js,typescriptMajorVersion=5

.PHONY: generate-openapi
generate-openapi:
	make generate-openapi-commerce

.PHONY: build-openapi
build-openapi:
	make generate-swagger
	openapi-generator-cli generate -i main.all.yml -g html2 -o docs/oapi
