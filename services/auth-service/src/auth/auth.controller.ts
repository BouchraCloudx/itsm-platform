import { Controller, Post, Get, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // Endpoint protégé : utilisé par le frontend (dropdown de réassignation)
  @Get('technicians')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'TECHNICIAN')
  findTechnicians() {
    return this.authService.findTechnicians();
  }

  // Endpoint interne : utilisé par le Ticket Service pour l'affectation automatique.
  // Non protégé par JWT car appelé service-à-service (pas par un utilisateur final).
  // À sécuriser en Phase 10 via Network Policy Kubernetes.
  @Get('internal/technicians')
  findTechniciansInternal() {
    return this.authService.findTechnicians();
  }
}
