import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  nextPageUrl: string | undefined;
  previousPageUrl: string | undefined;
}

export const Paginate = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): PaginationParams => {
    const request = ctx.switchToHttp().getRequest();

    return {
      page: parseInt(request.query.page, 10) || 1,
      limit: parseInt(request.query.limit, 10) || 10,
      sortBy: request.query.sortBy as string,
      sortOrder: (request.query.sortOrder as 'asc' | 'desc') || 'asc',
    };
  },
);
