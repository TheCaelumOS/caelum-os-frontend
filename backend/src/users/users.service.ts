import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePreferencesDto } from './dto/users.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getPreferences(userId: string) {
    const preferences = await this.prisma.userPreference.findUnique({
      where: { userId },
    });

    if (!preferences) {
      throw new NotFoundException('User preferences could not be located');
    }

    return preferences;
  }

  async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    const preferences = await this.prisma.userPreference.findUnique({
      where: { userId },
    });

    if (!preferences) {
      // Create if it somehow doesn't exist yet
      return this.prisma.userPreference.create({
        data: {
          userId,
          theme: dto.theme || 'dark',
          wallpaper: dto.wallpaper || null,
          volume: dto.volume !== undefined ? dto.volume : 80,
          brightness: dto.brightness !== undefined ? dto.brightness : 90,
        },
      });
    }

    return this.prisma.userPreference.update({
      where: { userId },
      data: {
        theme: dto.theme !== undefined ? dto.theme : preferences.theme,
        wallpaper: dto.wallpaper !== undefined ? dto.wallpaper : preferences.wallpaper,
        volume: dto.volume !== undefined ? dto.volume : preferences.volume,
        brightness: dto.brightness !== undefined ? dto.brightness : preferences.brightness,
      },
    });
  }
}
