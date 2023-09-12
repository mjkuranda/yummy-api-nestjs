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

## API
* `GET /meals` - returns all meals from the database
* `GET /meals/:id` - returns a specific meal defined by id parameter. It saves to the cache, if it does not exist there. Each request checks the cache.
* `POST /meals/create` - creates a new meal and saves its to the database and cache. You need to provide following data:
```json
{
  "author": "Author",
  "description": "The best meal ever",
  "name": "Meal name",
  "ingredients": [
    "ingredient-id-1",
    "ingredient-id-2",
    "ingredient-id-x"
  ],
  "imageUrl": "https://some.domain/path/to/resource/image.ext",
  "type": "SOUP"
}
```

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
  "login": "userName",
  "password": "123"
}
```

* `POST /users/login` - log in a user. You need to pass provide folowing data:

```json
{
  "login": "userName",
  "password": "123"
}
```

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

To connect with Redis, you need:
- `REDIS_HOSTNAME` (default is `localhost`)
- `REDIS_PORT` (default is `6379`)

## Development
You need to change version in `package.json` and add a record to the `CHANGELOG.md`.

To create a new module, you need to use:
- `nest g mo modules/<module_name>` to create a new module.
- `nest g co modules/<module_name>` to create a new controller.
- `nest g s modules/<module_name>` to create a new service.