import { IsString, IsUUID, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateNotificationDto {
  @IsUUID('4')
  userId: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsOptional()
  @IsUUID('4')
  relatedTicketId?: string;
}
