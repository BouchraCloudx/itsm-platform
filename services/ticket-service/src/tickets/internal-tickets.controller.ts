import { Controller, Post, Param, Body } from '@nestjs/common';
import { TicketsService } from './tickets.service';

// Controller séparé, volontairement SANS @UseGuards() de classe.
// Ces routes sont appelées service-à-service (ex: File Service), pas par un utilisateur final.
// À sécuriser en Phase 10 via Network Policy Kubernetes plutôt qu'un JWT.
@Controller('tickets')
export class InternalTicketsController {
  constructor(private ticketsService: TicketsService) {}

  @Post(':id/attachments/internal')
  addAttachment(
    @Param('id') id: string,
    @Body() body: { fileUrl: string; fileName: string; uploadedBy: string },
  ) {
    return this.ticketsService.addAttachment(id, body.fileUrl, body.fileName, body.uploadedBy);
  }
}
