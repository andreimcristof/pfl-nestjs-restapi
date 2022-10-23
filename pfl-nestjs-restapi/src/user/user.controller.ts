import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { GetUser } from '../auth/decorator';

import { JwtGuard } from '../auth/guard';
import { User } from '@prisma/client';
import { UserService } from './user.service';
import { EditUserDto } from './dto';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  /**
   *
   */
  constructor(private readonly userService: UserService) {}
  @Get('me')
  getMe(@GetUser() user: User) {
    return user;
  }

  @Patch()
  editUser(@GetUser() user: User, @Body() dto: EditUserDto) {
    console.log('userid in controller', user.id);
    return this.userService.editUser(user.id, dto);
  }
}
