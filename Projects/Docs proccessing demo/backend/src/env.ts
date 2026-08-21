import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load the root .env first, then backend/.env — backend values win.
config({ path: path.resolve(__dirname, '../../.env') });
config();
