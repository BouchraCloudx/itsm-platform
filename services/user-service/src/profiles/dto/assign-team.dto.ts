import { IsUUID } from 'class-validator';

export class AssignTeamDto {
  @IsUUID('4')
  teamId: string;
}
