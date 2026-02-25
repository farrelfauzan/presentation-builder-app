import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ISlidesRepository } from '../domain/ports/slides.port';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateSlideResponseDto,
  CreateSlideType,
  SlideResponseDto,
  UpdateSlideResponseDto,
  UpdateSlideType,
} from '@presentation-builder-app/libs';
import { Slide } from '../../prisma/generated/client';

@Injectable()
export class SlidesRepository implements ISlidesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateSlideType): Promise<CreateSlideResponseDto> {
    // Verify project exists
    const project = await this.prisma.findFirstActive(this.prisma.project, {
      where: { id: data.projectId },
    });

    if (!project) {
      throw new HttpException('Project not found', HttpStatus.NOT_FOUND);
    }

    const slide = await this.prisma.slide.create({
      data: {
        projectId: data.projectId,
        order: data.order,
        textContent: data.textContent,
        mediaUrl: data.mediaUrl,
        mediaType: data.mediaType,
      },
    });

    return slide as unknown as CreateSlideResponseDto;
  }

  async findAllByProject(projectId: string): Promise<SlideResponseDto[]> {
    const slides = await this.prisma.findManyActive<Slide>(this.prisma.slide, {
      where: { projectId },
      orderBy: { order: 'asc' },
    });

    return slides as unknown as SlideResponseDto[];
  }

  async findOne(id: string): Promise<SlideResponseDto | null> {
    const slide = await this.prisma.findFirstActive<Slide>(this.prisma.slide, {
      where: { id },
    });

    if (!slide) {
      return null;
    }

    return slide as unknown as SlideResponseDto;
  }

  async update(
    id: string,
    data: UpdateSlideType,
  ): Promise<UpdateSlideResponseDto> {
    const existingSlide = await this.prisma.findFirstActive<Slide>(
      this.prisma.slide,
      {
        where: { id },
      },
    );

    if (!existingSlide) {
      throw new HttpException('Slide not found', HttpStatus.NOT_FOUND);
    }

    const updatedSlide = await this.prisma.slide.update({
      where: { id },
      data: {
        order: data.order ?? existingSlide.order,
        textContent: data.textContent ?? existingSlide.textContent,
        mediaUrl:
          data.mediaUrl !== undefined ? data.mediaUrl : existingSlide.mediaUrl,
        mediaType:
          data.mediaType !== undefined
            ? data.mediaType
            : existingSlide.mediaType,
      },
    });

    return updatedSlide as unknown as UpdateSlideResponseDto;
  }

  // Soft delete by setting deletedAt timestamp
  async remove(id: string): Promise<{
    data: {
      message: string;
    };
  }> {
    const existingSlide = await this.prisma.findFirstActive<Slide>(
      this.prisma.slide,
      {
        where: { id },
      },
    );

    if (!existingSlide) {
      throw new HttpException('Slide not found', HttpStatus.NOT_FOUND);
    }

    // Soft delete the slide
    await this.prisma.softDelete<Slide>(this.prisma.slide, { id });

    return {
      data: {
        message: 'Slide deleted successfully',
      },
    };
  }

  async reorder(
    projectId: string,
    slideIds: string[],
  ): Promise<SlideResponseDto[]> {
    // Verify project exists
    const project = await this.prisma.findFirstActive(this.prisma.project, {
      where: { id: projectId },
    });

    if (!project) {
      throw new HttpException('Project not found', HttpStatus.NOT_FOUND);
    }

    // Verify all slides exist and belong to the project
    const existingSlides = await this.prisma.findManyActive<Slide>(
      this.prisma.slide,
      {
        where: {
          id: { in: slideIds },
          projectId,
        },
      },
    );

    if (existingSlides.length !== slideIds.length) {
      throw new HttpException(
        'Some slides not found or do not belong to this project',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Update order for each slide in a transaction
    await this.prisma.$transaction(
      slideIds.map((slideId, index) =>
        this.prisma.slide.update({
          where: { id: slideId },
          data: { order: index },
        }),
      ),
    );

    // Return reordered slides
    return this.findAllByProject(projectId);
  }

  async getNextOrder(projectId: string): Promise<number> {
    const lastSlide = await this.prisma.findFirstActive<Slide>(
      this.prisma.slide,
      {
        where: { projectId },
        orderBy: { order: 'desc' },
      },
    );

    return lastSlide ? lastSlide.order + 1 : 0;
  }
}
