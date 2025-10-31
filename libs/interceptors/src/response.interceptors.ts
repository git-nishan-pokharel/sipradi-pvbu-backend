import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T | undefined;
  error: string | undefined;
  message: string | undefined;
  statusCode: number;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();

    return next.handle().pipe(
      map((data) => {
        const safeData = data ?? {};
        const {
          message = undefined,
          statusCode = response.statusCode,
          ...rest
        } = safeData;

        // If the controller returns an array, pass it directly
        const isArray = Array.isArray(data);

        return {
          status: 'success',
          statusCode,
          message,
          data: isArray
            ? data
            : {
                ...rest,
                pagination: safeData.pagination ?? undefined,
              },
          error: undefined,
        };
      }),
    );
  }
}
