import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ quiet: true });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  FRONTEND_URL: z.string().url().default('http://localhost:4200'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET es obligatorio'),
  JWT_EXPIRES_IN: z.string().min(1).default('24h'),
  DATABASE_URL: z.string().optional(),
  SUPABASE_URL: z.string().url('SUPABASE_URL debe ser una URL válida'),
  SUPABASE_PUBLISHABLE_KEY: z.string().default(''),
  SUPABASE_SECRET_KEY: z.string().min(1, 'SUPABASE_SECRET_KEY es obligatorio'),
  SUPABASE_JWKS_URL: z.string().url().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const detalle = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  throw new Error(`Configuración de entorno inválida:\n${detalle}`);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
