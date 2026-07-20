import { IsString, IsEnum, IsNotEmpty, MinLength } from 'class-validator';

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export class CreateTicketDto {
  @IsString()
  @MinLength(5, { message: 'Le titre doit faire au moins 5 caractères' })
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(TicketPriority, { message: 'Priorité invalide' })
  priority: TicketPriority;

  @IsString()
  @IsNotEmpty()
  category: string;
}
