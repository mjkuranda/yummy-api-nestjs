import { Provider } from '@nestjs/common';
import {
    ActivateUserByIdUseCase,
    ActivateUserUseCase,
    ChangePasswordUseCase,
    CreateUserUseCase,
    DenyPermissionUseCase,
    GetAllUsersUseCase,
    GetNotActivatedUsersUseCase,
    GetUserProfileUseCase,
    GrantPermissionUseCase, LoginUserUseCase, LogoutUserUseCase, RefreshTokensUseCase
} from './use-cases';

export const userApplicationProviders: Provider[] = [
    ActivateUserUseCase,
    ActivateUserByIdUseCase,
    ChangePasswordUseCase,
    CreateUserUseCase,
    DenyPermissionUseCase,
    GetAllUsersUseCase,
    GetNotActivatedUsersUseCase,
    GetUserProfileUseCase,
    GrantPermissionUseCase,
    LoginUserUseCase,
    LogoutUserUseCase,
    RefreshTokensUseCase
];