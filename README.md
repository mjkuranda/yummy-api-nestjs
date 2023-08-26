# Yummy API
## REST API for Yummy application

Technologies:
* Node.js
* Nest.js
* TypeScript
* MongoDB
* JWT

## API
* `GET /meals` - returns all meals from the database
* `GET /meals/:id` - returns a specific meal defined by id parameter.
* `POST /meals/create` - creates a new meal and saves its to the database. You need to provide following data:
```json
{
  "author": "Author",
  "description": "The best meal ever",
  "name": "Meal name",
  "ingredients": [
    Ingredient1,
    Ingredient2,
    ...
  ],
  "imageUrl"?: "...",
  "type": "SOUP"
}
```

* `GET /ingredients/` - returns all ingredients from the database.
* `POST /ingredients/create` - creates a new ingredient and saves its to the database. You need to provide following data:
```json
{
  "name": "Ingredient name"
}
```

* `POST /users/create` - register a new user. You need to provide following data:
```json
{
  "login": "userName",
  "password": "123"
}
```

* `POST /users/login` - log in a user. You need to pass `login` and `password`.
* `POST /users/logout` - log out a user.

## Environmental variables

To set up this backend application, you need to define the following variables:
To connect with local database, you need:
- `DB_PORT` (port for MongoDB)
- `DB_COLLECTION` (collection in the database)

However, if you want to connect with MongoDB Atlas, you need these variables:
- `DB_USER` (MongoDB user)
- `DB_PASS` (password for MongoDB)
- `PROD=true`

## Development
You need to change version in `package.json` and add a record to the `CHANGELOG.md`.

To create a new module, you need to use:
- `nest g mo <module_name>` to create a new module.
- `nest g co <controller_name> <module_name>` to create a new controller.
- `nest g s <service_name> <module_name>` to create a new service.