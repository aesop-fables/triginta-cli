import arg from 'arg';
import { TrigintaCliOptions } from './index';

export function parseArgumentsIntoOptions(rawArgs: string[]): TrigintaCliOptions {
  const args = arg(
    {
      '--port': Number,
      '-p': '--port',
    },
    {
      argv: rawArgs.slice(2),
    },
  );

  const options: TrigintaCliOptions = {
    function: args._[0],
  };

  if (args['--port'] !== undefined) {
    options.port = args['--port'];
  }

  return options;
}
