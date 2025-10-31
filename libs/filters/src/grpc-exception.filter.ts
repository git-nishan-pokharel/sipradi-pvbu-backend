import { status } from '@grpc/grpc-js';
import { Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';

@Catch()
export class GrpcExceptionFilter implements ExceptionFilter {
  catch(exception: RpcException): Observable<never> {
    let error: { message?: string; code?: number } = {
      message: 'Internal server error',
      code: status.INTERNAL,
    };

    if (exception instanceof RpcException) {
      const extractedError = exception?.getError() as {
        message?: string;
        code?: number;
      };

      if (typeof extractedError === 'object' && extractedError !== null) {
        error = {
          message: extractedError?.message ?? error.message,
          code: extractedError?.code ?? error.code,
        };
      } else if (typeof extractedError === 'string') {
        error.message = extractedError;
      }
    }

    if (exception instanceof HttpException) {
      return throwError(() => exception);
    }

    return throwError(() => error);
  }
}
