import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

import {
  insertAppointmentSchema,
  updateAppointmentSchema,
} from "@safestreets/db/schema";

import { appointmentFiltersInput } from "~/schema/appointment";
import AppointmentService from "~/service/appointment";

const appointmentService = new AppointmentService();

const appointmentRouter = new Hono()
  .get("/:id", async (c) => {
    const id = c.req.param("id");
    try {
      const appointment = await appointmentService.getAppointment(Number(id));
      return c.json({ data: appointment }, 200);
    } catch (error) {
      return c.json(
        { error: "Unable to fetch Appointment with id " + id },
        500,
      );
    }
  })

  .get("/", zValidator("query", appointmentFiltersInput), async (c) => {
    const filters = c.req.valid("query");

    console.log(process.env.PRIMARY_DATABASE_URL);

    try {
      const appointments = await appointmentService.listAppointments(filters);
      return c.json(
        {
          data: appointments,
          limit: filters.limit,
          offset: filters.offset,
        },
        200,
      );
    } catch (error) {
      console.error("list Appointments failed ", error);
      return c.json({ error: "Unable to fetch Appointments - " + error }, 500);
    }
  })

  .post("/", zValidator("json", insertAppointmentSchema), async (c) => {
    const appointment = c.req.valid("json");

    try {
      const result = await appointmentService.createAppointment(appointment);
      return c.json({ data: result }, 200);
    } catch (error) {
      console.error("create Appointment failed", error);
      return c.json({ error: "Unable to create Appointment: " + error }, 500);
    }
  })

  .patch("/:id", zValidator("json", updateAppointmentSchema), async (c) => {
    const appointmentInput = c.req.valid("json");
    const id = c.req.param("id");

    try {
      const result = await appointmentService.updateAppointment(
        appointmentInput,
        Number(id),
      );

      return c.json({ data: result });
    } catch (error) {
      console.error("get Appointment failed ", error);
      return c.json({ error: "Unable to update Appointment" }, 500);
    }
  });

export default appointmentRouter;
