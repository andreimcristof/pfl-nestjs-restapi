import { Injectable } from '@nestjs/common';
import { User, Bookmark } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
@Injectable({})
export class AuthService {
  /**
   *
   */
  constructor(private readonly prismaService: PrismaService) {}
  signup() {
    return 'signed up';
  }

  signin() {
    return 'signed in';
  }
}
