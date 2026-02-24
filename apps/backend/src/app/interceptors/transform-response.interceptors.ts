import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import { map, type Observable } from 'rxjs';

export interface IResponse<T> {
  statusCode: number;
  data: T;
}

@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
  intercept<T>(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<IResponse<T>> {
    return next.handle().pipe(
      map((response) => {
        const { data } = response;

        return {
          statusCode: context.switchToHttp().getResponse().statusCode,
          data,
        };
      }),
    );
  }
}
