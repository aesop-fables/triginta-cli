import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import * as ts from 'typescript';
import { TrigintaConfig } from '@aesop-fables/triginta';

const CWD = process.cwd();
const TRIGINTA_CONFIG = 'triginta.config';
const TRIGINTA_CONFIG_FILE = `./src/${TRIGINTA_CONFIG}.ts`;
const TRIGINTA_CONFIG_PATH = path.join(CWD, TRIGINTA_CONFIG_FILE);
const TSCONFIG__FILE = 'tsconfig.json';
const TSCONFIG_PATH = path.join(CWD, TSCONFIG__FILE);
const log = console.log;

export async function compileTrigintaConfig() {
  // Verify triginta config file exists
  if (!fs.existsSync(TRIGINTA_CONFIG_PATH)) {
    log(chalk.red(`Error `, chalk.white(`${TRIGINTA_CONFIG_PATH} not found.`)));
    // throw new Error('Please create a triginta configuration file.')
  }

  let compilerOptions: ts.CompilerOptions;
  if (fs.existsSync(TSCONFIG_PATH)) {
    log(chalk.cyan(`info `, chalk.white(`Using tsconfig: ${TSCONFIG_PATH}`)));
    compilerOptions = require(TSCONFIG_PATH).compilerOptions as ts.CompilerOptions;
  } else {
    log(
      chalk.cyan(
        `info `,
        chalk.white(`Using default TS compiler options. Consider creating a tsconfig.json file instead`),
      ),
    );
    compilerOptions = {
      target:
        ts.ScriptTarget
          .ES2016 /* Set the JavaScript language version for emitted JavaScript and include compatible library declarations. */,
      lib: [
        'DOM',
        'ESNext',
      ] /* Specify a set of bundled library declaration files that describe the target runtime environment. */,
      experimentalDecorators: true /* Enable experimental support for TC39 stage 2 draft decorators. */,
      emitDecoratorMetadata: true /* Emit design-type metadata for decorated declarations in source files. */,
      module: ts.ModuleKind.CommonJS /* Specify what module code is generated. */,
      rootDir: 'src' /* Specify the root folder within your source files. */,
      declaration: true /* Generate .d.ts files from TypeScript and JavaScript files in your project. */,
      outDir: 'lib' /* Specify an output folder for all emitted files. */,
      forceConsistentCasingInFileNames: true /* Ensure that casing is correct in imports. */,
      strict: true /* Enable all strict type-checking options. */,
      skipLibCheck: true /* Skip type checking all .d.ts files. */,
    };
  }

  // Compile directory
  const code = fs.readFileSync(TRIGINTA_CONFIG_PATH, 'utf-8');

  const sourceFile = ts.createSourceFile(TRIGINTA_CONFIG_FILE, code, ts.ScriptTarget.Latest);

  const defaultCompilerHost = ts.createCompilerHost({});

  const customCompilerHost: ts.CompilerHost = {
    getSourceFile: (name, languageVersion) => {
      if (name === TRIGINTA_CONFIG_FILE) {
        return sourceFile;
      } else {
        return defaultCompilerHost.getSourceFile(name, languageVersion);
      }
    },
    writeFile: (filename, data) => {
      fs.writeFileSync(filename, data, 'utf-8');
    },
    getDefaultLibFileName: () => 'lib.d.ts',
    useCaseSensitiveFileNames: () => false,
    getCanonicalFileName: (filename) => filename,
    getCurrentDirectory: () => '',
    getNewLine: () => '\n',
    getDirectories: () => [],
    fileExists: () => true,
    readFile: () => '',
  };

  const program = ts.createProgram([TRIGINTA_CONFIG_FILE], compilerOptions, customCompilerHost);

  const outDir = compilerOptions.outDir ? path.join(CWD, compilerOptions.outDir) : path.join(CWD, './lib');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir);
  }

  program.emit();

  log(chalk.green(`success `, chalk.white(`Compiled typescript to ${outDir}`)));

  // Retrieve config from triginta config
  const config = require(path.join(outDir, `${TRIGINTA_CONFIG}.js`)) as TrigintaConfig;
  return config;
}
