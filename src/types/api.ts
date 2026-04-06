// ═══════════════════════════════════════════
// CSA - CatIA Super App — API Response Types
// ═══════════════════════════════════════════

export interface ApiResponse<T> {
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
}
