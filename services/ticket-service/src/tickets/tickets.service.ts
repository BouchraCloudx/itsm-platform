import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { AssignTicketDto } from './dto/assign-ticket.dto';
import { AddCommentDto } from './dto/add-comment.dto';

@Injectable()
export class TicketsService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async create(dto: CreateTicketDto, userId: string) {
    const ticket = await this.prisma.ticket.create({
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        category: dto.category,
        createdBy: userId,
      },
    });

    await this.autoAssign(ticket.id);
    await this.notifyUser(userId, 'TICKET_CREATED', `Votre ticket "${ticket.title}" a été créé`, ticket.id);

    return this.prisma.ticket.findUnique({ where: { id: ticket.id } });
  }

  async findAll(userId: string, role: string) {
    if (role === 'USER') {
      return this.prisma.ticket.findMany({
        where: { createdBy: userId },
        orderBy: { createdAt: 'desc' },
        include: { comments: true, attachments: true },
      });
    }

    return this.prisma.ticket.findMany({
      orderBy: { createdAt: 'desc' },
      include: { comments: true, attachments: true },
    });
  }

  async findOne(id: string, userId: string, role: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: { comments: true, attachments: true },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket introuvable');
    }

    if (role === 'USER' && ticket.createdBy !== userId) {
      throw new ForbiddenException('Accès refusé à ce ticket');
    }

    return ticket;
  }

  async updateStatus(id: string, dto: UpdateTicketStatusDto) {
    const ticket = await this.findTicketOrThrow(id);

    const data: any = { status: dto.status };

    if (dto.status === 'RESOLVED' || dto.status === 'CLOSED') {
      const resolutionMinutes = Math.round(
        (Date.now() - ticket.createdAt.getTime()) / 60000,
      );
      data.resolutionTimeMinutes = resolutionMinutes;
    }

    return this.prisma.ticket.update({ where: { id }, data });
  }

  // Réassignation MANUELLE (déclenchée par un Admin/Technicien depuis le frontend)
  async assign(id: string, dto: AssignTicketDto) {
    await this.findTicketOrThrow(id);

    return this.prisma.ticket.update({
      where: { id },
      data: { assignedTo: dto.technicianId, status: 'IN_PROGRESS' },
    });
  }

  async addComment(ticketId: string, dto: AddCommentDto, authorId: string) {
    await this.findTicketOrThrow(ticketId);

    return this.prisma.comment.create({
      data: {
        ticketId,
        authorId,
        content: dto.content,
      },
    });
  }

  // Affectation AUTOMATIQUE (déclenchée à la création d'un ticket)
  // Stratégie : on choisit le technicien ayant le moins de tickets OPEN/IN_PROGRESS en cours.
  private async autoAssign(ticketId: string) {
    try {
      const authUrl = this.configService.get<string>('AUTH_SERVICE_URL');
      const { data: technicians } = await axios.get<{ id: string; email: string }[]>(
        `${authUrl}/auth/internal/technicians`,
      );

      if (!technicians || technicians.length === 0) {
        console.warn('Aucun technicien disponible pour l affectation automatique');
        return;
      }

      const workloads = await Promise.all(
        technicians.map(async (tech) => {
          const count = await this.prisma.ticket.count({
            where: {
              assignedTo: tech.id,
              status: { in: ['OPEN', 'IN_PROGRESS'] },
            },
          });
          return { technicianId: tech.id, count };
        }),
      );

      const leastLoaded = workloads.reduce((min, current) =>
        current.count < min.count ? current : min,
      );

      await this.prisma.ticket.update({
        where: { id: ticketId },
        data: { assignedTo: leastLoaded.technicianId },
      });
    } catch (error) {
      // Comme pour les notifications : l'auto-affectation ne doit jamais bloquer la création du ticket
      console.error('Échec de l affectation automatique:', error.message);
    }
  }

  private async notifyUser(userId: string, type: string, message: string, relatedTicketId: string) {
    try {
      const notificationUrl = this.configService.get<string>('NOTIFICATION_SERVICE_URL');
      await axios.post(`${notificationUrl}/notifications`, {
        userId,
        type,
        message,
        relatedTicketId,
      });
    } catch (error) {
      console.error('Échec de l envoi de la notification:', error.message);
    }
  }

  private async findTicketOrThrow(id: string) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id } });
    if (!ticket) {
      throw new NotFoundException('Ticket introuvable');
    }
    return ticket;
  }
}
