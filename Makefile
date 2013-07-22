build: clean build-js build-test

clean:
	@rm -rf build

build-js:
	@mkdir -p build
	@cp infinity.js ./build/infinity.js
	@./node_modules/.bin/uglifyjs -o ./build/infinity.min.js infinity.js
	@gzip -c ./build/infinity.min.js > ./build/infinity.min.js.gz

build-test:
	@coffee -c test/

annotate:
	@./node_modules/.bin/docco infinity.js

.PHONY: build annotate
