import {
  Controller, Post, Get, Param, UploadedFile, UseInterceptors, UseGuards, Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('ticketId') ticketId: string,
    @CurrentUser() user: any,
  ) {
    return this.filesService.uploadFile(file, ticketId, user.userId);
  }

  @Get('download/*key')
  async getDownloadUrl(@Param('key') key: string) {
    const url = await this.filesService.getDownloadUrl(key);
    return { url };
  }
}
