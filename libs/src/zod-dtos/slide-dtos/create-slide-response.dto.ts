import { createZodDto } from 'nestjs-zod';
import { slideResponseDto, SlideResponseType } from './get-slide-response.dto';

export class CreateSlideResponseDto extends createZodDto(slideResponseDto) {}

export type CreateSlideResponseType = SlideResponseType;
