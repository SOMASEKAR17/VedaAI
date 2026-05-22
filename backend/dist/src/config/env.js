"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const path_1 = __importDefault(require("path"));
// Load .env file in non-production
if (process.env.NODE_ENV !== 'production') {
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        require('dotenv').config({ path: path_1.default.resolve(__dirname, '../../.env') });
    }
    catch {
        // dotenv is optional
    }
}
const envSchema = zod_1.z.object({
    PORT: zod_1.z.string().default('4000').transform(Number),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    MONGODB_URI: zod_1.z.string().min(1, 'MONGODB_URI is required'),
    REDIS_HOST: zod_1.z.string().default('localhost'),
    REDIS_PORT: zod_1.z.string().default('6379').transform(Number),
    GROQ_API_KEY: zod_1.z.string().min(1, 'GROQ_API_KEY is required'),
    FRONTEND_URL: zod_1.z.string().default('http://localhost:3000'),
    MAX_FILE_SIZE_MB: zod_1.z.string().default('10').transform(Number),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
}
exports.env = parsed.data;
//# sourceMappingURL=env.js.map