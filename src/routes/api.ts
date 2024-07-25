import {Router} from 'express';
import productRouter, {p as productPath} from './productRouter';

// Init
const apiRouter = Router();

/*================================================
 Add api routes
================================================*/
apiRouter.use(productPath.basePath, productRouter);
// **** Export default **** //

export default apiRouter;
