import { Injectable } from '@nestjs/common';
import { CreateGlobalSettingDto } from './dto/create-global-setting.dto';
import { UpdateGlobalSettingDto } from './dto/update-global-setting.dto';

@Injectable()
export class GlobalSettingsService {
  create(createGlobalSettingDto: CreateGlobalSettingDto) {
    return 'This action adds a new globalSetting';
  }

  findAll() {
    return `This action returns all globalSettings`;
  }

  findOne(id: number) {
    return `This action returns a #${id} globalSetting`;
  }

  update(id: number, updateGlobalSettingDto: UpdateGlobalSettingDto) {
    return `This action updates a #${id} globalSetting`;
  }

  remove(id: number) {
    return `This action removes a #${id} globalSetting`;
  }
}
