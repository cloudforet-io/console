import fs from 'fs';
import path from 'path';

const API_DIR = './src/api-clients';
const OUTPUT_PATH = './src/api-clients/_common/constants/api-doc-constant.ts';


const generateAPIDocumentation = (basePath) => {
    const result = {};

    const traverse = (dirPath) => {
        const parts = dirPath.split(path.sep).slice(-5);
        if (parts.length !== 5) return;
        if (parts[3] !== 'api-verbs' || parts[1] === '_common') return;

        const [serviceName, resourceName, , , verb] = parts;

        if (!result[serviceName]) result[serviceName] = {};
        if (!result[serviceName][resourceName]) result[serviceName][resourceName] = [];

        result[serviceName][resourceName].push(verb.replace('.ts', ''));
    };

    const walk = (currentPath) => {
        const files = fs.readdirSync(currentPath);

        files.forEach((file) => {
            const fullPath = path.join(currentPath, file);

            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                walk(fullPath);
            } else if (file.endsWith('.ts')) {
                traverse(fullPath);
            }
        });
    };

    walk(basePath);
    return result;
};

const API_DOC = generateAPIDocumentation(API_DIR);

const tsContent = `/**
 * 🚀 AUTO-GENERATED API DOCUMENTATION
 * 
 * This file is **automatically generated** by the API documentation script.
 * **DO NOT** modify this file manually, as changes will be overwritten.
 * 
 * ## Purpose:
 * - Provides a structured mapping of API endpoints based on the directory structure.
 * - Used for **query key generation**, **caching strategies**, and **API reference**.
 * - Helps maintain consistency and prevents hardcoded API keys.
 * 
 * ## How It Works:
 * - The script scans the \`api-clients/{service-name}/{resource-name}/schema/api-verbs/\` directory.
 * - Extracts \`{service-name}\`, \`{resource-name}\`, and \`{verb}.ts\` files.
 * - Generates a structured **API_DOC** constant.
 * 
 * ## Regenerate:
 * If you need to update this file, run:
 * 
 * \`\`\`sh
 * npm run api-doc
 * \`\`\`
 * 
 * 🚨 Any manual modifications will be lost on regeneration!
 */

export const API_DOC = ${JSON.stringify(API_DOC, null, 4)} as const;
export type APIDoc = typeof API_DOC;
`;
fs.writeFileSync(OUTPUT_PATH, tsContent);


console.log('✅ API Keys generated successfully!');
