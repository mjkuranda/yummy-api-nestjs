/**
 * Equals to {}
 */
export type EmptyDocument = Record<string, never>;

/**
 * HTTP status codes.
 */
export type StatusCodes = 200 | 201 | 400 | 403 | 404 | 500;

/**
 * Context string format: ClassName/MethodName
 */
export type ContextString = `${string}/${string}`;