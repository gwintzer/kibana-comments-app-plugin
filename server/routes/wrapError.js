import { boomify } from 'boom';

export function wrapError(error, options) {
  return boomify(error, options);
}

