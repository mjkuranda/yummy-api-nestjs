# Yummy API
## REST API for Yummy application

Technologies:
* Node.js
* Nest.js
* TypeScript
* MongoDB
* JWT
* Jest
* Redis
* SuperTest

## API
* `GET /meals` - returns all meals from the database that contain provided ingredients and types as `ings` and `type` respectively being query params.
* `GET /meals/:id` - returns a specific meal defined by id parameter. It saves to the cache, if it does not exist there. Each request checks the cache.
* `POST /meals/create` - creates a new meal and saves its to the database, marking as soft added. You need to be logged-in and provide following data (`imageUrl` is optional):
```json
{
  "description": "The best meal ever",
  "title": "New awesome meal",
  "ingredients": [
    "ingredient-id-1",
    "ingredient-id-2",
    "ingredient-id-x"
  ],
  "imageUrl": "https://some.domain/path/to/resource/image.ext",
  "type": "soup"
}
```
* `PUT /meals/:id` - updates (edits) a meal and marks as soft edited. Provide following data, where each property is optional:
```json
{
  "description": "New description",
  "ingredients": [
    "ingredient-id-2",
    "ingredient-id-x"
  ],
  "imgUrl": "https://host.com/new-img-url"
}
```
* `DELETE /meals/:id` - deletes a meal. It marks meal as soft deleted.
* `POST /meals/:id/create` - confirm adding a new meal. You need to be logged-in and has `canAdd` capability (or be an admin).
* `POST /meals/:id/edit` - confirm editing a meal. You need to be logged-in and has `canEdit` capability (or be an admin).
* `POST /meals/:id/delete` - confirm deleting a meal. You need to be logged-in and has `canDelete` capability (or be an admin).

* `GET /ingredients/` - returns all ingredients from the database. It saves to the cache. Each request checks, if there exist ingredient and return them, if they exist.
* `POST /ingredients/create` - creates a new ingredient and saves its to the database. You need to provide following data:
```json
{
  "name": "Ingredient name",
  "category": "Category name"
}
```

* `POST /users/create` - register a new user. You need to provide following data:
```json
{
  "email": "email.name@domain.com",
  "login": "userName",
  "password": "123"
}
```

* `POST /users/login` - log in a user. Only activated users can log in. You need to provide following data:
```json
{
  "login": "userName",
  "password": "123"
}
```

* `POST /users/logout` - log out a user.

* `POST /users/:login/grant/:capability` - grants a new permission to a user by admin. You need to have `jwt` token (you need to be logged-in) and you are an admin. `login` is user login whom you want to grant a permission. `capability` is value one of `canAdd`, `canEdit`, `canRemove`.

* `POST /users/:login/deny/:capability` - denies a permission to a user by admin. You need to have `jwt` token (you need to be logged-in) and you are an admin. `login` is user login whom you want to deny a permission. `capability` is value one of `canAdd`, `canEdit`, `canRemove`.

* `POST /users/activate/:userActionId` - activates a user. `userActionId` is activation code, sent in the mail message.

All above endpoints excluding `GET /meals` and `GET /meals/:id` require `accessToken` as a cookie.

## Environmental variables

To set up this backend application, you need to define the following variables:
To connect with local database, you need:
- `DB_HOSTNAME` (hostname for MongoDB)
- `DB_PORT` (port for MongoDB)
- `DB_COLLECTION` (collection in the database)

However, if you want to connect with MongoDB Atlas, you need these variables:
- `DB_USER` (MongoDB user)
- `DB_PASS` (password for MongoDB)
- `PROD=true`

To connect to Redis, you need:
- `REDIS_HOSTNAME` (default is `localhost`)
- `REDIS_PORT` (default is `6379`)

To connect to MSA, you need:
- `MAIL_USER` (mail address)
- `MAIL_PASS` (password for mail address)
- `MAIL_HOST` (smtp address)
- `MAIL_PORT` (smtp port)

To connect to Spoonacular API, provide:
- `SPOONACULAR_API_KEY` (API key defined for a particular account on Spoonacular)

## Development
You need to change version in `package.json` and add a record to the `CHANGELOG.md`.
Before creating a pull request, you need to execute following commands, with success result:
```shell
npm run lint:fix
npm run test
npm run test:e2e
```

To create a new module, you need to use:
- `nest g mo modules/<module_name>` to create a new module.
- `nest g co modules/<module_name>` to create a new controller.
- `nest g s modules/<module_name>` to create a new service.