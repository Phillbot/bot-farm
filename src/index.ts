import 'dotenv/config';
import 'reflect-metadata';

import container from '@config/inversify.config';

import { ExpressApp } from './server';

container.get<ExpressApp>(ExpressApp);
