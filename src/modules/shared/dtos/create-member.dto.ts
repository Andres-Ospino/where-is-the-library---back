import { IsString, IsNotEmpty, IsEmail, MaxLength, MinLength } from "class-validator"

export class CreateMemberDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email!: string

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(255)
  password!: string
}
