import { ContainerModule, interfaces } from 'inversify';
import { ReactClickerBotRouter } from './react-clicker.router';

// TODO: Create common serve module

export const reactClickerServerModule = new ContainerModule((bind: interfaces.Bind) => {
  bind<ReactClickerBotRouter>(ReactClickerBotRouter).toSelf();
});
