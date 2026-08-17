import { Controller, Get, UseGuards, Res, Req } from '@nestjs/common';
import type { Response, Request } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'TECHNICIAN')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('stats')
  async getStats(@Req() req: Request) {
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    return this.reportsService.getStats(token);
  }

  @Get('pdf')
  async downloadPdf(@Req() req: Request, @Res() res: Response) {
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    const buffer = await this.reportsService.generatePdfReport(token);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=rapport-itsm.pdf',
    });
    res.send(buffer);
  }
}
