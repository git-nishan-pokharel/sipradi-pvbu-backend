import {
  PaginationMeta,
  PaginationParams,
} from '@app/pagination/decorators/pagination.decorator';
import { createPaginationMeta } from '@app/pagination/utils/pagination.util';
import { PrismaService } from '@app/prisma';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClient } from 'apps/pvbu-backend/prisma/generated/prisma/client';

@Injectable()
export class PrismaRepository<T extends object> {
  constructor(
    protected readonly repository: PrismaService,
    protected readonly modelName: keyof PrismaClient | string,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected get model(): any {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.repository as any)[this.modelName];
  }

  async create(
    data: Partial<T>,
    include?: Record<string, unknown>,
    omit?: Record<string, unknown>,
  ): Promise<T> {
    return (await this.model.create({ data, include, omit })) as T;
  }

  async findById(
    id: number | string,
    include?: Record<string, unknown>,
    select?: Record<string, unknown>,
    omit?: Record<string, unknown>,
    query?: Record<string, unknown>,
  ): Promise<T> {
    if (typeof id !== 'number' || Number.isNaN(id)) {
      throw new BadRequestException('Id must be a number');
    }
    const item = await this.model.findUnique({
      where: { id, ...(query && { ...query }) },
      include,
      select,
      omit,
    });
    if (!item)
      throw new NotFoundException(
        `${String(this.modelName)} with id ${id} not found`,
      );

    return item;
  }

  async findOne(
    query: Record<string, unknown>,
    include?: Record<string, unknown>,
    select?: Record<string, unknown>,
    omit?: Record<string, boolean>,
  ): Promise<T> {
    const item = await this.model.findFirst({
      where: query,
      include,
      select,
      omit,
    });
    if (!item)
      throw new NotFoundException(`${String(this.modelName)} not found`);

    return item;
  }

  async findAll(
    select?: Record<string, unknown>,
    query?: Record<string, unknown>,
  ): Promise<{ items: T[] }> {
    const items = await this.model.findMany({ where: query, select });
    return { items };
  }

  async findAllPaginated(
    query: Record<string, unknown> = {},
    paginationParams: PaginationParams = {},
    include?: Record<string, unknown>,
    searchFields: string[] = [],
    omit?: Record<string, boolean>,
  ): Promise<{ items: T[]; pagination: PaginationMeta }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'updatedAt',
      sortOrder = 'asc',
    } = paginationParams;

    const skip = (page - 1) * limit;

    const excludedParams = ['page', 'limit', 'sortBy', 'sortOrder', 'q'];

    const filters: Record<string, unknown> = Object.entries(query)
      .filter(
        ([key, value]) =>
          !excludedParams.includes(key) && value !== undefined && value !== '',
      )
      .reduce((acc, [key, value]) => {
        // Convert string 'true' or 'false' to boolean true or false
        if (typeof value === 'string') {
          if (value.toLowerCase() === 'true') {
            value = true;
          } else if (value.toLowerCase() === 'false') {
            value = false;
          } else if (value.toLowerCase() === 'null') {
            value = null;
          }
        }
        // Handle 'id' as a number
        if (key === 'id' && typeof value === 'string') {
          value = parseInt(value, 10);
        }
        return { ...acc, [key]: value };
      }, {});

    if (query.q && searchFields.length > 0) {
      filters['OR'] = searchFields.map((field) => {
        if (field.includes('.')) {
          const [jsonField, ...path] = field.split('.');
          return {
            [jsonField]: {
              path,
              string_contains: query.q?.toString(),
              mode: 'insensitive',
            },
          };
        } else {
          return {
            [field]: {
              contains: query.q?.toString(),
              mode: 'insensitive',
            },
          };
        }
      });
    }

    const where = Object.keys(filters).length > 0 ? filters : undefined;
    const orderBy = sortBy
      ? { [sortBy]: sortOrder.toLowerCase() as 'asc' | 'desc' }
      : undefined;

    const [items, total] = await Promise.all([
      this.model.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include,
        omit,
      }) as Promise<T[]>,
      this.model.count({ where }),
    ]);

    const pagination = createPaginationMeta(total, paginationParams);

    return {
      items,
      pagination,
    };
  }

  async update(
    id: string | number,
    data: Partial<T>,
    include?: Record<string, unknown>,
    omit?: Record<string, unknown>,
    query?: Record<string, unknown>,
  ): Promise<T> {
    const item = await this.model.findUnique({
      where: { id },
    });
    if (!item)
      throw new NotFoundException(
        `${String(this.modelName)} with id ${id} not found`,
      );
    return await this.model.update({
      where: { id, ...(query && { ...query }) },
      data,
      include,
      omit,
    });
  }

  async remove(id: number, query?: Record<string, unknown>): Promise<T> {
    const item = await this.model.findUnique({
      where: { id, ...query },
    });
    if (!item)
      throw new NotFoundException(
        `${String(this.modelName)} with id ${id} not found`,
      );

    return await this.model.delete({
      where: { id },
    });
  }
}
