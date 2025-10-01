import { Hono } from "hono";

import { SchedulingService } from "../service/scheduling";

// ----- Slots Routes -------------- //

const schedulingRouter = new Hono()

  .get("/slots", async (c) => {
    const slots = await SchedulingService.getSlots();
    return c.json({ slots });
  })

  .get("/next-slot", async (c) => {
    const timeParam = c.req.query("time");
    const testTime = timeParam ? new Date(timeParam) : undefined;
    const result = await SchedulingService.getNextSlot(testTime);
    return c.json(result);
  });

export default schedulingRouter;
