import { CapabilityType } from './user.types';
import { IsNotEmpty, IsOptional, IsString, Length, Matches, MinLength } from 'class-validator';
import { PickType } from '@nestjs/mapped-types';
import { Transform } from 'class-transformer';

export class UserDto {
    readonly _id: string;
    readonly email: string;
    readonly login: string;
    readonly password: string;
    readonly isAdmin?: boolean;
    readonly capabilities?: Record<CapabilityType, boolean>;
}

// export class UserLoginDto {
//     readonly login: string;
//     readonly password: string;
// }

export class UserLoginDto {
    @IsString()
    @IsNotEmpty()
    readonly login: string;

    @IsString()
    @IsNotEmpty()
    readonly password: string;
}

export class UserLoginResultDto {
    @IsString()
    @IsNotEmpty()
    readonly accessToken: string;

    @IsString()
    @IsNotEmpty()
    readonly refreshToken: string;
}

export class CreateUserDto {
    @IsNotEmpty({ message: 'User should have a defined email' })
    @Matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g, { message: 'Email address has incorrect format' })
    @Length(6, 48)
    readonly email: string;

    @IsNotEmpty({ message: 'User should have a defined login' })
    @Length(4, 32)
    readonly login: string;

    @IsNotEmpty({ message: 'User should have a defined password' })
    @MinLength(8, { message: 'Password must have 8 or more characters long' })
    @Matches(/(?=.*[0-9])(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?`~])/, { message: 'Password must contain at least one number and one special character' })
    readonly password: string;

    @IsOptional()
    readonly salt: string;
}

export class UserNewPasswordDto extends PickType(CreateUserDto, ['password'] as const) {
    @Transform(({ value }) => value, { toClassOnly: true }) readonly newPassword: string;
}

export class UserTokens {
    readonly accessToken: string;
    readonly refreshToken: string;
}