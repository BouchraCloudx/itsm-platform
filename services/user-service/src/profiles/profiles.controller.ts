import {
  Controller, Get, Post, Patch, Param, Body, UseGuards,
} from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AssignTeamDto } from './dto/assign-team.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('profiles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProfilesController {
  constructor(private profilesService: ProfilesService) {}

  @Post('me')
  createMyProfile(@Body() dto: CreateProfileDto, @CurrentUser() user: any) {
    return this.profilesService.createMyProfile(user.userId, dto);
  }

  @Get('me')
  getMyProfile(@CurrentUser() user: any) {
    return this.profilesService.getMyProfile(user.userId);
  }

  @Patch('me')
  updateMyProfile(@Body() dto: UpdateProfileDto, @CurrentUser() user: any) {
    return this.profilesService.updateMyProfile(user.userId, dto);
  }

  @Get()
  @Roles('ADMIN')
  findAll() {
    return this.profilesService.findAll();
  }

  @Patch(':id/team')
  @Roles('ADMIN')
  assignTeam(@Param('id') id: string, @Body() dto: AssignTeamDto) {
    return this.profilesService.assignTeam(id, dto);
  }
}
