import { User } from '@server/react-clicker/middlewares/auth.middleware';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
