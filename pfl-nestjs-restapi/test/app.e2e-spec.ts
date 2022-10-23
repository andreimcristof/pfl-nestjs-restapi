import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { AuthDto } from '../src/auth/dto/auth.dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const testDto: AuthDto = {
      email: 'test@andreicristof.com',
      password: '1234',
    };

    describe('SignUp', () => {
      it('should sign up', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(testDto)
          .expectStatus(201);
      });

      describe('SignUp validation', () => {
        it('should throw exception if email empty', () => {
          return pactum
            .spec()
            .post('/auth/signup')
            .withBody({
              password: '1234',
            } as AuthDto)
            .expectStatus(400);
        });

        it('should throw exception if password empty', () => {
          return pactum
            .spec()
            .post('/auth/signup')
            .withBody({
              email: 'test@andreicristof.com',
            } as AuthDto)
            .expectStatus(400);
        });

        it('should throw exception if no body provided', () => {
          return pactum.spec().post('/auth/signup').expectStatus(400);
        });
      });
    });

    describe('SignIn', () => {
      it('should sign in', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(testDto)
          .expectStatus(200);
      });

      describe('SignIn validation', () => {
        it('should throw exception if email empty', () => {
          return pactum
            .spec()
            .post('/auth/signin')
            .withBody({
              password: '1234',
            } as AuthDto)
            .expectStatus(400);
        });

        it('should throw exception if password empty', () => {
          return pactum
            .spec()
            .post('/auth/signin')
            .withBody({
              email: 'test@andreicristof.com',
            } as AuthDto)
            .expectStatus(400);
        });

        it('should throw exception if no body provided', () => {
          return pactum.spec().post('/auth/signin').expectStatus(400);
        });
      });
    });
  });
  describe('User', () => {
    describe('Get My User', () => {});

    describe('Edit User', () => {});
  });
  describe('Bookmarks', () => {
    describe('Create Bookmark', () => {});

    describe('Get Bookmarks', () => {});

    describe('Get Bookmark By Id', () => {});

    describe('Edit Bookmark', () => {});

    describe('Delete Bookmark', () => {});
  });
});
