import { Module } from '@nestjs/common';
import { GlobalSettingsService } from './global-settings.service';
import { GlobalSettingsController } from './global-settings.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MinioModule } from '../minio/minio.module';
import { GLOBAL_SETTINGS_REPOSITORY } from './domain/ports/global-settings.port';
import { GlobalSettingsRepository } from './repositories/global-settings-repository';

@Module({
  imports: [PrismaModule, MinioModule],
  controllers: [GlobalSettingsController],
  providers: [
    GlobalSettingsService,
    {
      provide: GLOBAL_SETTINGS_REPOSITORY,
      useClass: GlobalSettingsRepository,
    },
  ],
  exports: [GlobalSettingsService],
})
export class GlobalSettingsModule {}
