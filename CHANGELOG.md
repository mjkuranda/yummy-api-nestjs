# Changelog
All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.11.0] - 2023-09-04
### Added
- [Marek Kurańda](https://github.com/mjkuranda): Logger messages to the others modules.
- [Marek Kurańda](https://github.com/mjkuranda): ESLint rule - `@typescript-eslint/semi`.
- [Marek Kurańda](https://github.com/mjkuranda): ESLint rule - `no-trailing-spaces`.
- [Marek Kurańda](https://github.com/mjkuranda): ESLint rule - `space-after-keywords`.

### Changed
- [Marek Kurańda](https://github.com/mjkuranda): ESLint rule `no-console` disallow all console messages.

### Removed
- [Marek Kurańda](https://github.com/mjkuranda): Logging from global validation pipe.

## [1.10.0] - 2023-09-04
### Added
- [Marek Kurańda](https://github.com/mjkuranda): Winston logger and its wrapper - `LoggerModule`.
- [Marek Kurańda](https://github.com/mjkuranda): ESLint rule - `no-console` allowing using `console.info`, `console.warn` and `console.error`.

## [1.9.0] - 2023-09-01
### Added
- [Marek Kurańda](https://github.com/mjkuranda): HTTP exceptions.
- [Marek Kurańda](https://github.com/mjkuranda): Custom validation pipe.

### Removed
- [Marek Kurańda](https://github.com/mjkuranda): Own implementation of status codes.

## [1.8.1] - 2023-08-31
### Fixed
- [Marek Kurańda](https://github.com/mjkuranda): Payload definitions in API section in readme file.
- [Marek Kurańda](https://github.com/mjkuranda): Meal payload - there are required ingredient IDs instead of their DTOs.

## [1.8.0] - 2023-08-31
### Added
- [Marek Kurańda](https://github.com/mjkuranda): `AuthModule` to authenticate users.
- [Marek Kurańda](https://github.com/mjkuranda): Middleware for authorizing users.
- [Marek Kurańda](https://github.com/mjkuranda): Meal author name is given from logged-in username. 

### Fixed
- [Marek Kurańda](https://github.com/mjkuranda): Validation of `imageUrl` in meal DTO.

## [1.7.0] - 2023-08-29
### Changed
- [Marek Kurańda](https://github.com/mjkuranda): Only logged-in users can add a new ingredient.

## [1.6.0] - 2023-08-26
### Added
- [Marek Kurańda](https://github.com/mjkuranda): `POST /users/login` to log in with some credentials.
- [Marek Kurańda](https://github.com/mjkuranda): `POST /users/create` to register a new user.
- [Marek Kurańda](https://github.com/mjkuranda): New eslint rule: `newline-before-return`.
- [Marek Kurańda](https://github.com/mjkuranda): Only logged-in users can create a new meal.

## [1.5.0] - 2023-08-26
### Added
- [Marek Kurańda](https://github.com/mjkuranda): Basic version of `README` file.

## [1.4.0] - 2023-08-25
### Added
- [Marek Kurańda](https://github.com/mjkuranda): `GetQueryResult` as data structure after each request.
- [Marek Kurańda](https://github.com/mjkuranda): New eslint rule: `object-curly-spacing`.

## [1.3.0] - 2023-08-24
### Added
- [Marek Kurańda](https://github.com/mjkuranda): Creating a new ingredient.
- [Marek Kurańda](https://github.com/mjkuranda): Fetching all ingredients for `GET /meals/:id`.

## [1.2.0] - 2023-08-24
### Added
- [Marek Kurańda](https://github.com/mjkuranda): Initial version of ingredient module.
- [Marek Kurańda](https://github.com/mjkuranda): `GET /ingredients` endpoint to return all ingredients.
- [Marek Kurańda](https://github.com/mjkuranda): Initial version of `POST /ingredients/create` endpoint.

## [1.1.0] - 2023-08-24
### Added
- [Marek Kurańda](https://github.com/mjkuranda): `GET /meals` endpoint to return all meals.
- [Marek Kurańda](https://github.com/mjkuranda): `GET /meals/:id` endpoint to return specific meal.
- [Marek Kurańda](https://github.com/mjkuranda): `POST /meals/create` endpoint to create a new meal.
- [Marek Kurańda](https://github.com/mjkuranda): Connection to the MongoDB database.

## [1.0.0] - 2023-08-19
### Added
- [Marek Kurańda](https://github.com/mjkuranda): Initial version of NestJS app.