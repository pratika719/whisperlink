"use client";

import { useState } from "react";
import { toast } from "sonner";

interface UseAuthFormOptions<TData> {
  onSubmit: (data: TData) => Promise<Response>;
  onSuccess?: (data: unknown) => void;
  successMessage?: string;
}

export function useAuthForm<TData>({
  onSubmit,
  onSuccess,
  successMessage,
}: UseAuthFormOptions<TData>) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(data: TData) {
    setIsLoading(true);
    setError(null);

    try {
      const res = await onSubmit(data);
      const json = await res.json();

      if (!res.ok) {
        const message =
          json.message || json.error || "Something went wrong";
        setError(message);
        toast.error(message);
        return;
      }

      if (successMessage) {
        toast.success(successMessage);
      }

      onSuccess?.(json.data);
    } catch {
      const message = "Network error. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  return { handleSubmit, isLoading, error };
}
