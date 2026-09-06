import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import attendanceRouter from "./attendance";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(attendanceRouter);

export default router;
