import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import {
  INestApplication,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { AuthDto } from '../src/auth/dto/auth.dto';
import { EditUserDto } from '../src/user/dto/edit-user.dto';
import { CreateBookmarkDto } from '../src/bookmark/dto/create-bookmark.dto';
import { EditBookmarkDto } from '../src/bookmark/dto/edit-bookmark.dto';

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
          .stores('access_token', 'access_token')
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
    describe('Get My User', () => {
      it('should get current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders('Authorization', 'Bearer $S{access_token}')
          .expectStatus(200);
      });
    });

    describe('Edit User', () => {
      it('should edit user', () => {
        const dto: EditUserDto = {
          firstName: 'Andrei',
          email: 'test@andreicristof.com',
        };
        return pactum
          .spec()
          .patch('/users')
          .withHeaders('Authorization', 'Bearer $S{access_token}')
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.email);
      });
    });
  });
  describe('Bookmarks', () => {
    describe('Get empty bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders('Authorization', 'Bearer $S{access_token}')
          .expectStatus(200)
          .expectBody([]);
      });
    });

    describe('Create bookmark', () => {
      const dto: CreateBookmarkDto = {
        title: 'first bookmark',
        link: 'google.com',
      };
      it('should create bookmark', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders('Authorization', 'Bearer $S{access_token}')
          .withBody(dto)
          .expectStatus(201)
          .expectJson('title', dto.title)
          .stores('bookmarkId', 'id');
      });
    });

    describe('Get bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders('Authorization', 'Bearer $S{access_token}')
          .expectStatus(HttpStatus.OK)
          .expectJsonLength(1);
      });
    });

    describe('Get bookmark by id', () => {
      it('should get bookmark by id', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders('Authorization', 'Bearer $S{access_token}')
          .expectStatus(HttpStatus.OK)
          .expectBodyContains('$S{bookmarkId}');
      });
    });

    describe('Edit bookmark by id', () => {
      const dto: EditBookmarkDto = {
        title: 'New Title',
        description: 'New Description',
      };
      it('should edit bookmark by id', () => {
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders('Authorization', 'Bearer $S{access_token}')
          .withBody(dto)
          .expectStatus(HttpStatus.OK)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.description);
      });
    });

    describe('Delete Bookmark', () => {
      it('should delete bookmark by id', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders('Authorization', 'Bearer $S{access_token}')
          .expectStatus(HttpStatus.NO_CONTENT);
      });

      it('should find no more bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders('Authorization', 'Bearer $S{access_token}')
          .expectStatus(200)
          .expectBody([]);
      });
    });
  });
});
