import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PROJECTS_REPOSITORY } from './domain/ports/projects.port';
import { ProjectsRepository } from './repositories/projects.repository';

@Module({
  imports: [PrismaModule],
  controllers: [ProjectsController],
  providers: [
    ProjectsService,
    {
      provide: PROJECTS_REPOSITORY,
      useClass: ProjectsRepository,
    },
  ],
  exports: [ProjectsService],
})
export class ProjectsModule {}
