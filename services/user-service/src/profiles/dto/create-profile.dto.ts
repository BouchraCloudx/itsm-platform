import { IsString, IsOptional, MinLength } from 'class-validator';

export class CreateProfileDto {
  @IsString()
  @MinLength(2)
  firstName: string;

  @IsString()
  @MinLength(2)
  lastName: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
