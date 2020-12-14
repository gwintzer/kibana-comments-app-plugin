import { boomify } from 'boom';

export function wrapError(error: Error, options: { statusCode?: number | undefined; message?: string | undefined; override?: boolean | undefined; } | undefined) {
  return boomify(error, options);
}

