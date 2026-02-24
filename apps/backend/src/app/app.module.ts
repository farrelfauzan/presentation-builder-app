import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GlobalSettingsModule } from './global-settings/global-settings.module';
import { ProjectsModule } from './projects/projects.module';
import { SlidesModule } from './slides/slides.module';

@Module({
  imports: [GlobalSettingsModule, ProjectsModule, SlidesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
