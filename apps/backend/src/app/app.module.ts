import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GlobalSettingsModule } from './global-settings/global-settings.module';
import { ProjectsModule } from './projects/projects.module';
import { SlidesModule } from './slides/slides.module';
import { PrismaController } from './prisma/prisma.controller';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [GlobalSettingsModule, ProjectsModule, SlidesModule, PrismaModule],
  controllers: [AppController, PrismaController],
  providers: [AppService],
})
export class AppModule {}
