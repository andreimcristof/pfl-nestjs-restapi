import { Injectable } from '@nestjs/common';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookmarkService {
  constructor(private readonly prismaService: PrismaService) {}

  createBookmark(userId: number, dto: CreateBookmarkDto) {}

  getBookmarks(userId: number) {
    return this.prismaService.bookmark.findMany({ where: { userId } });
  }

  getBookmarkById(userId: number, bookmarkId: number) {}

  editBookmarkById(userId: number, bookmarkId: number, dto: EditBookmarkDto) {}

  deleteBookmarkById(userId: number, bookmarkId: number) {}
}
