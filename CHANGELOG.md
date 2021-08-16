# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.9.0](https://github.com/lightpohl/gb-dl/compare/v2.8.0...v2.9.0) (2021-08-16)


### Features

* add '--video-number-reverse option' ([c4bf062](https://github.com/lightpohl/gb-dl/commit/c4bf0625c91cc35a5b81ca9f38821a8a755a9fce))

## [2.8.0](https://github.com/lightpohl/gb-dl/compare/v2.7.1...v2.8.0) (2021-05-08)


### Features

* add "--add-date-prefix" option ([05987ed](https://github.com/lightpohl/gb-dl/commit/05987edb9fe0973641b126163ebac361ab0aaaed))

### [2.7.1](https://github.com/lightpohl/gb-dl/compare/v2.7.0...v2.7.1) (2021-05-07)


### Bug Fixes

* 8k bitrate urls should be properly saved to the archive ([29ad4fe](https://github.com/lightpohl/gb-dl/commit/29ad4fe68e88c774c2cf5e1680e2d45c16f0bf9f))

## [2.7.0](https://github.com/lightpohl/gb-dl/compare/v2.6.8...v2.7.0) (2021-05-05)


### Features

* add --add-guid-prefix flag ([eeb4d5d](https://github.com/lightpohl/gb-dl/commit/eeb4d5d56b5cfb2f194732b750899091c896fd53)), closes [#3](https://github.com/lightpohl/gb-dl/issues/3)


### Bug Fixes

* add workaround for missing 8k bitrate videos ([9a837ff](https://github.com/lightpohl/gb-dl/commit/9a837ff8cb3de0f3eb5add87798046a469c73b56)), closes [#4](https://github.com/lightpohl/gb-dl/issues/4)

### [2.6.8](https://github.com/lightpohl/gb-dl/compare/v2.6.7...v2.6.8) (2021-05-05)


### Bug Fixes

* request video details directly after finding via search API ([35322b1](https://github.com/lightpohl/gb-dl/commit/35322b1fc224273535510e29fa34fdc5076dd2ae)), closes [#2](https://github.com/lightpohl/gb-dl/issues/2)

### [2.6.7](https://github.com/lightpohl/gb-dl/compare/v2.6.6...v2.6.7) (2020-05-24)


### Bug Fixes

* do not show 100% when download first starts ([03b1fd9](https://github.com/lightpohl/gb-dl/commit/03b1fd912aafd2251bcb50f0bd5d2c65fd56b5b8))

### [2.6.6](https://github.com/lightpohl/gb-dl/compare/v2.6.5...v2.6.6) (2020-05-16)


### Bug Fixes

* don't log or archive API key ([d44c846](https://github.com/lightpohl/gb-dl/commit/d44c8463fd9681cc0c093078f7ea8181f6e985bb))

### [2.6.5](https://github.com/lightpohl/gb-dl/compare/v2.6.4...v2.6.5) (2020-05-11)


### Bug Fixes

* do not archive if video save fails ([d5bd372](https://github.com/lightpohl/gb-dl/commit/d5bd372277b066c8e9765cf31b4ea85cd46ec48e))

### [2.6.4](https://github.com/lightpohl/gb-dl/compare/v2.6.3...v2.6.4) (2020-05-10)


### Bug Fixes

* add HEAD check before download stream starts ([a426689](https://github.com/lightpohl/gb-dl/commit/a426689ae65463c404fd65179d52343de59555cb))

### [2.6.3](https://github.com/lightpohl/gb-dl/compare/v2.6.2...v2.6.3) (2020-05-09)


### Bug Fixes

* throw error after cleanup ([3cb52ff](https://github.com/lightpohl/gb-dl/commit/3cb52ff89e48211d000cd3911731d82bb08d9643))

### [2.6.2](https://github.com/lightpohl/gb-dl/compare/v2.6.1...v2.6.2) (2020-05-09)


### Bug Fixes

* cleanup download files on error ([bc22894](https://github.com/lightpohl/gb-dl/commit/bc228949ef4139245a9a6395845d08f2abc1f5f1))

### [2.6.1](https://github.com/lightpohl/gb-dl/compare/v2.6.0...v2.6.1) (2020-04-29)


### Bug Fixes

* update got usages for v11 ([e946775](https://github.com/lightpohl/gb-dl/commit/e9467750be3311e093fdc530efde9c5b5456dae1))

## [2.6.0](https://github.com/lightpohl/gb-dl/compare/v2.5.0...v2.6.0) (2020-04-29)


### Features

* add GIANTBOMB_TOKEN env support ([e5fedd7](https://github.com/lightpohl/gb-dl/commit/e5fedd72593a0284d1ef2a381821cc8e90388e43))


### Bug Fixes

* catch more errors from invalid --video-number ([5b7852b](https://github.com/lightpohl/gb-dl/commit/5b7852b72624abd432609daa400847bf167d6e48))

## [2.5.0](https://github.com/lightpohl/gb-dl/compare/v2.4.0...v2.5.0) (2019-11-17)


### Features

* add --date-before flag option ([9fe31c0](https://github.com/lightpohl/gb-dl/commit/9fe31c0d394b77f17afde95960375e16f2fd27be))

## [2.4.0](https://github.com/lightpohl/gb-dl/compare/v2.3.0...v2.4.0) (2019-11-15)


### Features

* add --date-after flag option ([aed1e34](https://github.com/lightpohl/gb-dl/commit/aed1e3446eb678749d6946b9ff7a283ca62ca043))

## [2.3.0](https://github.com/lightpohl/gb-dl/compare/v2.2.0...v2.3.0) (2019-11-13)


### Features

* add --archive flag option ([654ffeb](https://github.com/lightpohl/gb-dl/commit/654ffeb23e0eb938ce2ad5c9eb5192aa92ba8e53))

## [2.2.0](https://github.com/lightpohl/gb-dl/compare/v2.1.3...v2.2.0) (2019-11-09)


### Features

* check if out directory exists on script start ([6391008](https://github.com/lightpohl/gb-dl/commit/63910080e909decebf52a0de811e1453a3b3e52c))
* trim cache on script start ([f96b0d6](https://github.com/lightpohl/gb-dl/commit/f96b0d66f9cc70dd35d6fcba125a1fee91375a25))

### [2.1.3](https://github.com/lightpohl/gb-dl/compare/v2.1.2...v2.1.3) (2019-11-09)


### Bug Fixes

* add download complete message ([dbfb593](https://github.com/lightpohl/gb-dl/commit/dbfb5930cecc3c3ea59b8e118aa20c7deed9a1bf))

### [2.1.2](https://github.com/lightpohl/gb-dl/compare/v2.1.1...v2.1.2) (2019-11-09)


### Bug Fixes

* round progress percentage and remove flicker ([65e1287](https://github.com/lightpohl/gb-dl/commit/65e1287c81338ed906ec52263f35338dffee8004))

### [2.1.1](https://github.com/lightpohl/gb-dl/compare/v2.1.0...v2.1.1) (2019-11-08)


### Bug Fixes

* do not cache bad search result ([aee73a7](https://github.com/lightpohl/gb-dl/commit/aee73a7ba6ae239f04226caabf7d638c64cc6a4a))

## [2.1.0](https://github.com/lightpohl/gb-dl/compare/v2.0.2...v2.1.0) (2019-11-08)


### Features

* add download progress output ([807b931](https://github.com/lightpohl/gb-dl/commit/807b931fdbf350cb2f6df987a0603de32ddadf0e))

### [2.0.2](https://github.com/lightpohl/gb-dl/compare/v2.0.1...v2.0.2) (2019-11-07)


### Bug Fixes

* unable to use --video-number ([6099bcf](https://github.com/lightpohl/gb-dl/commit/6099bcfae1d10be968c922f190e420667bf0153e))

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
