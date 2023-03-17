import { TrigintaManifest } from '../TrigintaManifest';

export declare type TerraformContext = {
  manifest: TrigintaManifest;
  outDir: string;
  zModuleDir: string;
  lambdasPath: string;
};
