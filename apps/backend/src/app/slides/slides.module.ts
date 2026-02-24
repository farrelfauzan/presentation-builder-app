import { Module } from '@nestjs/common';
import { SlidesService } from './slides.service';
import { SlidesController } from './slides.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SLIDES_REPOSITORY } from './domain/ports/slides.port';
import { SlidesRepository } from './repositories/slides.repository';

@Module({
  imports: [PrismaModule],
  controllers: [SlidesController],
  providers: [
    SlidesService,
    {
      provide: SLIDES_REPOSITORY,
      useClass: SlidesRepository,
    },
  ],
  exports: [SlidesService],
})
export class SlidesModule {}
