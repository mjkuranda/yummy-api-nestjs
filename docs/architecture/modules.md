The below graph presents current modular hierarchy:
```mermaid
graph TD

%% AppModule
    AppModule --> DishModule
    AppModule --> UserModule
    AppModule --> RecipeModule
    AppModule --> HealthcheckModule
    AppModule --> NotificationModule
    AppModule --> ImageModule

%% DishModule
    DishModule --> DishApplicationModule

%% DishApplicationModule
    DishApplicationModule --> TranslationModule
    DishApplicationModule --> DishWriteModule
    DishApplicationModule --> DishReadModule

%% DishWriteModule
    DishWriteModule --> ProviderRegistryModule

%% DishReadModule
    DishReadModule --> ProviderRegistryModule

%% ProviderRegistryModule
    ProviderRegistryModule --> InternalApiModule
    ProviderRegistryModule --> ExternalApiModule

%% InternalApiModule
    InternalApiModule --> ManageableApiModule
    InternalApiModule --> ProvidableApiModule

%% ExternalApiModule
    ExternalApiModule --> SpoonacularApiModule

%% IngredientModule

%% NotificationModule

%% ImageModule

%% RecipeModule
    RecipeModule --> RecipeApplicationModule

%% RecipeApplicationModule
    RecipeApplicationModule --> RecipeDomainModule

%% RecipeDomainModule
    RecipeDomainModule --> ProviderRegistryModule
    RecipeDomainModule --> TranslationModule

%% UserModule
    UserModule --> UserApplicationModule
    
%% UserApplicationModule
    UserApplicationModule --> UserDomainModule

%% MailManagerModule
```

The following modules are global and are not presented in the above graph:
- `LoggerModule`
- `JwtManagerModule`
- `CacheModule`
- `IngredientModule`
- `HttpModule`