.PHONY: install
install:
	. ~/.nvm/nvm.sh || true && nvm install && nvm use && yarn install

.PHONY: build
build: install compile

.PHONY: compile
compile:
	npm run compile

.PHONY: lint
lint:
	npm run lint

.PHONY: test
test:
	npm run test
