import { ApiResponse } from "../types/Other";

export const createOutput = (data: unknown, message?: string) => {
  const output: ApiResponse = {
    message: message || "Api call successful",
  };
  if (data) {
    output.data = data;
  }
  if (Array.isArray(data)) {
    output.pagination = {
      count: data.length,
      page: 1,
      rowsPerPage: 10,
    };
  }
  return output;
};
