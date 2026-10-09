interface PostgrestLikeError {
  code?: string;
  message?: string;
  details?: string;
}

export function getSupabaseErrorCode(error: unknown): string | undefined {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    return (error as PostgrestLikeError).code;
  }
  return undefined;
}

export function isUniqueViolation(error: unknown): boolean {
  return getSupabaseErrorCode(error) === '23505';
}

export function isForeignKeyViolation(error: unknown): boolean {
  return getSupabaseErrorCode(error) === '23503';
}
