import { IsUUID } from 'class-validator';

export class AssignTicketDto {
  @IsUUID('4', { message: 'ID technicien invalide' })
  technicianId: string;
}
