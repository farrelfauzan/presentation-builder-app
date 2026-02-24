import {
  CreateSlideDto,
  CreateSlideResponseDto,
  GetSlideDto,
  SlideResponseDto,
  UpdateSlideDto,
  UpdateSlideResponseDto,
} from '@presentation-builder-app/libs';

export interface ISlidesRepository {
  create(options: CreateSlideDto): Promise<CreateSlideResponseDto>;
  findAll(projectId: string): Promise<SlideResponseDto[]>;
  findOne(options: GetSlideDto): Promise<SlideResponseDto | null>;
  update(id: string, options: UpdateSlideDto): Promise<UpdateSlideResponseDto>;
  remove(id: string): Promise<void>;
  reorder(projectId: string, slideIds: string[]): Promise<void>;
}
