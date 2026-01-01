/**
 * Custom error classes for application error handling.
 * Provides structured error information with user-friendly messages.
 */

/**
 * Base application error class with error codes and user messages.
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public userMessage: string,
    public recoverable: boolean = true,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

/**
 * Error codes for different error types
 */
export enum ErrorCode {
  // Map/Export errors
  MAP_LOAD_FAILED = 'MAP_LOAD_FAILED',
  EXPORT_FAILED = 'EXPORT_FAILED',
  MAP_RENDER_ERROR = 'MAP_RENDER_ERROR',
  
  // Geolocation errors
  GEOLOCATION_DENIED = 'GEOLOCATION_DENIED',
  GEOLOCATION_TIMEOUT = 'GEOLOCATION_TIMEOUT',
  GEOLOCATION_UNAVAILABLE = 'GEOLOCATION_UNAVAILABLE',
  REVERSE_GEOCODE_FAILED = 'REVERSE_GEOCODE_FAILED',
  
  // Storage errors
  STORAGE_QUOTA_EXCEEDED = 'STORAGE_QUOTA_EXCEEDED',
  STORAGE_UNAVAILABLE = 'STORAGE_UNAVAILABLE',
  STORAGE_READ_FAILED = 'STORAGE_READ_FAILED',
  STORAGE_WRITE_FAILED = 'STORAGE_WRITE_FAILED',
  
  // API errors
  GEOCODE_FAILED = 'GEOCODE_FAILED',
  TILE_FETCH_FAILED = 'TILE_FETCH_FAILED',
  API_RATE_LIMIT = 'API_RATE_LIMIT',
  
  // Configuration errors
  CONFIG_DECODE_FAILED = 'CONFIG_DECODE_FAILED',
  CONFIG_ENCODE_FAILED = 'CONFIG_ENCODE_FAILED',
  INVALID_CONFIG = 'INVALID_CONFIG',
  
  // Generic errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
}

/**
 * Creates a user-friendly error message from an error code
 */
export function getUserMessage(code: ErrorCode, details?: string): string {
  const messages: Record<ErrorCode, string> = {
    [ErrorCode.MAP_LOAD_FAILED]: 'Failed to load map. Please try refreshing the page or selecting a different location.',
    [ErrorCode.EXPORT_FAILED]: 'Failed to export poster. Please try again or reduce the export resolution.',
    [ErrorCode.MAP_RENDER_ERROR]: 'Map rendering error. Please try refreshing the page.',
    
    [ErrorCode.GEOLOCATION_DENIED]: 'Location access was denied. You can still search for locations manually.',
    [ErrorCode.GEOLOCATION_TIMEOUT]: 'Location request timed out. Please try again or search for a location manually.',
    [ErrorCode.GEOLOCATION_UNAVAILABLE]: 'Location services are unavailable. Please search for a location manually.',
    [ErrorCode.REVERSE_GEOCODE_FAILED]: 'Failed to get address for your location. The map will still work.',
    
    [ErrorCode.STORAGE_QUOTA_EXCEEDED]: 'Storage is full. Some saved projects may not be saved. Please delete old projects.',
    [ErrorCode.STORAGE_UNAVAILABLE]: 'Storage is unavailable. Projects cannot be saved, but you can still use the app.',
    [ErrorCode.STORAGE_READ_FAILED]: 'Failed to load saved projects. They may still be available after refreshing.',
    [ErrorCode.STORAGE_WRITE_FAILED]: 'Failed to save project. Please try again.',
    
    [ErrorCode.GEOCODE_FAILED]: 'Location search failed. Please try a different search term.',
    [ErrorCode.TILE_FETCH_FAILED]: 'Failed to load map tiles. Please check your internet connection.',
    [ErrorCode.API_RATE_LIMIT]: 'Too many requests. Please wait a moment and try again.',
    
    [ErrorCode.CONFIG_DECODE_FAILED]: 'Failed to load saved configuration. Using default settings.',
    [ErrorCode.CONFIG_ENCODE_FAILED]: 'Failed to save configuration to URL.',
    [ErrorCode.INVALID_CONFIG]: 'Invalid configuration. Using default settings.',
    
    [ErrorCode.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try refreshing the page.',
    [ErrorCode.NETWORK_ERROR]: 'Network error. Please check your internet connection and try again.',
  };
  
  const baseMessage = messages[code] || messages[ErrorCode.UNKNOWN_ERROR];
  return details ? `${baseMessage} ${details}` : baseMessage;
}

/**
 * Helper to create AppError instances
 */
export function createAppError(
  code: ErrorCode,
  message: string,
  originalError?: unknown,
  recoverable: boolean = true
): AppError {
  return new AppError(
    message,
    code,
    getUserMessage(code),
    recoverable,
    originalError
  );
}

