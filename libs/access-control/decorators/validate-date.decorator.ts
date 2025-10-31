import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function TransformAndValidateDate(
  validationOptions?: ValidationOptions,
) {
  return function (target: object, propertyKey: string): void {
    registerDecorator({
      name: 'TransformAndValidateDate',
      target: target.constructor,
      propertyName: propertyKey,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments): boolean {
          if (value instanceof Date && !isNaN(value.getTime())) return true;
          if (typeof value !== 'string') return false;

          // Extended ISO 8601 regex to support:
          // - UTC: 2025-05-26T09:59:36.398Z
          // - With offset: 2025-05-26T09:59:36.398+05:45
          // - Without time: 2025-05-26
          const iso8601Regex =
            /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?([+-]\d{2}:\d{2}|Z)?)?$/;

          if (iso8601Regex.test(value)) {
            const date = new Date(value);
            if (isNaN(date.getTime())) return false;

            // Optional: Normalize to ISO string if only date was provided
            const [dateOnly] = value.split('T');
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
              (args.object as Record<string, string>)[args.property] =
                date.toISOString();
            }
            return true;
          }

          return false;
        },
        defaultMessage(): string {
          return 'Invalid date format. Use ISO 8601 (e.g., YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ or with offset).';
        },
      },
    });
  };
}
