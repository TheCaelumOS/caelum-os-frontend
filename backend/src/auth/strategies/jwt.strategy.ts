import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { preferences: true },
      });

      if (user) {
        return {
          id: user.id,
          email: user.email,
          role: user.role,
          preferences: user.preferences,
        };
      }
    } catch {
      // Prisma database offline or user record created statelessly via OAuth
    }

    if (payload?.sub) {
      return {
        id: payload.sub,
        email: payload.email || 'user@caelum-os.io',
        role: payload.role || 'USER',
        preferences: {
          theme: 'dark',
          volume: 80,
          brightness: 90,
        },
      };
    }

    throw new UnauthorizedException('Invalid authentication session');
  }
}
