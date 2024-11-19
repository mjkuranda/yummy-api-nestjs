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
### Dishes
* `GET /dishes?ings=ingredient1,ingredient2,ingredientX&type=meal-type&dish=dish-type` - returns all dishes from the database that contain provided ingredients and type as `ings`, `type` and `dish` respectively being query params. Additionally, set `Accept-Language` header to define language of ingredients.
* `GET /dishes/:id` - returns a specific dish defined by id parameter. It saves to the cache, if it does not exist there. Each request checks the cache.
* `GET /dishes/:id/details` - returns details of a dish. It can be any dish provided by any external or local API.
* `GET /dishes/:id/comments` - returns all comments for a specific dish.
* `GET /dishes/:id/rating` - returns average rating for a specific dish.
* `GET /dishes/proposal/all` - returns top 10 dish proposals for a specific user defined by `accessToken`.
* `GET /dishes/soft/added` - returns all dish having `soft-added` property.
* `GET /dishes/soft/edited` - returns all dish having `soft-edited` property.
* `GET /dishes/soft/deleted` - returns all dish having `soft-deleted` property.
* `POST /dishes/:id/comment` - posts a new comment to a particular dish. You need to be logged-in.
```json
{
    "dishId": "123",
    "text": "That's an awesome dish!"
}
```

* `POST /dishes/:id/rating` - posts a new rating to a specific dish. You need to be logged-in.
```json
{
    "dishId": "123",
    "rating": 8
}
```

* `POST /dishes/proposal` - posts query including ingredients. Works for only logged-in users.
```json
{
    "ingredients": [
        "ingredient-name-1",
        "ingredient-name-2",
        "ingredient-name-X"
    ]
}
```

* `POST /dishes/create` - creates a new dish and saves its to the database, marking as soft added. You need to be logged-in and provide following data (`imageUrl` is optional):

```json
{
    "description": "The best dish ever",
    "title": "New awesome dish",
    "ingredients": [
        {
            "id": "ingredient-id-1",
            "name": "Ingredient 1",
            "amount": 5,
            "unit": "piece"
        },
        {
            "id": "ingredient-id-2",
            "name": "Ingredient 2",
            "amount": 2,
            "unit": "jar"
        },
        {
            "id": "ingredient-id-x",
            "name": "Ingredient X",
            "amount": 1,
            "unit": "serving"
        }
    ],
    "imageUrl": "https://some.domain/path/to/resource/image.ext",
    "readyInMinutes": 50,
    "recipeSections": [
        {
            "name": "",
            "steps": [
                "Heat up to 100 degrees.",
                "Mix everything",
                "Enjoy your dish! :)"
            ]
        }
    ],
    "type": "soup",
    "mealType": "launch"
}
```

* `PUT /dishes/:id` - updates (edits) a dish and marks as soft edited. Provide following data, where each property is optional:

```json
{
    "title": "New dish title",
    "description": "New description",
    "readyInMinutes": 80,
    "type": "main course",
    "dishType": "launch",
    "ingredients": [
        {
            "id": "ingredient-id-2",
            "name": "x2",
            "amount": 5,
            "unit": "cup"
        },
        {
            "id": "ingredient-id-x",
            "name": "x1",
            "amount": 1.5,
            "unit": "pieces"
        }
    ],
    "imgUrl": "https://host.com/new-img-url"
}
```

* `DELETE /dishes/:id` - deletes a dish. It marks dish as soft deleted.
* `POST /dishes/:id/create` - confirm adding a new dish. You need to be logged-in and has `canAdd` capability (or be an admin).
* `POST /dishes/:id/edit` - confirm editing a dish. You need to be logged-in and has `canEdit` capability (or be an admin).
* `POST /dishes/:id/delete` - confirm deleting a dish. You need to be logged-in and has `canDelete` capability (or be an admin).

### Users
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

* `POST /users/refreshTokens` - refreshes the user tokens.

* `POST /users/:login/grant/:capability` - grants a new permission to a user by admin. You need to have `jwt` token (you need to be logged-in) and you are an admin. `login` is user login whom you want to grant a permission. `capability` is value one of `canAdd`, `canEdit`, `canDelete`.

* `POST /users/:login/deny/:capability` - denies a permission to a user by admin. You need to have `jwt` token (you need to be logged-in) and you are an admin. `login` is user login whom you want to deny a permission. `capability` is value one of `canAdd`, `canEdit`, `canDelete`.

* `POST /users/activate/:userActionId` - activates a user. `userActionId` is activation code, sent in the mail message.

* `GET /users/not-activated` - returns all not activated user accounts.

* `POST /users/:id/activate` - activates a user. `id` indicates which user should be activated only by admin.

All above endpoints excluding `GET /dishes` and `GET /dishes/:id` require `accessToken` as a cookie.

### Images
* `POST /images/upload` - uploads a new image. You need to be logged-in and have `caAdd` capability or be an admin. Image should be passed as `image` property in form data. The image constraint is 512 KB.

* `serverUrl/images/dishes/${filename}` - returns image as a static file.

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

Provide `PASSWORD_PEPPER` to protect all user account passwords.

Provide `FRONTEND_WEB`, `FRONTEND_MOBILE` URLs to enable CORS for themselves, e.g. `http://localhost:3000`.
Also, you can add `FRONTEND_OTHERS` URLs providing a string, concatenated with `,` character, i.e. `http://localhost:3000,http://localhost:3001`.

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