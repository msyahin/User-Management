import { z } from 'zod';

const EnvSchema = z.object({
    APP_SERVER_URL: z.url()
});

export default EnvSchema;
