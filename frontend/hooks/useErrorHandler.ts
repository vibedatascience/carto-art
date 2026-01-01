'use client';

import { useState, useCallback, useRef } from 'react';
import { AppError, ErrorCode, createAppError } from '@/lib/errors/AppError';
import { logger } from '@/lib/logger';

export interface ErrorToast {
  id: string;
  error: AppError;
  timestamp: number;
}

/**
 * Hook for centralized error handling with user-facing notifications.
 * Manages error state and provides methods to handle and display errors.
 * 
 * @returns Object containing:
 * - errors: Array of current error toasts
 * - handleError: Function to handle an error
 * - clearError: Function to clear a specific error
 * - clearAllErrors: Function to clear all errors
 * 
 * @example
 * ```tsx
 * const { handleError, errors } = useErrorHandler();
 * 
 * try {
 *   await someOperation();
 * } catch (err) {
 *   handleError(createAppError(ErrorCode.EXPORT_FAILED, err.message, err));
 * }
 * ```
 */
export function useErrorHandler() {
  const [errors, setErrors] = useState<ErrorToast[]>([]);
  const errorIdCounter = useRef(0);

  /**
   * Handles an error by creating a toast notification and logging it.
   */
  const handleError = useCallback((error: AppError | Error | unknown) => {
    let appError: AppError;

    if (error instanceof AppError) {
      appError = error;
    } else if (error instanceof Error) {
      // Convert generic Error to AppError
      appError = createAppError(
        ErrorCode.UNKNOWN_ERROR,
        error.message,
        error
      );
    } else {
      // Handle unknown error types
      appError = createAppError(
        ErrorCode.UNKNOWN_ERROR,
        String(error),
        error
      );
    }

    // Log error for debugging
    logger.error('Error handled:', {
      code: appError.code,
      message: appError.message,
      userMessage: appError.userMessage,
      originalError: appError.originalError,
    });

    // Add to errors array
    const errorToast: ErrorToast = {
      id: `error-${++errorIdCounter.current}`,
      error: appError,
      timestamp: Date.now(),
    };

    setErrors(prev => [...prev, errorToast]);

    // Auto-remove recoverable errors after 5 seconds
    if (appError.recoverable) {
      setTimeout(() => {
        clearError(errorToast.id);
      }, 5000);
    }
  }, []);

  /**
   * Clears a specific error by ID
   */
  const clearError = useCallback((id: string) => {
    setErrors(prev => prev.filter(e => e.id !== id));
  }, []);

  /**
   * Clears all errors
   */
  const clearAllErrors = useCallback(() => {
    setErrors([]);
  }, []);

  return {
    errors,
    handleError,
    clearError,
    clearAllErrors,
  };
}

