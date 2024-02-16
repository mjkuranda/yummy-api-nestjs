# Changelog
All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.26.0] - 2024-02-16
### Added
- [Marek Kurańda](https://github.com/mjkuranda): `/meals/:id/details` endpoint to get more detailed information about a meal.

## [1.25.0] - 2024-02-15
### Added
- [Marek Kurańda](https://github.com/mjkuranda): Filtering provided ingredients - only supported ingredients.
- [Marek Kurańda](https://github.com/mjkuranda): Test for `IngredientService`.

### Changed
- [Marek Kurańda](https://github.com/mjkuranda): Ingredient as a string instead of object.

### Removed
- [Marek Kurańda](https://github.com/mjkuranda): Ingredient schema, repository and DTO.

## [1.24.1] - 2024-02-15
### Fixed
- [Marek Kurańda](https://github.com/mjkuranda): `/users/refreshTokens` endpoint sending no content.

## [1.24.0] - 2024-02-15
### Removed
- [Marek Kurańda](https://github.com/mjkuranda): AuthModule.
- [Marek Kurańda](https://github.com/mjkuranda): Middleware classes.

## [1.23.1] - 2024-02-15
### Fixed
- [Marek Kurańda](https://github.com/mjkuranda): Building query for searching meals.

## [1.23.0] - 2024-02-14
### Added
- [Marek Kurańda](https://github.com/mjkuranda): Refresh token endpoint at `/users/refreshTokens`.
- [Marek Kurańda](https://github.com/mjkuranda): JwtManager utils.
- [Marek Kurańda](https://github.com/mjkuranda): Unit tests for `UserService/refreshTokens`.
- [Marek Kurańda](https://github.com/mjkuranda): E2E tests for `/users/refreshTokens`.

## [1.22.0] - 2024-02-12
### Added
- [Marek Kurańda](https://github.com/mjkuranda): Unit tests for `MealService/getMeals`.
- [Marek Kurańda](https://github.com/mjkuranda): E2E tests for `GET /meals`.
- [Marek Kurańda](https://github.com/mjkuranda): Unit tests for `AbstractApiService/getMeals`.
- [Marek Kurańda](https://github.com/mjkuranda): `AxiosService` for wrapping axios instance to inject to API integration services.

## [1.21.1] - 2024-02-12
### Fixed
- [Marek Kurańda](https://github.com/mjkuranda): Query building for various APIs.

## [1.21.0] - 2024-02-10
### Added
- [Marek Kurańda](https://github.com/mjkuranda): Spoonacular API integration.
- [Marek Kurańda](https://github.com/mjkuranda): Caching from external API responses.

## [1.20.0] - 2024-02-08
### Added
- [Marek Kurańda](https://github.com/mjkuranda): Various guards.
- [Marek Kurańda](https://github.com/mjkuranda): Time constants.
- [Marek Kurańda](https://github.com/mjkuranda): Saving tokens to the redis - `accessToken` and `refreshToken` for 1 minute and 5 minutes respectively.

### Changed
- [Marek Kurańda](https://github.com/mjkuranda): Authentication and Authorization using guards.
- [Marek Kurańda](https://github.com/mjkuranda): Logging-in generates `accessToken` and `refreshToken`.
- [Marek Kurańda](https://github.com/mjkuranda): Endpoints are guarded by checking `accessToken`.
- [Marek Kurańda](https://github.com/mjkuranda): `/users/login` and `/users/logout` returns `204` and `205` respectively.

### Fixed
- [Marek Kurańda](https://github.com/mjkuranda): E2E tests and unit tests.
- [Marek Kurańda](https://github.com/mjkuranda): Activation of the users, fixing user schema.
- [Marek Kurańda](https://github.com/mjkuranda): Redis keys expiration.

## [1.19.1] - 2024-02-05
### Added
- [Marek Kurańda](https://github.com/mjkuranda): Information about `DB_HOSTNAME` in `README` file.

## [1.19.0] - 2024-02-05
### Added
- [Marek Kurańda](https://github.com/mjkuranda): Repository abstraction layer.
- [Marek Kurańda](https://github.com/mjkuranda): `DB_HOSTNAME` variable to define hostname for database.

### Changed
- [Marek Kurańda](https://github.com/mjkuranda): `interface` to `document` name.
- [Marek Kurańda](https://github.com/mjkuranda): localisation of `documents`, `schemas` and `repositories` to `mongodb` directory.

### Fixed
- [Marek Kurańda](https://github.com/mjkuranda): E2E tests.

## [1.18.0] - 2023-09-20
### Added
- [Marek Kurańda](https://github.com/mjkuranda): connection to the MSA and sending mails capability.
- [Marek Kurańda](https://github.com/mjkuranda): user action model that contains info about action and what for user.
- [Marek Kurańda](https://github.com/mjkuranda): `activated` property to `UserModel` defining time, when user confirm email, provided value as timestamp.
- [Marek Kurańda](https://github.com/mjkuranda): `keyword-spacing` ESLint rule.
- [Marek Kurańda](https://github.com/mjkuranda): `space-after-keywords` ESLint rule set to off.
- [Marek Kurańda](https://github.com/mjkuranda): `no-explicit-any` ESLint rule set to off.

### Changed
- [Marek Kurańda](https://github.com/mjkuranda): Only activated users can log in.

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