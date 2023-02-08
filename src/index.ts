import { createScriptTransformer } from './transform';

module.exports.cli = async function cli(args: string[]) {
    const transformer = await createScriptTransformer({
        cache: true,
        cacheDirectory: './triginta',
        haste: {},
        moduleFileExtensions: [],
        rootDir: './',
        transform: [['ts-jest', 'ts-jest', {
            '^.+\\.(t|j)s$': 'ts-jest',
        }]],
        transformIgnorePatterns: [],
        watchPathIgnorePatterns: [],
    });

    await transformer.loadTransformers();

    const shouldTransform = transformer.shouldTransform('./CreateTaskEndpoint.ts');
    console.log({
      shouldTransform,
    });

    const result = await transformer.transformAsync('./CreateTaskEndpoint.ts', {
        collectCoverage: false,
        collectCoverageFrom: ['./CreateTaskEndpoint.ts'],
        coverageProvider: 'v8',
        supportsDynamicImport: false,
        supportsExportNamespaceFrom: false,
        supportsStaticESM: false,
        supportsTopLevelAwait: false,
        isInternalModule: false,
    });

    console.log(result.code);
}
