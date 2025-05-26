Hitherto, the graph is quite complex:
```mermaid
graph TD

%% AppModule
    AppModule --> HealthcheckModule
    AppModule --> DishModule
    AppModule --> UserModule
    AppModule --> RecipeModule
    AppModule --> ImageModule
    AppModule --> LoggerModule

%% ImageModule
    ImageModule --> JwtManagerModule
    ImageModule --> RedisModule

%% RecipeModule
    RecipeModule --> MongooseModule
    RecipeModule --> JwtManagerModule
    RecipeModule --> RedisModule
    RecipeModule --> ExternalApiModule
    RecipeModule --> TranslationModule

%% UserModule
    UserModule --> MongooseModule
    UserModule --> JwtManagerModule
    UserModule --> RedisModule
    UserModule --> MailManagerModule
    UserModule --> PasswordManagerModule

%% DishModule
    DishModule --> DishReadModule
    DishModule --> DishWriteModule
    DishModule --> IngredientModule

%% DishReadModule
    DishReadModule --> DishSourceModule
    DishReadModule --> CacheModule
    DishReadModule --> LoggerModule

%% DishWriteModule
    DishWriteModule --> DishSourceModule
    DishWriteModule --> CacheModule
    DishWriteModule --> LoggerModule
    
%% IngredientModule
    IngredientModule --> LoggerModule
    
%% MailManagerModule
    MailManagerModule --> LoggerModule
```

It is caused by two modules: `LoggerModule` and `JwtManagerModule`. Some references of `LoggerModule` are unnecessary. This module should be included in the last but one layer only.

When it comes to `JwtManagerModule` could be simplified. The use of guards and providing some user information could be enough.