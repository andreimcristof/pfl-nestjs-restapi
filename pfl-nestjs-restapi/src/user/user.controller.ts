import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { GetUser } from 'src/auth/decorator';

import { JwtGuard } from 'src/auth/guard';
import { User } from '@prisma/client';

@Controller('users')
export class UserController {
  @UseGuards(JwtGuard)
  @Get('me')
  getMe(@GetUser() user: User) {
    return user;
  }
}
