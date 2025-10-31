import {
  BadRequestException,
  Injectable,
  mixin,
  PipeTransform,
  Type,
} from '@nestjs/common';
import * as moment from 'moment-timezone';

export function CustomKeyDateQueryPipe(field: string): Type<PipeTransform> {
  @Injectable()
  class ValidateDatePipe implements PipeTransform {
    async transform(query: {
      startDate?: string;
      endDate?: string;
    }): Promise<unknown> {
      const { startDate, endDate } = query;
      if (startDate && endDate) {
        if (
          !moment(startDate, 'YYYY-MM-DD', true).isValid() ||
          !moment(endDate, 'YYYY-MM-DD', true).isValid()
        ) {
          throw new BadRequestException('Invalid date format');
        }

        const gteDate = new Date(startDate);
        const lteDate = new Date(endDate);

        (query as Record<string, unknown>)[field] = {
          gte: gteDate.toISOString(),
          lte: new Date(lteDate.setHours(24, 59, 59, 999)).toISOString(),
        };

        delete query.startDate;
        delete query.endDate;
      } else {
        if (startDate) delete query.startDate;
        if (endDate) delete query.endDate;
      }
      return query;
    }
  }

  return mixin(ValidateDatePipe);
}
