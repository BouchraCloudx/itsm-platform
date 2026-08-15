import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    throw new HttpException('Simulated failure for rollback test', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
