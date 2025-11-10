import z from 'zod';

import EnvSchema from './env.schema';

const _parsed = EnvSchema.safeParse(import.meta.env);
if (!_parsed.success) {
  throw new Error(`Invalid environment variables : ${z.prettifyError(_parsed.error)}`);
}

export type EnvSchemaType = z.infer<typeof EnvSchema>;

export const CONFIG = _parsed.data;
