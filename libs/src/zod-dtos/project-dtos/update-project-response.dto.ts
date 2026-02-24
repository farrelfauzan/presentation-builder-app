import { createZodDto } from 'nestjs-zod';
import {
  projectResponseDto,
  ProjectResponseType,
} from './get-project-response.dto';

export class UpdateProjectResponseDto extends createZodDto(
  projectResponseDto,
) {}

export type UpdateProjectResponseType = ProjectResponseType;
