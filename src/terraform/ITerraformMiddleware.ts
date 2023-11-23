import { TrigintaManifest } from '../TrigintaManifest';

export interface ITerraformMiddleware {
  execute(manifest: TrigintaManifest): Promise<void>;
}
