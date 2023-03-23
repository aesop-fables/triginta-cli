import 'reflect-metadata';
import chalk from 'chalk';
import path from 'path';
import { SyncCommand } from './SyncCommand';
import { InitCommand } from './InitCommand';
import { LocalCommand } from './LocalCommand';
import { ICommand } from './ICommand';
import { parseArgumentsIntoOptions } from './parseArgumentsIntoOptions';
import { TerraformCommand } from './TerraformCommand';
export const log = console.log;

const { version } = require(path.join(__dirname, '../package.json')) as { version: string };

export interface TrigintaCliOptions {
  function?: string;
  port?: number;
}

module.exports.cli = async function cli(args: string[]) {
  log(chalk.white.bold(`triginta ${version}`));
  const cliOptions = {
    port: 3002,
    ...parseArgumentsIntoOptions(args),
  };

  let command: ICommand | undefined;
  if (cliOptions.function === 'local') {
    command = new LocalCommand();
  }
  if (cliOptions.function === 'init') {
    command = new InitCommand();
  } else if (cliOptions.function === 'sync') {
    // regenerate the manifest file (the single source of truth)
    command = new SyncCommand();
  } else if (cliOptions.function === 'tf') {
    // regenerate the manifest file (the single source of truth)
    command = new TerraformCommand();
  }

  if (!command) {
    log(chalk.red('Invalid command.'));
    log(chalk.grey('Example usage: triginta local [--port 3002]'));
    return;
  }

  await command.execute(cliOptions);
};
