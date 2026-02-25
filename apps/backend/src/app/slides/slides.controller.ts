import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SlidesService } from './slides.service';
import {
  CreateSlideDto,
  UpdateSlideDto,
  ReorderSlidesDto,
} from '@presentation-builder-app/libs';

@Controller({
  version: '1',
  path: 'slides',
})
export class SlidesController {
  constructor(private readonly slidesService: SlidesService) {}

  // Nested routes: /projects/:projectId/slides
  @Post('project/:projectId')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('projectId') projectId: string,
    @Body() createSlideDto: CreateSlideDto,
  ) {
    const data = await this.slidesService.create(projectId, createSlideDto);
    return { data };
  }

  @Get('project/:projectId')
  async findAllByProject(@Param('projectId') projectId: string) {
    const data = await this.slidesService.findAllByProject(projectId);
    return { data };
  }

  @Patch('project/:projectId/reorder')
  async reorder(
    @Param('projectId') projectId: string,
    @Body() reorderDto: ReorderSlidesDto,
  ) {
    const data = await this.slidesService.reorder(
      projectId,
      reorderDto.slideIds,
    );
    return { data };
  }

  // Direct slide routes
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.slidesService.findOne(id);
    return { data };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSlideDto: UpdateSlideDto,
  ) {
    const data = await this.slidesService.update(id, updateSlideDto);
    return { data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    const data = this.slidesService.remove(id);

    return { data };
  }
}
