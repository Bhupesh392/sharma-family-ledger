import { tenantSchema } from './src/lib/validations';
const cases = [
  { name: 'X', loginEnabled: false },
  { name: 'X', loginEnabled: true, username: '   t ', password: 'password123' },
  { name: 'X', loginEnabled: true, username: '', password: 'password123' },
  { name: 'X', loginEnabled: true, username: 't', password: 'short' },
];
for (const input of cases) {
  try {
    const result = tenantSchema.safeParse(input);
    console.log('input', input, 'success', result.success, result.success ? result.data : result.error.issues.map(i => i.message));
  } catch (err) {
    console.error('threw', err);
  }
}
