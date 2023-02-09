// import { createScriptTransformer } from './transform';
import fs from 'fs';
import path from 'path';
import * as ts from 'typescript';
import { IConfiguredRoute } from '@aesop-fables/triginta/lib/IConfiguredRoute';
import express from 'express';
import http from 'http';
import { invokeHttpHandler } from '@aesop-fables/triginta';
import { IServiceContainer } from '@aesop-fables/containr';


const CWD = process.cwd();

module.exports.cli = async function cli(args: string[]) {
    // const transformer = await createScriptTransformer({
    //     cache: true,
    //     cacheDirectory: './triginta',
    //     haste: {},
    //     moduleFileExtensions: [],
    //     rootDir: './',
    //     transform: [['ts-jest', 'ts-jest', {
    //         '^.+\\.(t|j)s$': 'ts-jest',
    //     }]],
    //     transformIgnorePatterns: [],
    //     watchPathIgnorePatterns: [],
    // });

    // await transformer.loadTransformers();

    // const shouldTransform = transformer.shouldTransform('./CreateTaskEndpoint.ts');
    // console.log({
    //   shouldTransform,
    // });

    // const result = await transformer.transformAsync('./CreateTaskEndpoint.ts', {
    //     collectCoverage: false,
    //     collectCoverageFrom: ['./CreateTaskEndpoint.ts'],
    //     coverageProvider: 'v8',
    //     supportsDynamicImport: false,
    //     supportsExportNamespaceFrom: false,
    //     supportsStaticESM: false,
    //     supportsTopLevelAwait: false,
    //     isInternalModule: false,
    // });

    // console.log(result.code);
    // const compiler = new TypeScriptTestFileCompiler();
    
    
    // compiler.compile(code, './src/CreateTaskEndpoint.ts');
    const filename = "./src/index.ts";
    const code = fs.readFileSync(filename, 'utf-8');
    // const code = `const test: number = 1 + 2;`;

    const sourceFile = ts.createSourceFile(
        filename, code, ts.ScriptTarget.Latest
    );

    const defaultCompilerHost = ts.createCompilerHost({});

    const customCompilerHost: ts.CompilerHost = {
        getSourceFile: (name, languageVersion) => {
            console.log(`getSourceFile ${name}`);

            if (name === filename) {
                return sourceFile;
            } else {
                return defaultCompilerHost.getSourceFile(
                    name, languageVersion
                );
            }
        },
        writeFile: (filename, data) => {
            console.log('writing file...', filename);
            fs.writeFileSync(filename, data, 'utf-8');
        },
        getDefaultLibFileName: () => "lib.d.ts",
        useCaseSensitiveFileNames: () => false,
        getCanonicalFileName: filename => filename,
        getCurrentDirectory: () => "",
        getNewLine: () => "\n",
        getDirectories: () => [],
        fileExists: () => true,
        readFile: () => ""
    };

    const opts = {
        "target": ts.ScriptTarget.ES2016 /* Set the JavaScript language version for emitted JavaScript and include compatible library declarations. */,
        "lib": ["DOM", "ESNext"],                                        /* Specify a set of bundled library declaration files that describe the target runtime environment. */
        "experimentalDecorators": true,                   /* Enable experimental support for TC39 stage 2 draft decorators. */
        "emitDecoratorMetadata": true,                    /* Emit design-type metadata for decorated declarations in source files. */
        "module": ts.ModuleKind.CommonJS /* Specify what module code is generated. */,
        "rootDir": "src" /* Specify the root folder within your source files. */,
        "declaration": true /* Generate .d.ts files from TypeScript and JavaScript files in your project. */,
        "outDir": "lib" /* Specify an output folder for all emitted files. */,
        "forceConsistentCasingInFileNames": true /* Ensure that casing is correct in imports. */,
        "strict": true /* Enable all strict type-checking options. */,
        "skipLibCheck": true /* Skip type checking all .d.ts files. */
      };
    const program = ts.createProgram(
        [filename], opts, customCompilerHost
    );

    if (!fs.existsSync(opts.outDir)) {
        fs.mkdirSync(opts.outDir);
    }

    // NOTE: The first argument of emit() is a source file to be compiled. If it's undefined, all files in
    // <program> will be compiled. <program> contains a file specified in createProgram() plus all its dependencies.
    // This mode is much faster than compiling files one-by-one, and it is used in the tsc CLI compiler.
    program.emit();

    // Now that it's compiled, let's evaluate all of the files
    const { container: rawContainer, RouteRegistry } = require(path.join(CWD, './lib/index.js'));
    const container = rawContainer as IServiceContainer;
    // const { endpoint } = require(path.join(CWD, './lib/CreateTaskEndpoint.js'));

    // console.log(handler);
    // try {
    //     console.log('attempting to warm up...');
    //     handler({});
    // } catch (e) {
    //     console.log('Error warming up!', e);
    // }

    // console.log(RouteRegistry.allRoutes());

    // console.log(RouteRegistry.allRoutes());

    const routes = RouteRegistry.allRoutes() as IConfiguredRoute[];
    console.log(routes);
    for (let i = 0; i < routes.length; i++) {
        const configuredRoute = routes[i];
        console.log(`Found configuredRoute: ${configuredRoute.method} ${configuredRoute.route}`);
    }

    const options = {
    port: 3002,
    ...opts,
    };

    const app = express();
    app.use(express.json());

    // app.options('*', cors());

    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
        res.header('Access-Control-Allow-Headers', 'X-Requested-With, accepts, Authorization, content-type, Cache-Control');
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Expose-Headers', 'content-type, content-length, etag, Cache-Control');
        next();
    });

    for (let i = 0; i < routes.length; i++) {
        const configuredRoute = routes[i];
        if (configuredRoute.method === 'post') {
            app.post(configuredRoute.route, async (req, res) => {
                const response = await invokeHttpHandler({
                    configuredRoute,
                    container,
                    path: req.path,
                    body: req.body,
                });

                console.log('GOT SOMETHING!', response);

                res.sendStatus(200);
            });
        }

        if (configuredRoute.method === 'get') {
            app.get(configuredRoute.route, async (req, res) => {
                const response = await invokeHttpHandler({
                    configuredRoute,
                    container,
                    path: req.path,
                    body: req.body,
                });

                console.log('GOT SOMETHING!', response);

                res.sendStatus(200);
            });
        }
    }

    console.log(`triginta listening at http://localhost:${options.port}`)
    const server = http.createServer(app);
    server.listen(options.port);
}
