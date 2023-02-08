/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {EncodedSourceMap} from '@jridgewell/trace-mapping';
import type {Config, TransformTypes} from '@jest/types';

export interface ShouldInstrumentOptions
  extends Pick<
    Config.GlobalConfig,
    'collectCoverage' | 'collectCoverageFrom' | 'coverageProvider'
  > {
  changedFiles?: Set<string>;
  sourcesRelatedToTestsInChangedFiles?: Set<string>;
}

export interface Options
  extends ShouldInstrumentOptions,
    CallerTransformOptions {
  isInternalModule?: boolean;
}

// `babel` and `@jridgewell/trace-mapping` disagrees - `number` vs `3`
export interface FixedRawSourceMap extends Omit<EncodedSourceMap, 'version'> {
  version: number;
}

export type TransformedSource = {
  code: string;
  map?: FixedRawSourceMap | string | null;
};

export type TransformResult = TransformTypes.TransformResult;

export interface CallerTransformOptions {
  // names are copied from babel: https://babeljs.io/docs/en/options#caller
  supportsDynamicImport: boolean;
  supportsExportNamespaceFrom: boolean;
  supportsStaticESM: boolean;
  supportsTopLevelAwait: boolean;
}

export interface ReducedTransformOptions extends CallerTransformOptions {
  instrument: boolean;
}

export interface RequireAndTranspileModuleOptions
  extends ReducedTransformOptions {
  applyInteropRequireDefault: boolean;
}

export type StringMap = Map<string, string>;

export interface TransformOptions<TransformerConfig = unknown>
  extends ReducedTransformOptions {
  /** Cached file system which is used by `jest-runtime` to improve performance. */
  cacheFS: StringMap;
  /** Jest configuration of currently running project. */
  config: ProjectConfig;
  /** Stringified version of the `config` - useful in cache busting. */
  configString: string;
  /** Transformer configuration passed through `transform` option by the user. */
  transformerConfig: TransformerConfig;
}

export interface SyncTransformer<TransformerConfig = unknown> {
  /**
   * Indicates if the transformer is capable of instrumenting the code for code coverage.
   *
   * If V8 coverage is _not_ active, and this is `true`, Jest will assume the code is instrumented.
   * If V8 coverage is _not_ active, and this is `false`. Jest will instrument the code returned by this transformer using Babel.
   */
  canInstrument?: boolean;

  getCacheKey?: (
    sourceText: string,
    sourcePath: string,
    options: TransformOptions<TransformerConfig>,
  ) => string;

  getCacheKeyAsync?: (
    sourceText: string,
    sourcePath: string,
    options: TransformOptions<TransformerConfig>,
  ) => Promise<string>;

  process: (
    sourceText: string,
    sourcePath: string,
    options: TransformOptions<TransformerConfig>,
  ) => TransformedSource;

  processAsync?: (
    sourceText: string,
    sourcePath: string,
    options: TransformOptions<TransformerConfig>,
  ) => Promise<TransformedSource>;
}

export interface AsyncTransformer<TransformerConfig = unknown> {
  /**
   * Indicates if the transformer is capable of instrumenting the code for code coverage.
   *
   * If V8 coverage is _not_ active, and this is `true`, Jest will assume the code is instrumented.
   * If V8 coverage is _not_ active, and this is `false`. Jest will instrument the code returned by this transformer using Babel.
   */
  canInstrument?: boolean;

  getCacheKey?: (
    sourceText: string,
    sourcePath: string,
    options: TransformOptions<TransformerConfig>,
  ) => string;

  getCacheKeyAsync?: (
    sourceText: string,
    sourcePath: string,
    options: TransformOptions<TransformerConfig>,
  ) => Promise<string>;

  process?: (
    sourceText: string,
    sourcePath: string,
    options: TransformOptions<TransformerConfig>,
  ) => TransformedSource;

  processAsync: (
    sourceText: string,
    sourcePath: string,
    options: TransformOptions<TransformerConfig>,
  ) => Promise<TransformedSource>;
}

/**
 * We have both sync (`process`) and async (`processAsync`) code transformation, which both can be provided.
 * `require` will always use `process`, and `import` will use `processAsync` if it exists, otherwise fall back to `process`.
 * Meaning, if you use `import` exclusively you do not need `process`, but in most cases supplying both makes sense:
 * Jest transpiles on demand rather than ahead of time, so the sync one needs to exist.
 *
 * For more info on the sync vs async model, see https://jestjs.io/docs/code-transformation#writing-custom-transformers
 */
export type Transformer<TransformerConfig = unknown> =
  | SyncTransformer<TransformerConfig>
  | AsyncTransformer<TransformerConfig>;

export type TransformerCreator<
  X extends Transformer<TransformerConfig>,
  TransformerConfig = unknown,
> = (transformerConfig?: TransformerConfig) => X | Promise<X>;

/**
 * Instead of having your custom transformer implement the Transformer interface
 * directly, you can choose to export a factory function to dynamically create
 * transformers. This is to allow having a transformer config in your jest config.
 */
export type TransformerFactory<X extends Transformer> = {
  createTransformer: TransformerCreator<X>;
};

export type HasteConfig = {
  /** Whether to hash files using SHA-1. */
  computeSha1?: boolean;
  /** The platform to use as the default, e.g. 'ios'. */
  defaultPlatform?: string | null;
  /** Force use of Node's `fs` APIs rather than shelling out to `find` */
  forceNodeFilesystemAPI?: boolean;
  /**
   * Whether to follow symlinks when crawling for files.
   *   This options cannot be used in projects which use watchman.
   *   Projects with `watchman` set to true will error if this option is set to true.
   */
  enableSymlinks?: boolean;
  /** string to a custom implementation of Haste. */
  hasteImplModulePath?: string;
  /** All platforms to target, e.g ['ios', 'android']. */
  platforms?: Array<string>;
  /** Whether to throw on error on module collision. */
  throwOnModuleCollision?: boolean;
  /** Custom HasteMap module */
  hasteMapModulePath?: string;
  /** Whether to retain all files, allowing e.g. search for tests in `node_modules`. */
  retainAllFiles?: boolean;
};

export type ProjectConfig = {
  cache: boolean;
  cacheDirectory: string;
  haste: HasteConfig;
  moduleFileExtensions: Array<string>;
  rootDir: string;
  transform: Array<[string, string, Record<string, unknown>]>;
  transformIgnorePatterns: Array<string>;
  watchPathIgnorePatterns: Array<string>;
};
