# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [2.0.1](https://github.com/lightpohl/gb-dl/compare/v2.0.0...v2.0.1) (2019-11-06)


### Bug Fixes

* include filters on initial search, add max depth ([28a8274](https://github.com/lightpohl/gb-dl/commit/28a82744fe8ad8adc866abf810bdaaafa7ca2fc0))

## [2.0.0](https://github.com/lightpohl/gb-dl/compare/v1.2.0...v2.0.0) (2019-11-06)


### ⚠ BREAKING CHANGES

* use --show-name instead of --show-regex
* use --video-name instead of --video-regex
* find partial matches, ignore case

fix: rate limiter would sometimes not return

### Features

* simplify API for names, make options more flexible ([1a896f8](https://github.com/lightpohl/gb-dl/commit/1a896f8f716d6764fc1633f0ba1dbe17b641733a))

## [1.2.0](https://github.com/lightpohl/gb-dl/compare/v1.1.0...v1.2.0) (2019-11-06)


### Features

* add debug flag ([a814457](https://github.com/lightpohl/gb-dl/commit/a814457047ade8ce4eeb9ce38bffb18c4aa33b46))


### Bug Fixes

* add rate limit to all API calls ([4410a9a](https://github.com/lightpohl/gb-dl/commit/4410a9a2c7555d890d5ce2ebb21781ba2f388c62))

## [1.1.0](https://github.com/lightpohl/gb-dl/compare/v1.0.1...v1.1.0) (2019-11-05)


### Features

* add 1 second rate limit delay ([affab34](https://github.com/lightpohl/gb-dl/commit/affab341b988b7a3c68ea52ef6066948a5bd7c93))
* attempt simple search for video first ([b8fc547](https://github.com/lightpohl/gb-dl/commit/b8fc54707628650f05f5cd9b302b0f4f3a3c7c9c))
* default to highest quality download ([e25be04](https://github.com/lightpohl/gb-dl/commit/e25be0401cbb549b24d251253809721272a78db5))

### [1.0.1](https://github.com/lightpohl/gb-dl/compare/v1.0.0...v1.0.1) (2019-11-05)


### Bug Fixes

* API key not being included in download request ([0697338](https://github.com/lightpohl/gb-dl/commit/06973386861039a70562cd04cd954c4841a0429c))

## [1.0.0](https://github.com/lightpohl/gb-dl/compare/v0.1.3...v1.0.0) (2019-11-05)

### [0.1.3](https://github.com/lightpohl/gb-dl/compare/v0.1.2...v0.1.3) (2019-11-04)

### [0.1.2](https://github.com/lightpohl/gb-dl/compare/v0.1.1...v0.1.2) (2019-11-04)


### Bug Fixes

* write cache to cwd, add --clean flag ([3040afb](https://github.com/lightpohl/gb-dl/commit/3040afb45f60e0352f06c200e20063540d189b4e))

### [0.1.1](https://github.com/lightpohl/gb-dl/compare/v0.1.0...v0.1.1) (2019-11-04)


### Features

* add support for more shows ([d75cb7a](https://github.com/lightpohl/gb-dl/commit/d75cb7a65b1d27d42da888feeb4be2fbfe872d22))

## 0.1.0 (2019-11-04)


### Features

* add simple caching system ([e2359b6](https://github.com/lightpohl/gb-dl/commit/e2359b68bdba47efd439c384052ff861349b7cb8))
