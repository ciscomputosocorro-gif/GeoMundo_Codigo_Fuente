import { Router, type IRouter } from "express";
import healthRouter from "./health";
import ratingRouter from "./rating";

const router: IRouter = Router();

router.use(healthRouter);
router.use(ratingRouter);

export default router;
