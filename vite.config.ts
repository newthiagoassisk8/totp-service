import { defineConfig } from 'vite';
import { resolve } from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    plugins: [tsconfigPaths()],
    build: {
        lib: {
            entry: resolve(__dirname, 'src/server.ts'),
            formats: ['es'],
            fileName: 'server',
        },
        outDir: 'dist',
        ssr: true,
        rollupOptions: {
            external: [
                // Node.js built-ins
                'node:http',
                'node:https',
                'node:fs',
                'node:path',
                'node:url',
                'node:crypto',
                'node:stream',
                'node:buffer',
                'node:events',
                'node:util',

                // Dependencies (keep as external for serverless)
                'h3',
                'bcryptjs',
                'date-fns',
                'dotenv',
                'dotenv-expand',
                'drizzle-orm',
                'postgres',
                'totp-generator',
                'zod',
            ],
            output: {
                preserveModules: true,
                preserveModulesRoot: 'src',
                entryFileNames: '[name].js',
            },
        },
        minify: false,
        sourcemap: true,
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
        },
    },
});
