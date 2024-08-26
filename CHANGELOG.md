# Changelog
All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.42.1] - 2024-08-26
### Fixed
- [Marek Kurańda](https://github.com/mjkuranda): `comment` and `rating` request bodies and fixed endpoints.

## [1.42.0] - 2024-08-26
### Added
- [Marek Kurańda](https://github.com/mjkuranda): New collection `MealRating`.
- [Marek Kurańda](https://github.com/mjkuranda): `GET /meals/:id/rating` endpoint for fetching all comments for a specific meal.
- [Marek Kurańda](https://github.com/mjkuranda): `POST /meals/:id/rating` endpoint for posting new rating for a specific meal.

## [1.41.0] - 2024-08-26
### Added
- [Marek Kurańda](https://github.com/mjkuranda): New collection `MealComment`.
- [Marek Kurańda](https://github.com/mjkuranda): `GET /meals/:id/comments` endpoint for fetching all comments for a specific meal.
- [Marek Kurańda](https://github.com/mjkuranda): `POST /meals/:id/comment` endpoint for posting new comments for a specific meal.

## [1.40.1] - 2024-08-24
### Changed
- [Marek Kurańda](https://github.com/mjkuranda): When your language is English then do not translate ingredients and recipe.

### Fixed
- [Marek Kurańda](https://github.com/mjkuranda): Unexpected accept language.

## [1.40.0] - 2024-08-24
### Added
- [Marek Kurańda](https://github.com/mjkuranda): `/ingredients` as a public static directory.

### Changed
- [Marek Kurańda](https://github.com/mjkuranda): Structure of every ingredient category set.
- [Marek Kurańda](https://github.com/mjkuranda): Application loads all ingredients while starting itself.

## [1.39.0] - 2024-08-23
### Changed
- [Marek Kurańda](https://github.com/mjkuranda): `activateViaLogin` to `activateViaId`.

## [1.38.3] - 2024-08-22
### Changed
- [Marek Kurańda](https://github.com/mjkuranda): Some validation conditions regarding meal creation DTO.

## [1.38.2] - 2024-08-22
### Changed
- [Marek Kurańda](https://github.com/mjkuranda): `POST /meals/create` payload in `README` regarding recent deletion of `number` property.

## [1.38.1] - 2024-08-21
### Removed
- [Marek Kurańda](https://github.com/mjkuranda): `number` property from recipe step simplifying to `string`.

## [1.38.0] - 2024-08-20
### Added
- [Marek Kurańda](https://github.com/mjkuranda): `language` property to `MealDocument` and its schema.

## [1.37.0] - 2024-08-20
### Added
- [Marek Kurańda](https://github.com/mjkuranda): `google-translate-api-x` library.
- [Marek Kurańda](https://github.com/mjkuranda): `TranslateModule` to translate all ingredient expressions and recipe sections.
- [Marek Kurańda](https://github.com/mjkuranda): `Accept-Language` header in `GET /meals` to define language for an incoming client.
- [Marek Kurańda](https://github.com/mjkuranda): Unit tests for `MealController`.

### Changed
- [Marek Kurańda](https://github.com/mjkuranda): `GET /meal/:id/details` return type to `DetailedMealWithTranslations`.

### Removed
- [Marek Kurańda](https://github.com/mjkuranda): `IngredientUnit` enum.

## [1.36.0] - 2024-08-19
### Changed
- [Marek Kurańda](https://github.com/mjkuranda): Meal schema and renamed `instructions` to `recipeSections` and other fields similarly.

## [1.35.0] - 2024-08-19
### Added
- [Marek Kurańda](https://github.com/mjkuranda): `multer` library.
- [Marek Kurańda](https://github.com/mjkuranda): `POST /images/upload` for uploading new images.
- [Marek Kurańda](https://github.com/mjkuranda): `/data/images/meals` directory for uploaded meal images.
- [Marek Kurańda](https://github.com/mjkuranda): capability to get images via `images/meals/${filename}`.

## [1.34.0] - 2024-08-15
### Added
- [Marek Kurańda](https://github.com/mjkuranda): `POST /users/:login/activate` endpoint to activate users via login.

## [1.33.1] - 2024-08-15
### Fixed
- [Marek Kurańda](https://github.com/mjkuranda): DTO for meal creation no longer requires `author` and `posted` fields.

## [1.33.0] - 2024-08-12
### Added
- [Marek Kurańda](https://github.com/mjkuranda): `GET /meals/soft/added`, `GET /meals/soft/edited` and `GET /meals/soft/deleted` endpoints.
- [Marek Kurańda](https://github.com/mjkuranda): `GET /users/not-activated` endpoint.

## [1.32.1] - 2024-07-25
### Added
- [Marek Kurańda](https://github.com/mjkuranda): Log info while generating meal proposals.

### Fixed
- [Marek Kurańda](https://github.com/mjkuranda): Filtering empty array of ingredients.

## [1.32.0] - 2024-07-24
### Added
- [Marek Kurańda](https://github.com/mjkuranda): `users/login` returns user permissions.

### Changed
- [Marek Kurańda](https://github.com/mjkuranda): `users/login` return code to `200`.
- [Marek Kurańda](https://github.com/mjkuranda): tokens have `sameSite` property.
- [Marek Kurańda](https://github.com/mjkuranda): Authentication guard checks also tokens included in cookies.

## [1.31.0] - 2024-07-10
### Added
- [Marek Kurańda](https://github.com/mjkuranda): More properties of meal, e.g. is vegan, healthy and so on, and how much time it takes to prepare.
- [Marek Kurańda](https://github.com/mjkuranda): Instruction info from Spoonacular API.

### Fixed
- [Marek Kurańda](https://github.com/mjkuranda): Ingredient and meal images URL.
- [Marek Kurańda](https://github.com/mjkuranda): API url in abstract service.

## [1.30.0] - 2024-07-10
### Added
- [Marek Kurańda](https://github.com/mjkuranda): Enabled CORS for `http://localhost:3000/`.

## [1.29.0] - 2024-03-20
### Added
- [Marek Kurańda](https://github.com/mjkuranda): Grammage for a specific meal.

### Changed
- [Marek Kurańda](https://github.com/mjkuranda): `MealDocument` containing more details about ingredients: `amount`, `imageUrl`, `unit`, and `unitLong`.
- [Marek Kurańda](https://github.com/mjkuranda): Meal details returns more information about ingredients for a specific meal.

## [1.28.4] - 2024-03-16
### Changed
- [Marek Kurańda](https://github.com/mjkuranda): Meal prediction range period to 14 days.

## [1.28.3] - 2024-03-16
### Removed
- [Marek Kurańda](https://github.com/mjkuranda): Duplicated ingredients in JSON files.

## [1.28.2] - 2024-03-16
### Added
- [Marek Kurańda](https://github.com/mjkuranda): Missing `GET /meals/proposal/all` and `POST /meals/proposal` endpoint information in `README.md` file.

## [1.28.1] - 2024-02-22
### Fixed
- [Marek Kurańda](https://github.com/mjkuranda): `GET /meals` when no query or ingredients are provided.

## [1.28.0] - 2024-02-20
### Added
- [Marek Kurańda](https://github.com/mjkuranda): Salt property for every user and pepper in API.
- [Marek Kurańda](https://github.com/mjkuranda): `PasswordManager` module to hash and compare passwords and generating salts.

## [1.27.0] - 2024-02-17
### Added
- [Marek Kurańda](https://github.com/mjkuranda): Meal recommendation system - `GET /meals/proposal/all` and `POST /meals/proposal` to get proposals and insert new search queries respectively.
- [Marek Kurańda](https://github.com/mjkuranda): Tests for these endpoints.

### Changed
- [Marek Kurańda](https://github.com/mjkuranda): `accessToken` and `refreshToken` duration time to 15 and 60 minutes respectively.

## [1.26.0] - 2024-02-16
### Added
- [Marek Kurańda](https://github.com/mjkuranda): `/meals/:id/details` endpoint to get more detailed information about a meal.
- [Marek Kurańda](https://github.com/mjkuranda): Tests for this endpoint.

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