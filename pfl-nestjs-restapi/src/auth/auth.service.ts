import { ForbiddenException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CustomLoggerService } from '../shared/logging/logging.service';

enum AuthError {
  InvalidCredentials = 'Credentials are invalid',
}
@Injectable({})
export class AuthService {
  /**
   *
   */
  constructor(
    private loggerService: CustomLoggerService,
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signup(authDto: AuthDto): Promise<{ access_token: string }> {
    // generate password hash
    const hash = await argon.hash(authDto.password);

    // save user in DB
    try {
      const user = await this.prismaService.user.create({
        data: {
          email: authDto.email,
          hash,
        },
      });

      return this.signToken(user.id, user.email);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          this.loggerService.error(error);
          throw new ForbiddenException(AuthError.InvalidCredentials);
        }
      }
      this.loggerService.error(error);
      throw error;
    }
  }

  async signin(authDto: AuthDto): Promise<{ access_token: string }> {
    // find user by email
    const user = await this.prismaService.user.findUnique({
      where: {
        email: authDto.email,
      },
    });
    // if user does not exist, throw exception
    if (!user) throw new ForbiddenException(AuthError.InvalidCredentials);

    // compare passwords, if invalid then throw exception
    const isMatch = await argon.verify(user.hash, authDto.password);
    if (!isMatch) throw new ForbiddenException(AuthError.InvalidCredentials);

    return this.signToken(user.id, user.email);
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };

    const secret = this.configService.get('JWT_SECRET');
    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: '60m',
      secret,
    });

    return {
      access_token,
    };
  }
}
