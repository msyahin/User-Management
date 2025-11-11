import { z } from 'zod';

const EnvSchema = z.object({
    APP_SERVER_URL: z.url(),
    APP_IMGBB_API_KEY: z.string().min(1, 'ImgBB API key is required'),
});

export default EnvSchema;
