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
### Meals
* `GET /meals?ings=ingredient1,ingredient2,ingredientX&type=meal-type` - returns all meals from the database that contain provided ingredients and type as `ings` and `type` respectively being query params. Additionally, set `Accept-Language` header to define language of ingredients.
* `GET /meals/:id` - returns a specific meal defined by id parameter. It saves to the cache, if it does not exist there. Each request checks the cache.
* `GET /meals/:id/details` - returns details of a meal. It can be any meal provided by any external or local API.
* `GET /meals/:id/comments` - returns all comments for a specific meal.
* `GET /meals/:id/rating` - returns average rating for a specific meal.
* `GET /meals/proposal/all` - returns all meal proposals for a specific user defined by `accessToken`.
* `GET /meals/soft/added` - returns all meal having `soft-added` property.
* `GET /meals/soft/edited` - returns all meal having `soft-edited` property.
* `GET /meals/soft/deleted` - returns all meal having `soft-deleted` property.
* `POST /meals/:id/comment` - posts a new comment to a particular meal. You need to be logged-in.
```json
{
    "mealId": "123",
    "text": "That's an awesome meal!"
}
```

* `POST /meals/:id/rating` - posts a new rating to a specific meal. You need to be logged-in.
```json
{
    "mealId": "123",
    "rating": 8
}
```

* `POST /meals/proposal` - posts query including ingredients. Works for only logged-in users.
```json
{
    "ingredients": [
        "ingredient-name-1",
        "ingredient-name-2",
        "ingredient-name-X"
    ]
}
```
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
    "recipeSections": [
        {
            "name": "",
            "steps": [
                "Heat up to 100 degrees.",
                "Mix everything",
                "Enjoy your meal! :)"
            ]
        }
    ],
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

* `POST /users/:login/grant/:capability` - grants a new permission to a user by admin. You need to have `jwt` token (you need to be logged-in) and you are an admin. `login` is user login whom you want to grant a permission. `capability` is value one of `canAdd`, `canEdit`, `canRemove`.

* `POST /users/:login/deny/:capability` - denies a permission to a user by admin. You need to have `jwt` token (you need to be logged-in) and you are an admin. `login` is user login whom you want to deny a permission. `capability` is value one of `canAdd`, `canEdit`, `canRemove`.

* `POST /users/activate/:userActionId` - activates a user. `userActionId` is activation code, sent in the mail message.

* `GET /users/not-activated` - returns all not activated user accounts.

* `POST /users/:id/activate` - activates a user. `id` indicates which user should be activated only by admin.

All above endpoints excluding `GET /meals` and `GET /meals/:id` require `accessToken` as a cookie.

### Images
* `POST /images/upload` - uploads a new image. You need to be logged-in and have `caAdd` capability or be an admin. Image should be passed as `image` property in form data. The image constraint is 512 KB.

* `serverUrl/images/meals/${filename}` - returns image as a static file.

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