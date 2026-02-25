import { Inject, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import {
  CreateSlideDto,
  CreateSlideResponseDto,
  SlideResponseDto,
  UpdateSlideDto,
  UpdateSlideResponseDto,
} from '@presentation-builder-app/libs';
import {
  ISlidesRepository,
  SLIDES_REPOSITORY,
} from './domain/ports/slides.port';

@Injectable()
export class SlidesService {
  constructor(
    @Inject(SLIDES_REPOSITORY)
    private readonly repository: ISlidesRepository,
  ) {}

  async create(
    projectId: string,
    dto: CreateSlideDto,
  ): Promise<CreateSlideResponseDto> {
    // Auto-calculate order if not provided
    const order = dto.order ?? (await this.repository.getNextOrder(projectId));

    return this.repository.create({
      projectId,
      order,
      textContent: dto.textContent,
      mediaUrl: dto.mediaUrl,
      mediaType: dto.mediaType,
    });
  }

  async findAllByProject(projectId: string): Promise<SlideResponseDto[]> {
    return this.repository.findAllByProject(projectId);
  }

  async findOne(id: string): Promise<SlideResponseDto> {
    const slide = await this.repository.findOne(id);
    if (!slide) {
      throw new HttpException('Slide not found', HttpStatus.NOT_FOUND);
    }
    return slide;
  }

  async update(
    id: string,
    dto: UpdateSlideDto,
  ): Promise<UpdateSlideResponseDto> {
    return this.repository.update(id, {
      order: dto.order,
      textContent: dto.textContent,
      mediaUrl: dto.mediaUrl,
      mediaType: dto.mediaType,
    });
  }

  async remove(id: string): Promise<{
    data: {
      message: string;
    };
  }> {
    return this.repository.remove(id);
  }

  async reorder(
    projectId: string,
    slideIds: string[],
  ): Promise<SlideResponseDto[]> {
    return this.repository.reorder(projectId, slideIds);
  }
}
