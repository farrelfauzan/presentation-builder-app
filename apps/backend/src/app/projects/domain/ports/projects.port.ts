import {
  CreateProjectDto,
  CreateProjectResponseDto,
  GetProjectDto,
  ProjectResponseDto,
  UpdateProjectDto,
  UpdateProjectResponseDto,
} from '@presentation-builder-app/libs';

export interface IProjectsRepository {
  create(options: CreateProjectDto): Promise<CreateProjectResponseDto>;
  findAll(): Promise<ProjectResponseDto[]>;
  findOne(options: GetProjectDto): Promise<ProjectResponseDto | null>;
  update(
    id: string,
    options: UpdateProjectDto,
  ): Promise<UpdateProjectResponseDto>;
  remove(id: string): Promise<void>;
}
