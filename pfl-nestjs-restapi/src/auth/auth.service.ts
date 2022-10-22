import { ForbiddenException, Injectable } from '@nestjs/common';
import { User, Bookmark } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

enum AuthError {
  InvalidCredentials = 'Credentials are invalid',
}
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

  async signin(authDto: AuthDto) {
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
    return user;
  }
}
