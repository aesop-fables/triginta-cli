/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as path from 'path';
import micromatch = require('micromatch');
import {escapePathForRegex} from 'jest-regex-util';
import {globsToMatcher, replacePathSepForGlob} from 'jest-util';
import type {ProjectConfig, ShouldInstrumentOptions} from './types';

const MOCKS_PATTERN = new RegExp(
  escapePathForRegex(`${path.sep}__mocks__${path.sep}`),
);

const cachedRegexes = new Map<string, RegExp>();
const getRegex = (regexStr: string) => {
  if (!cachedRegexes.has(regexStr)) {
    cachedRegexes.set(regexStr, new RegExp(regexStr));
  }

  const regex = cachedRegexes.get(regexStr)!;

  // prevent stateful regexes from breaking, just in case
  regex.lastIndex = 0;

  return regex;
};
