import { tenantSchema } from './src/lib/validations';
const res = tenantSchema.safeParse({
  name: 'Test Tenant',
  loginEnabled: true,
  username: 'testuser',
  password: 'password123',
});
console.log(res.success ? 'PASS' : 'FAIL', res);
