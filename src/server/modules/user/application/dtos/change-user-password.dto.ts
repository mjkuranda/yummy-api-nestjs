import { IsNotEmpty, MinLength, Matches } from 'class-validator';

export class ChangeUserPasswordDto {
    @IsNotEmpty({ message: 'Old password is required' })
    readonly oldPassword: string;

    @IsNotEmpty({ message: 'New password is required' })
    @MinLength(8, { message: 'Password must have 8 or more characters long' })
    @Matches(/(?=.*[0-9])(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?`~])/, { message: 'Password must contain at least one number and one special character' })
    readonly newPassword: string;
}