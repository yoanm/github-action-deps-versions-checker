.PHONY: build
build: install compile

.PHONY: install
install:
	yarn install

.PHONY: compile
compile:
	npm run compile

.PHONY: lint
lint:
	npm run lint

.PHONY: test
test:
	npm run test
