import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { AssignTicketDto } from './dto/assign-ticket.dto';
import { AddCommentDto } from './dto/add-comment.dto';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTicketDto, userId: string) {
    return this.prisma.ticket.create({
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        category: dto.category,
        createdBy: userId,
      },
    });
  }

  async findAll(userId: string, role: string) {
    // USER ne voit que ses propres tickets, TECHNICIAN/ADMIN voient tout
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

    // Calcul automatique du temps de résolution
    if (dto.status === 'RESOLVED' || dto.status === 'CLOSED') {
      const resolutionMinutes = Math.round(
        (Date.now() - ticket.createdAt.getTime()) / 60000,
      );
      data.resolutionTimeMinutes = resolutionMinutes;
    }

    return this.prisma.ticket.update({ where: { id }, data });
  }

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

  private async findTicketOrThrow(id: string) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id } });
    if (!ticket) {
      throw new NotFoundException('Ticket introuvable');
    }
    return ticket;
  }
}
