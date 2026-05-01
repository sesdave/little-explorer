import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email!: string; // 👈 Add the '!' here

  @IsString()
  password!: string; // 👈 Add the '!' here
}