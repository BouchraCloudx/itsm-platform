import { Module } from '@nestjs/common';
import { RabbitmqService } from './rabbitmq.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  providers: [RabbitmqService],
})
export class RabbitmqModule {}
