import { IsString, IsNotEmpty, IsEmail, MaxLength } from "class-validator"

export class CreateMemberDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email!: string
}
