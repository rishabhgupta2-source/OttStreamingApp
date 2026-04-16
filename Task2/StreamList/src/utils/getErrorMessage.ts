export function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const record = error as { message: unknown };
    if (typeof record.message === 'string' && record.message.length > 0) {
      return record.message;
    }
  }
  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }
  return 'Request failed';
}
