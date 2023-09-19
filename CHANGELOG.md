# Changelog
All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.17.0] - 2023-09-18
### Added
- [Marek Kurańda](https://github.com/mjkuranda): E2E tests for `UserModule`.
- [Marek Kurańda](https://github.com/mjkuranda): E2E tests for `MealModule`.
- [Marek Kurańda](https://github.com/mjkuranda): Missing endpoints in `README` file.
- [Marek Kurańda](https://github.com/mjkuranda): ESLint rule - `arrow-spacing` before and after arrow function.

### Fixed
- [Marek Kurańda](https://github.com/mjkuranda): Payload for creating meal endpoint in `README` file.
- [Marek Kurańda](https://github.com/mjkuranda): Meal unit tests.

### Removed
- [Marek Kurańda](https://github.com/mjkuranda): Ingredient controller tests.


## [1.16.0] - 2023-09-15
### Added
- [Marek Kurańda](https://github.com/mjkuranda): `PUT /meals/:id` endpoint to edit a meal.
- [Marek Kurańda](https://github.com/mjkuranda): `DELETE /meals/:id` endpoint to delete a meal.
- [Marek Kurańda](https://github.com/mjkuranda): `POST /meals/:id/create` endpoint to confirm adding a new meal.
- [Marek Kurańda](https://github.com/mjkuranda): `POST /meals/:id/edit` endpoint to confirm edition of meal.
- [Marek Kurańda](https://github.com/mjkuranda): `POST /meals/:id/delete` endpoint to permanently delete a meal.

### Changed
- [Marek Kurańda](https://github.com/mjkuranda): `GET /meals` returns all meals except meals containing `softDeleted` flag.
- [Marek Kurańda](https://github.com/mjkuranda): `GET /meals/:id` returns a meal if it does not contain `softDeleted` flag.

### Fixed
- [Marek Kurańda](https://github.com/mjkuranda): Endpoints request body. Data was put into `data` property.

## [1.15.0] - 2023-09-14
### Added
- [Marek Kurańda](https://github.com/mjkuranda): `POST /users/:login/grant/:capability` endpoint to add new permissions to users by admin user.
- [Marek Kurańda](https://github.com/mjkuranda): `POST /users/:login/deny/:capability` endpoint to remove permissions to users by admin user.

## [1.14.0] - 2023-09-11
### Added
- [Marek Kurańda](https://github.com/mjkuranda): Integration with Redis cache.
- [Marek Kurańda](https://github.com/mjkuranda): Redis can cache any data for only 1 hour.
- [Marek Kurańda](https://github.com/mjkuranda): `GET /ingredients` can cache and return cached ingredients.
- [Marek Kurańda](https://github.com/mjkuranda): `POST /meals/create` can cache a new meal.
- [Marek Kurańda](https://github.com/mjkuranda): `GET /meals` can cache a found meal.

## [1.13.0] - 2023-09-08
### Changed
- [Marek Kurańda](https://github.com/mjkuranda): Service methods return only document objects.

### Removed
- [Marek Kurańda](https://github.com/mjkuranda): `QueryResult` interface.

## [1.12.0] - 2023-09-05
### Added
- [Marek Kurańda](https://github.com/mjkuranda): Unit tests for `UserService`.
- [Marek Kurańda](https://github.com/mjkuranda): Unit tests for `MealService`.
- [Marek Kurańda](https://github.com/mjkuranda): Unit tests for `IngredientService`.
- [Marek Kurańda](https://github.com/mjkuranda): Unit tests for `AuthService`.

### Changed
- [Marek Kurańda](https://github.com/mjkuranda): `space-before-function-parens` allows space after `async` keyword.

## [1.11.0] - 2023-09-04
### Added
- [Marek Kurańda](https://github.com/mjkuranda): Logger messages to the others modules.
- [Marek Kurańda](https://github.com/mjkuranda): ESLint rule - `@typescript-eslint/semi`.
- [Marek Kurańda](https://github.com/mjkuranda): ESLint rule - `no-trailing-spaces`.
- [Marek Kurańda](https://github.com/mjkuranda): ESLint rule - `keyword-spacing`.
- [Marek Kurańda](https://github.com/mjkuranda): ESLint rule - `space-before-blocks`.
- [Marek Kurańda](https://github.com/mjkuranda): ESLint rule - `space-before-function-paren` set as `never`.

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