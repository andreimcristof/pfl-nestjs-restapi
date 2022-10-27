import { Injectable, ForbiddenException } from '@nestjs/common';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';

enum BookmarkErrors {
  AccessToResourcesDenied = 'Access To Resources Denied',
}

@Injectable()
export class BookmarkService {
  constructor(private readonly prismaService: PrismaService) {}

  async createBookmark(userId: number, dto: CreateBookmarkDto) {
    const bookmark = await this.prismaService.bookmark.create({
      data: {
        userId,
        ...dto,
      },
    });
    return bookmark;
  }

  getBookmarks(userId: number) {
    return this.prismaService.bookmark.findMany({ where: { userId } });
  }

  getBookmarkById(userId: number, bookmarkId: number) {
    return this.prismaService.bookmark.findFirst({
      where: { userId, id: bookmarkId },
    });
  }

  async editBookmarkById(
    userId: number,
    bookmarkId: number,
    dto: EditBookmarkDto,
  ) {
    //get bookmark by id
    const foundBookmark = await this.prismaService.bookmark.findUnique({
      where: { id: bookmarkId },
    });
    // check if user really owns the bookmark
    if (!foundBookmark || foundBookmark.userId !== userId)
      throw new ForbiddenException(BookmarkErrors.AccessToResourcesDenied);
    // edit the bookmark

    return this.prismaService.bookmark.update({
      where: { id: bookmarkId },
      data: { ...dto },
    });
  }

  async deleteBookmarkById(userId: number, bookmarkId: number) {
    //get bookmark by id
    const foundBookmark = await this.prismaService.bookmark.findUnique({
      where: { id: bookmarkId },
    });
    // check if user really owns the bookmark
    if (!foundBookmark || foundBookmark.userId !== userId)
      throw new ForbiddenException(BookmarkErrors.AccessToResourcesDenied);

    // delete the bookmark
    await this.prismaService.bookmark.delete({ where: { id: bookmarkId } });
  }
}
