import { IsNotEmpty, Length, Matches, MinLength } from 'class-validator';

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
}