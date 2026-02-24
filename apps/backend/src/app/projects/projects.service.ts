import { Inject, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import {
  CreateProjectDto,
  CreateProjectResponseDto,
  ProjectResponseDto,
  UpdateProjectDto,
  UpdateProjectResponseDto,
} from '@presentation-builder-app/libs';
import {
  IProjectsRepository,
  PROJECTS_REPOSITORY,
} from './domain/ports/projects.port';

@Injectable()
export class ProjectsService {
  constructor(
    @Inject(PROJECTS_REPOSITORY)
    private readonly repository: IProjectsRepository,
  ) {}

  async create(dto: CreateProjectDto): Promise<CreateProjectResponseDto> {
    return this.repository.create({
      title: dto.title,
      description: dto.description,
      version: dto.version,
    });
  }

  async findAll(): Promise<ProjectResponseDto[]> {
    return this.repository.findAll();
  }

  async findOne(id: string): Promise<ProjectResponseDto> {
    const project = await this.repository.findOne(id);
    if (!project) {
      throw new HttpException('Project not found', HttpStatus.NOT_FOUND);
    }
    return project;
  }

  async findOneWithSlides(id: string): Promise<ProjectResponseDto> {
    const project = await this.repository.findOneWithSlides(id);
    if (!project) {
      throw new HttpException('Project not found', HttpStatus.NOT_FOUND);
    }
    return project;
  }

  async update(
    id: string,
    dto: UpdateProjectDto,
  ): Promise<UpdateProjectResponseDto> {
    return this.repository.update(id, {
      title: dto.title,
      description: dto.description,
      version: dto.version,
    });
  }

  async remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
