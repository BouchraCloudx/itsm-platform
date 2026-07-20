import {
  Controller, Get, Post, Patch, Param, Body, UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  // Endpoint interne : appelé par les autres microservices (pas de guard JWT ici,
  // car ce n'est pas un utilisateur final mais un autre service qui l'appelle).
  // À sécuriser en Phase 10 avec une Network Policy ou une clé interne.
  @Post()
  create(@Body() dto: CreateNotificationDto) {
    return this.notificationsService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findMine(@CurrentUser() user: any) {
    return this.notificationsService.findMine(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('unread-count')
  unreadCount(@CurrentUser() user: any) {
    return this.notificationsService.unreadCount(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @CurrentUser() user: any) {
    return this.notificationsService.markAsRead(id, user.userId);
  }
}
