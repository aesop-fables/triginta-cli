import { TerraformContext } from './TerraformTypes';

export interface ITerraformStrategy {
  execute(context: TerraformContext): Promise<void>;
}
