import { toast as sonnerToast } from "sonner-native";

interface ToastOptions {
  description?: string;
  duration?: number;
}

export const toast = {
  success: (message: string, options?: ToastOptions) =>
    sonnerToast.success(message, options),
  error: (message: string, options?: ToastOptions) =>
    sonnerToast.error(message, options),
  info: (message: string, options?: ToastOptions) =>
    sonnerToast.info(message, options),
};

export const toastMutationError = (error: unknown, fallback: string) => {
  const description =
    error instanceof Error && error.message ? error.message : undefined;
  toast.error(fallback, description ? { description } : undefined);
};
