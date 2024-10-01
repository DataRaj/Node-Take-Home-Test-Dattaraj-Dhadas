import { fileURLToPath } from 'url';
import path from 'path';
// Function to resolve directory name
export function resolvePath(metaUrl) {
    const __filename = fileURLToPath(metaUrl);
    return path.dirname(__filename);
}
