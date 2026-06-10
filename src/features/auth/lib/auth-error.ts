import { AxiosError } from "axios";

interface ApiErrorBody {
  message?: string;
  error?: string;
  errors?: {
    fieldErrors?: Record<string, string[]>;
    formErrors?: string[];
  };
}

export function getAuthErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorBody | undefined;

    const firstFieldError = data?.errors?.fieldErrors
      ? Object.values(data.errors.fieldErrors).flat()[0]
      : undefined;

    return (
      firstFieldError ||
      data?.errors?.formErrors?.[0] ||
      data?.message ||
      data?.error ||
      "Something went wrong. Please try again."
    );
  }

  return "Network error. Please try again.";
}
