import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(8),
  WEB_URL: z.string().url().default('http://localhost:3000'),
  HOTMART_WEBHOOK_TOKEN: z.string().min(4),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(6).optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3333),
});

export const env = envSchema.parse(process.env);
