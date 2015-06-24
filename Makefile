build: clean build-js build-test

clean:
	@rm -rf build

build-js:
	@mkdir -p build
	@./node_modules/.bin/browserify ./src/infinity.js > ./build/infinity.js
	@./node_modules/.bin/uglifyjs -o ./build/infinity.min.js infinity.js
	@gzip -c ./build/infinity.min.js > ./build/infinity.min.js.gz

build-test: build-js
	@coffee -c test/

annotate: build-js
	@./node_modules/.bin/docco ./build/infinity.js

.PHONY: build annotate
