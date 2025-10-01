import { and, eq } from "drizzle-orm";

import type {
  InsertAppointment,
  UpdateAppointment,
} from "@safestreets/db/schema";
import { db } from "@safestreets/db/client";
import { appointment } from "@safestreets/db/schema";

import type { appointmentFilters } from "../schema/appointment";

class AppointmentService {
  async listAppointments(filters: appointmentFilters) {
    let conditions = [];
    if (filters.id) {
      conditions.push(eq(appointment.id, filters.id));
    }

    return db.query.appointment.findMany({
      limit: filters.limit ?? 50,
      offset: filters.offset ?? 0,
      where: and(...conditions),
    });
  }

  async getAppointment(id: number) {
    const [result] = await db
      .select()
      .from(appointment)
      .where(eq(appointment.id, id));

    if (!result) {
      throw new Error(`Appointment with id ${id} not found`);
    }

    return result;
  }

  async createAppointment(a: InsertAppointment) {
    const [result] = await db.insert(appointment).values(a).returning();
    return result;
  }

  async updateAppointment(a: UpdateAppointment, id: number) {
    const [result] = await db
      .update(appointment)
      .set(a)
      .where(eq(appointment.id, id))
      .returning();

    if (!result) {
      throw new Error(`Appointment with id ${id} not found`);
    }

    return result;
  }
}

export default AppointmentService;
