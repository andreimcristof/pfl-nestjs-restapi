import { ForbiddenException, Injectable } from '@nestjs/common';
import { User, Bookmark } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

@Injectable({})
export class AuthService {
  /**
   *
   */
  constructor(private readonly prismaService: PrismaService) {}
  async signup(authDto: AuthDto) {
    // generate password hash
    const hash = await argon.hash(authDto.password);

    // save user in DB
    let user;
    try {
      user = await this.prismaService.user.create({
        data: {
          email: authDto.email,
          hash,
        },
        select: {
          id: true,
          email: true,
          createdAt: true,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002')
          throw new ForbiddenException('Credentials are invalid');
      }
      throw error;
    }

    // return the saved user
    return user;
  }

  signin() {
    return 'signed in';
  }
}
