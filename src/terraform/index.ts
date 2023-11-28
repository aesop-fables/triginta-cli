import { TrigintaHttpMicroservice } from './TrigintaHttpMicroservice';
import { ITerraformMiddleware } from './ITerraformMiddleware';

export * from './TerraformTypes';
export * from './ITerraformMiddleware';

export function getTerraformMiddleware(name: string): ITerraformMiddleware {
  // TODO -- We'll come back and make this pluggable. For now, let's just prove out the generator, mmmkay pumpkin?
  // For future Josh: https://stateful.com/blog/build-a-plugin-system-with-node
  return new TrigintaHttpMicroservice();
}
