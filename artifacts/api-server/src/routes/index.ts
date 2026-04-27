import { Router, type IRouter } from "express";
import healthRouter from "./health";
import servicesRouter from "./services";
import stylistsRouter from "./stylists";
import availabilityRouter from "./availability";
import appointmentsRouter from "./appointments";
import dashboardRouter from "./dashboard";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(servicesRouter);
router.use(stylistsRouter);
router.use(availabilityRouter);
router.use(appointmentsRouter);
router.use(dashboardRouter);
router.use(authRouter);

export default router;
