# Look for nvm base directory
ifneq (,$(wildcard ~/.nvm/nvm.sh))
NVM_PATH=~/.nvm/nvm.sh
else ifneq (,$(wildcard /usr/local/lib/nvm/nvm.sh))
NVM_PATH=/usr/local/lib/nvm/nvm.sh
endif

.PHONY: build
build: install compile

.PHONY: install
install:
	. $(NVM_PATH) || true && nvm install && nvm use
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
