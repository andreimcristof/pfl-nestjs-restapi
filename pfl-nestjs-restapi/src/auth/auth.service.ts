import { Injectable } from '@nestjs/common';

@Injectable({})
export class AuthService {
  signup() {
    return 'signed up';
  }

  signin() {
    return 'signed in';
  }
}
