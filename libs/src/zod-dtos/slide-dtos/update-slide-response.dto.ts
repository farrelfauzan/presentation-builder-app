import { createZodDto } from 'nestjs-zod';
import { slideResponseDto, SlideResponseType } from './get-slide-response.dto';

export class UpdateSlideResponseDto extends createZodDto(slideResponseDto) {}

export type UpdateSlideResponseType = SlideResponseType;
