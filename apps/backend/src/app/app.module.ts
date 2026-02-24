import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GlobalSettingsModule } from './global-settings/global-settings.module';
import { ProjectsModule } from './projects/projects.module';
import { SlidesModule } from './slides/slides.module';
import { UploadModule } from './upload/upload.module';
import { PrismaController } from './prisma/prisma.controller';
import { PrismaModule } from './prisma/prisma.module';
import { MinioModule } from './minio/minio.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    MinioModule,
    GlobalSettingsModule,
    ProjectsModule,
    SlidesModule,
    UploadModule,
  ],
  controllers: [AppController, PrismaController],
  providers: [AppService],
})
export class AppModule {}
