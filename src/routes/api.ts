import {Router} from 'express';
import bookingRouter, {p as bookingPath} from './BookingRouter';
import laundryRouter, {p as laundryPath} from './LaundryRouter';
import inventoryRouter, {p as inventoryPath} from './InventoryRouter';

// Init
const apiRouter = Router();

/*================================================
 Add api routes
================================================*/
apiRouter.use(bookingPath.basePath, bookingRouter);
apiRouter.use(laundryPath.basePath, laundryRouter);
apiRouter.use(inventoryPath.basePath, inventoryRouter);
// **** Export default **** //

export default apiRouter;
