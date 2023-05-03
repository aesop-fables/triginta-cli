import chalk from 'chalk';
import { IConfiguredRoute } from '@aesop-fables/triginta';
import express from 'express';
import http from 'http';
import { compileTrigintaConfig } from './compileTrigintaConfig';
import { TrigintaCliOptions, log } from './index';
import { ICommand } from './ICommand';
import { invokeAndAdaptHandler } from './invokeAndAdaptHandler';

export class LocalCommand implements ICommand {
  async execute(options: TrigintaCliOptions): Promise<void> {
    // Retrieve config from triginta config
    const { container, routes: routeRegistry } = await compileTrigintaConfig();

    // Create server
    const app = express();
    app.use(express.json());

    app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
      res.header(
        'Access-Control-Allow-Headers',
        'X-Requested-With, accepts, Authorization, content-type, Cache-Control',
      );
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Expose-Headers', 'content-type, content-length, etag, Cache-Control');
      next();
    });

    const routes = routeRegistry.allRoutes() as IConfiguredRoute[];
    log(chalk.white(`Evaluating routes`));
    for (let i = 0; i < routes.length; i++) {
      const configuredRoute = routes[i];
      log(chalk.gray(`  - Configured ${configuredRoute.method} ${configuredRoute.route}`));
      switch (configuredRoute.method.toLowerCase()) {
        case 'get':
          app.get(configuredRoute.route, async (req, res) =>
            invokeAndAdaptHandler(req, res, configuredRoute, container),
          );
          break;
        case 'post':
          app.post(configuredRoute.route, async (req, res) =>
            invokeAndAdaptHandler(req, res, configuredRoute, container),
          );
          break;
        case 'put':
          app.put(configuredRoute.route, async (req, res) =>
            invokeAndAdaptHandler(req, res, configuredRoute, container),
          );
          break;
        case 'delete':
          app.delete(configuredRoute.route, async (req, res) =>
            invokeAndAdaptHandler(req, res, configuredRoute, container),
          );
          break;
      }
    }

    log(chalk.white(`triginta listening on http://localhost:${options.port}`));
    const server = http.createServer(app);
    server.listen(options.port);
  }
}
