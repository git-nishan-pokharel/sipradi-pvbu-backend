// global-validation.pipe.ts
import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
  ValidationPipe,
  ValidationError,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class GlobalValidationPipe implements PipeTransform {
  async transform(
    value: Record<string, unknown>,
    metadata: ArgumentMetadata,
  ): Promise<Record<string, unknown>> {
    const { metatype, type } = metadata;

    // Bypass primitive types (not class-based DTOs)
    if (!metatype || this.isPrimitive(metatype)) {
      return value;
    }

    // BODY: strict validation (your current settings)
    if (type === 'body') {
      const pipe = new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        exceptionFactory: (errors: ValidationError[]): BadRequestException => {
          const extractErrorMessages = (
            errors: ValidationError[],
          ): string[] => {
            return errors.flatMap((error) => {
              if (error.children?.length) {
                return extractErrorMessages(error.children);
              }
              const messages = Object.values(
                error?.constraints ?? {
                  default: `Bad request in ${error.property}`,
                },
              );
              return messages;
            });
          };

          const errorMessages = extractErrorMessages(errors).join(', ');
          return new BadRequestException(errorMessages);
        },
      });

      return pipe.transform(value, metadata);
    }

    // QUERY: lenient validation (strip invalid fields, remove unknowns)
    if (type === 'query') {
      const obj = plainToInstance(metatype, value);
      const errors = await validate(obj, {
        skipMissingProperties: false,
        whitelist: true,
      });

      // Remove fields that failed validation
      for (const error of errors) {
        if (error.property in obj) {
          delete obj[error.property];
        }
      }
      return obj;
    }

    // For other types like param, custom logic can be added similarly
    return value;
  }

  private isPrimitive(metatype: new (...args: unknown[]) => unknown): boolean {
    const types: (new (...args: unknown[]) => unknown)[] = [
      String,
      Boolean,
      Number,
      Array,
      Object,
    ];
    return types.includes(metatype);
  }
}
