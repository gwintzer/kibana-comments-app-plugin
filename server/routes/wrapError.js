import { boomify } from 'boom';

export function wrapError(error) {
  return boomify(error);
}

