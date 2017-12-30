SRC = $(wildcard src/*.js)
JSHINT = node_modules/.bin/jshint
ROLLUP = node_modules/.bin/rollup

default: build

build: node_modules $(SRC) rollup.config.js rollup.min.js
	@$(JSHINT) --verbose $(SRC)
	@NODE_ENV=production $(ROLLUP) --config rollup.config.js
	@NODE_ENV=production $(ROLLUP) --config rollup.min.js

