import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { GlobalSettingsService } from './global-settings.service';
import { CreateGlobalSettingDto } from './dto/create-global-setting.dto';
import { UpdateGlobalSettingDto } from './dto/update-global-setting.dto';

@Controller('global-settings')
export class GlobalSettingsController {
  constructor(private readonly globalSettingsService: GlobalSettingsService) {}

  @Post()
  create(@Body() createGlobalSettingDto: CreateGlobalSettingDto) {
    return this.globalSettingsService.create(createGlobalSettingDto);
  }

  @Get()
  findAll() {
    return this.globalSettingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.globalSettingsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateGlobalSettingDto: UpdateGlobalSettingDto,
  ) {
    return this.globalSettingsService.update(+id, updateGlobalSettingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.globalSettingsService.remove(+id);
  }
}
