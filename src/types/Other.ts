export type ErrorType = { message: string };

export type ApiResponse = {
  message: string;
  data?: unknown;
  pagination?: {
    count?: number;
    page: number;
    rowsPerPage: number;
  };
};
