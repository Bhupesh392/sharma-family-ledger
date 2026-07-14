import { z } from 'zod';
const s = z.preprocess((value) => typeof value === 'string' ? value.trim().toLowerCase() : value).optional().nullable().refine(
  (value) => value === null || value === undefined || value.length > 0,
  { message: 'Username cannot be empty' }
);
console.log('schema constructed', s.constructor.name);
console.log('safeParse type', typeof s.safeParse);
console.log('safeParse(undefined):', s.safeParse(undefined));
console.log('safeParse(null):', s.safeParse(null));
console.log('safeParse(""):', s.safeParse(''));
