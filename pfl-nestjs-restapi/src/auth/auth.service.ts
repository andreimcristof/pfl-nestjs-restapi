import { ForbiddenException, Injectable } from '@nestjs/common';
import { User, Bookmark } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

enum AuthError {
  InvalidCredentials = 'Credentials are invalid',
}
@Injectable({})
export class AuthService {
  /**
   *
   */
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signup(authDto: AuthDto): Promise<User> {
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

      // return the saved user
      delete user.hash;
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002')
          throw new ForbiddenException(AuthError.InvalidCredentials);
      }
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

    // if all is well return trimmed user (without hash information)
    delete user.hash;
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
      expiresIn: '15m',
      secret,
    });

    return {
      access_token,
    };
  }
}
