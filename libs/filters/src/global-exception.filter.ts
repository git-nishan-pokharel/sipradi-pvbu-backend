import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from 'apps/pvbu-backend/prisma/generated/prisma/client';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter extends BaseExceptionFilter {
  catch(
    exception: {
      getStatus: () => HttpStatus;
      message: string;
      stack: string;
      code: string;
      meta: { target: any[]; modelName: any };
      name: any;
    },
    host: ArgumentsHost,
  ): void {
    Logger.error('Exception occurred', exception);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let message = 'Internal Server Error';
    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception instanceof HttpException) {
      status = exception.getStatus
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.message;
      Logger.error(
        'HttpException occurred',
        exception.message,
        exception.stack,
      );
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') {
        status = HttpStatus.CONFLICT;
        message = Array.isArray(exception?.meta?.target)
          ? `${exception?.meta?.target.join(', ')} must be unique in ${exception.meta.modelName}`
          : 'Unique constraint failed';
      } else if (exception.code === 'P2003') {
        status = HttpStatus.BAD_REQUEST;
        message = 'Foreign key constraint failed';
      } else if (exception.code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        message = 'Record not found';
      } else {
        status = HttpStatus.BAD_REQUEST;
        message = 'Database operation failed';
      }
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Invalid data provided';
    } else if (exception instanceof Error) {
      Logger.error(
        'Generic error occurred',
        exception.message,
        exception.stack,
      );

      if (process.env.NODE_ENV !== 'production') {
        message = exception.message;
      }
    }

    response.status(status).json({
      status: 'error',
      statusCode: status,
      timestamp: new Date().toISOString(),
      message: message,
      ...(process.env.NODE_ENV !== 'production' && {
        error: exception instanceof Error ? exception.name : 'UnknownError',
        stack: exception instanceof Error ? exception.stack : undefined,
      }),
    });
  }
}
