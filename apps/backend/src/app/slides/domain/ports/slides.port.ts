import {
  CreateSlideType,
  CreateSlideResponseDto,
  SlideResponseDto,
  UpdateSlideType,
  UpdateSlideResponseDto,
} from '@presentation-builder-app/libs';

export interface ISlidesRepository {
  create(data: CreateSlideType): Promise<CreateSlideResponseDto>;
  findAllByProject(projectId: string): Promise<SlideResponseDto[]>;
  findOne(id: string): Promise<SlideResponseDto | null>;
  update(id: string, data: UpdateSlideType): Promise<UpdateSlideResponseDto>;
  remove(id: string): Promise<void>;
  reorder(projectId: string, slideIds: string[]): Promise<SlideResponseDto[]>;
  getNextOrder(projectId: string): Promise<number>;
}

export const SLIDES_REPOSITORY = Symbol('ISlidesRepository');
