.PHONY: build
build: install compile

.PHONY: install
install:
	nvm use
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
