import {
  CreateProjectType,
  CreateProjectResponseDto,
  ProjectResponseDto,
  UpdateProjectType,
  UpdateProjectResponseDto,
} from '@presentation-builder-app/libs';

export interface IProjectsRepository {
  create(data: CreateProjectType): Promise<CreateProjectResponseDto>;
  findAll(): Promise<ProjectResponseDto[]>;
  findOne(id: string): Promise<ProjectResponseDto | null>;
  findOneWithSlides(id: string): Promise<ProjectResponseDto | null>;
  update(
    id: string,
    data: UpdateProjectType,
  ): Promise<UpdateProjectResponseDto>;
  remove(id: string): Promise<{
    data: {
      message: string;
    };
  }>;
}

export const PROJECTS_REPOSITORY = Symbol('IProjectsRepository');
