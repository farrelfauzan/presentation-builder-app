import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { IProjectsRepository } from '../domain/ports/projects.port';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateProjectResponseDto,
  CreateProjectType,
  ProjectResponseDto,
  UpdateProjectResponseDto,
  UpdateProjectType,
} from '@presentation-builder-app/libs';
import { Project } from '../../prisma/generated/client';

@Injectable()
export class ProjectsRepository implements IProjectsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateProjectType): Promise<CreateProjectResponseDto> {
    const project = await this.prisma.project.create({
      data: {
        title: data.title,
        description: data.description,
        version: data.version,
      },
    });

    return project as unknown as CreateProjectResponseDto;
  }

  async findAll(): Promise<ProjectResponseDto[]> {
    const projects = await this.prisma.findManyActive<Project>(
      this.prisma.project,
      {
        orderBy: { createdAt: 'desc' },
      },
    );

    return projects as unknown as ProjectResponseDto[];
  }

  async findOne(id: string): Promise<ProjectResponseDto | null> {
    const project = await this.prisma.findFirstActive<Project>(
      this.prisma.project,
      {
        where: { id },
      },
    );

    if (!project) {
      return null;
    }

    return project as unknown as ProjectResponseDto;
  }

  async findOneWithSlides(id: string): Promise<ProjectResponseDto | null> {
    const project = await this.prisma.findFirstActive<Project>(
      this.prisma.project,
      {
        where: { id },
        include: {
          slides: {
            where: { deletedAt: null },
            orderBy: { order: 'asc' },
          },
        },
      },
    );

    if (!project) {
      return null;
    }

    return project as unknown as ProjectResponseDto;
  }

  async update(
    id: string,
    data: UpdateProjectType,
  ): Promise<UpdateProjectResponseDto> {
    const existingProject = await this.prisma.findFirstActive<Project>(
      this.prisma.project,
      {
        where: { id },
      },
    );

    if (!existingProject) {
      throw new HttpException('Project not found', HttpStatus.NOT_FOUND);
    }

    const updatedProject = await this.prisma.project.update({
      where: { id },
      data: {
        title: data.title ?? existingProject.title,
        description: data.description ?? existingProject.description,
        version: data.version ?? existingProject.version,
      },
    });

    return updatedProject as unknown as UpdateProjectResponseDto;
  }

  async remove(id: string): Promise<{
    data: { message: string };
  }> {
    const existingProject = await this.prisma.findFirstActive<Project>(
      this.prisma.project,
      {
        where: { id },
      },
    );

    if (!existingProject) {
      throw new HttpException('Project not found', HttpStatus.NOT_FOUND);
    }

    // Soft delete the project
    await this.prisma.softDelete<Project>(this.prisma.project, { id });

    // Soft delete all slides belonging to this project
    await this.prisma.slide.updateMany({
      where: { projectId: id, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    return {
      data: {
        message: 'Project deleted successfully',
      },
    };
  }
}
