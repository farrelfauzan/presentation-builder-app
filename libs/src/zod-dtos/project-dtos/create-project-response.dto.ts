import { createZodDto } from 'nestjs-zod';
import {
  projectResponseDto,
  ProjectResponseType,
} from './get-project-response.dto';

export class CreateProjectResponseDto extends createZodDto(
  projectResponseDto,
) {}

export type CreateProjectResponseType = ProjectResponseType;
