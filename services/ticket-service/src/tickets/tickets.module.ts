import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { InternalTicketsController } from './internal-tickets.controller';

@Module({
  controllers: [TicketsController, InternalTicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}
