import { TrigintaCliOptions } from './index';

export interface ICommand {
  execute(options: TrigintaCliOptions): Promise<void>;
}
