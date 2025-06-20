import { Provider } from '@nestjs/common';
import {
    AuthenticationService,
    PasswordManagerService,
    PermissionManagementService,
    ProfileManagementService, UserActivationService, UserManagementService
} from './services';

export const userDomainProviders: Provider[] = [
    AuthenticationService,
    PasswordManagerService,
    PermissionManagementService,
    ProfileManagementService,
    UserActivationService,
    UserManagementService
];