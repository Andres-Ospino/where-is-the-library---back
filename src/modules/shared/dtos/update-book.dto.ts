import { IsString, IsNotEmpty, MaxLength } from "class-validator"

export class UpdateBookDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  author: string
}
