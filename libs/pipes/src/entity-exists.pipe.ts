import { PrismaService } from '@app/prisma';
import {
  Inject,
  Injectable,
  mixin,
  NotFoundException,
  PipeTransform,
  Type,
} from '@nestjs/common';

type PrismaDelegate = {
  findUnique: (args: { where: Record<string, unknown> }) => Promise<unknown>;
};

export function EntityExistsPipeFactory(
  entity: keyof PrismaService,
  field: string = 'id',
): Type<PipeTransform> {
  @Injectable()
  class EntityExistsPipeMixin implements PipeTransform {
    constructor(
      @Inject(PrismaService) private readonly prisma: PrismaService,
    ) {}

    async transform(value: Record<string, unknown>): Promise<unknown> {
      if (!value?.[field]) {
        return;
      }
      const entityModel = this.prisma[entity] as unknown as PrismaDelegate;

      if (!entityModel || typeof entityModel.findUnique !== 'function') {
        throw new Error(`Invalid entity: ${String(entity)}`);
      }

      const record = await entityModel.findUnique({
        where: { id: value?.[field] },
      });

      if (!record) {
        throw new NotFoundException(`${String(entity)} not found`);
      }

      return value;
    }
  }

  return mixin(EntityExistsPipeMixin);
}

export function MultiEntityExistsPipeFactory(
  entities: { entity: keyof PrismaService; field: string }[],
): Type<PipeTransform> {
  @Injectable()
  class MultiEntityExistsPipe implements PipeTransform {
    constructor(
      @Inject(PrismaService) private readonly prisma: PrismaService,
    ) {}

    async transform(value: Record<string, unknown>): Promise<unknown> {
      const queries = entities.map(async ({ entity, field }) => {
        if (!value?.[field]) {
          return;
        }
        const entityModel = this.prisma[entity] as unknown as PrismaDelegate;
        if (!entityModel || typeof entityModel.findUnique !== 'function') {
          throw new Error(`Invalid entity: ${String(entity)}`);
        }
        const record = await entityModel.findUnique({
          where: { id: value?.[field] },
        });
        if (!record) {
          throw new NotFoundException(`${String(entity)} not found`);
        }
        return record;
      });

      await Promise.all(queries);

      return value;
    }
  }

  return mixin(MultiEntityExistsPipe);
}
