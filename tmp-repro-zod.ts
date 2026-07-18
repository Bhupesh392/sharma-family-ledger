import { z } from 'zod';

const s = z
  .string()
  .trim()
  .min(1, { message: 'Username cannot be empty' })
  .toLowerCase()
  .optional()
  .nullable();

console.log('schema constructed', s.constructor.name);
console.log('safeParse type', typeof s.safeParse);
console.log('safeParse(undefined):', s.safeParse(undefined));
console.log('safeParse(null):', s.safeParse(null));
console.log('safeParse(""):', s.safeParse(''));
console.log('safeParse(" "):', s.safeParse(' '));
console.log('safeParse(" test "):', s.safeParse(' test '));
