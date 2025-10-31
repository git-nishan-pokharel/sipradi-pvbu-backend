import {
  PaginationMeta,
  PaginationParams,
} from '../decorators/pagination.decorator';

export function buildUrl(
  params: PaginationParams,
  targetPageNumber: number,
): string {
  const searchParams = new URLSearchParams();
  searchParams.set('page', targetPageNumber.toString());
  return `?${searchParams.toString()}`;
}

export function createPaginationMeta(
  total: number,
  params: PaginationParams,
): PaginationMeta {
  const totalPages = Math.ceil(total / (params.limit ?? 10));
  const currentPage = params.page ?? 1;
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  return {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    total,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    nextPageUrl: hasNextPage ? buildUrl(params, currentPage + 1) : undefined,
    previousPageUrl: hasPreviousPage
      ? buildUrl(params, currentPage - 1)
      : undefined,
  };
}
