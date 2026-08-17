import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';

interface Ticket {
  id: string;
  status: string;
  priority: string;
  category: string;
  createdAt: string;
  resolutionTimeMinutes: number | null;
}

@Injectable()
export class ReportsService {
  constructor(private configService: ConfigService) {}

  private async fetchTickets(token: string): Promise<Ticket[]> {
    const ticketServiceUrl = this.configService.getOrThrow<string>('TICKET_SERVICE_URL');
    const { data } = await axios.get(`${ticketServiceUrl}/tickets`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  }

  async getStats(token: string) {
    const tickets = await this.fetchTickets(token);

    const byStatus = this.countBy(tickets, 'status');
    const byPriority = this.countBy(tickets, 'priority');
    const byCategory = this.countBy(tickets, 'category');

    const resolved = tickets.filter((t) => t.resolutionTimeMinutes !== null);
    const avgResolutionMinutes = resolved.length
      ? Math.round(resolved.reduce((sum, t) => sum + (t.resolutionTimeMinutes || 0), 0) / resolved.length)
      : 0;

    return {
      total: tickets.length,
      byStatus,
      byPriority,
      byCategory,
      avgResolutionMinutes,
    };
  }

  async generatePdfReport(token: string): Promise<Buffer> {
    const stats = await this.getStats(token);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const stream = new PassThrough();
      const chunks: Buffer[] = [];

      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
      doc.pipe(stream);

      doc.fontSize(20).text('Rapport ITSM - Statistiques des tickets', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).fillColor('gray').text(`Généré le ${new Date().toLocaleString('fr-FR')}`, { align: 'center' });
      doc.moveDown(2);

      doc.fillColor('black').fontSize(14).text('Vue d ensemble');
      doc.fontSize(11).text(`Total des tickets : ${stats.total}`);
      doc.text(`Temps de résolution moyen : ${stats.avgResolutionMinutes} minutes`);
      doc.moveDown();

      doc.fontSize(14).text('Répartition par statut');
      Object.entries(stats.byStatus).forEach(([key, value]) => {
        doc.fontSize(11).text(`  ${key} : ${value}`);
      });
      doc.moveDown();

      doc.fontSize(14).text('Répartition par priorité');
      Object.entries(stats.byPriority).forEach(([key, value]) => {
        doc.fontSize(11).text(`  ${key} : ${value}`);
      });
      doc.moveDown();

      doc.fontSize(14).text('Répartition par catégorie');
      Object.entries(stats.byCategory).forEach(([key, value]) => {
        doc.fontSize(11).text(`  ${key} : ${value}`);
      });

      doc.end();
    });
  }

  private countBy(tickets: Ticket[], key: keyof Ticket): Record<string, number> {
    return tickets.reduce((acc, ticket) => {
      const value = String(ticket[key]);
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}
