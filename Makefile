# Look for nvm base directory
ifneq (,$(wildcard ~/.nvm/nvm.sh))
NVM_PATH=~/.nvm/nvm.sh
else ifneq (,$(wildcard /usr/local/lib/nvm/nvm.sh))
NVM_PATH=/usr/local/lib/nvm/nvm.sh
endif

ifeq ($(NVM_PATH),)
nvm_use = nvm use
else
# create a nvm use alias
# @see https://devops.stackexchange.com/questions/629/how-can-i-make-use-of-bash-functions-in-a-makefile
nvm_use = . $(NVM_PATH) || true && nvm install && nvm use
endif

.PHONY: build
build: install compile

.PHONY: install
install:
	$(call nvm_use, yarn install)

.PHONY: compile
compile:
	npm run compile

.PHONY: lint
lint:
	npm run lint

.PHONY: test
test:
	npm run test
