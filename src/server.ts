import { buildApp } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';

const app = buildApp();

app.listen(env.PORT, () => {
  logger.info(`Servidor local corriendo en http://localhost:${env.PORT}`);
});
