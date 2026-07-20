import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AssignTeamDto } from './dto/assign-team.dto';

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

  async createMyProfile(authUserId: string, dto: CreateProfileDto) {
    const existing = await this.prisma.profile.findUnique({ where: { authUserId } });
    if (existing) {
      throw new ConflictException('Le profil existe déjà pour cet utilisateur');
    }

    return this.prisma.profile.create({
      data: {
        authUserId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
      },
    });
  }

  async getMyProfile(authUserId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { authUserId },
      include: { team: true },
    });

    if (!profile) {
      throw new NotFoundException('Profil introuvable, complétez-le d abord');
    }

    return profile;
  }

  async updateMyProfile(authUserId: string, dto: UpdateProfileDto) {
    await this.getMyProfile(authUserId);

    return this.prisma.profile.update({
      where: { authUserId },
      data: dto,
    });
  }

  async findAll() {
    return this.prisma.profile.findMany({ include: { team: true } });
  }

  async assignTeam(profileId: string, dto: AssignTeamDto) {
    const profile = await this.prisma.profile.findUnique({ where: { id: profileId } });
    if (!profile) {
      throw new NotFoundException('Profil introuvable');
    }

    return this.prisma.profile.update({
      where: { id: profileId },
      data: { teamId: dto.teamId },
    });
  }
}
