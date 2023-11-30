import { ICommand } from './ICommand';
import { SyncFunction } from './SyncFunction';
import { getTerraformMiddleware } from './terraform';

export class TerraformCommand implements ICommand {
  async execute(): Promise<void> {
    const manifest = await SyncFunction.execute();

    const middleware = getTerraformMiddleware(manifest.middleware);
    await middleware.execute(manifest);
  }
}
