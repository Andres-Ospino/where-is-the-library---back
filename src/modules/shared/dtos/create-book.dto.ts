import { IsString, IsNotEmpty, MaxLength } from "class-validator"

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  author: string
}
