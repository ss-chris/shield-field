import { db } from "@acme/db/client";

interface OperatingHoursRule {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
}

interface SchedulingPolicy {
  arrivalWindowTemplate: {
    stepMinutes: number;
    durationMinutes: number;
  };
  operatingHoursPolicy: {
    rules: OperatingHoursRule[];
  };
}

export class SchedulingService {
  /**
   * Rounds the given date/time to the nearest step interval based on scheduling policy
   */
  static roundToNearestStep(dateTime: Date, policy: SchedulingPolicy): Date {
    const { stepMinutes } = policy.arrivalWindowTemplate;

    // For simple step intervals (< 2 hours), use simple rounding
    if (stepMinutes < 120) {
      return this.roundToSimpleStep(dateTime, stepMinutes);
    }

    // For complex intervals (≥ 2 hours), use operating hours-based rounding
    return this.roundToOperatingHoursStep(dateTime, policy);
  }

  /**
   * Simple rounding for steps < 2 hours (e.g., 15, 30, 60 minutes)
   */
  private static roundToSimpleStep(dateTime: Date, stepMinutes: number): Date {
    const totalMinutes = dateTime.getHours() * 60 + dateTime.getMinutes();

    // If we're exactly on the interval, use that time
    if (totalMinutes % stepMinutes === 0) {
      const result = new Date(dateTime);
      result.setSeconds(0, 0);
      return result;
    }

    // Otherwise, round up to the next interval
    const roundedMinutes = Math.ceil(totalMinutes / stepMinutes) * stepMinutes;

    const result = new Date(dateTime);
    result.setHours(Math.floor(roundedMinutes / 60), roundedMinutes % 60, 0, 0);

    // Handle day overflow
    if (roundedMinutes >= 24 * 60) {
      result.setDate(result.getDate() + 1);
      result.setHours(0, 0, 0, 0);
    }

    return result;
  }

  /**
   * Complex rounding for steps ≥ 2 hours using operating hours start time
   */
  private static roundToOperatingHoursStep(
    dateTime: Date,
    policy: SchedulingPolicy,
  ): Date {
    const { stepMinutes } = policy.arrivalWindowTemplate;
    const dayOfWeek = dateTime.getDay() === 0 ? 7 : dateTime.getDay(); // Convert Sunday from 0 to 7

    // Find operating hours for current day
    const rule = policy.operatingHoursPolicy.rules.find(
      (r) => r.dayOfWeek === dayOfWeek,
    );

    if (!rule) {
      // Fallback to simple rounding if no operating hours found
      return this.roundToSimpleStep(dateTime, stepMinutes);
    }

    // Parse start time (HH:MM:SS format)
    const timeParts = rule.openTime.split(":").map(Number);
    const startHour = timeParts[0] ?? 0;
    const startMinute = timeParts[1] ?? 0;
    const startTimeMinutes = startHour * 60 + startMinute;

    const currentTimeMinutes = dateTime.getHours() * 60 + dateTime.getMinutes();

    // Calculate minutes since start time
    const minutesSinceStart = currentTimeMinutes - startTimeMinutes;

    // If we're before start time, return start time
    if (minutesSinceStart < 0) {
      const result = new Date(dateTime);
      result.setHours(startHour, startMinute, 0, 0);
      return result;
    }

    // If we're exactly on an interval, use that time
    if (minutesSinceStart % stepMinutes === 0) {
      const result = new Date(dateTime);
      result.setSeconds(0, 0);
      return result;
    }

    // Otherwise, round up to the next interval from start time
    const roundedIntervals = Math.ceil(minutesSinceStart / stepMinutes);
    const roundedMinutesFromStart = roundedIntervals * stepMinutes;
    const finalMinutes = startTimeMinutes + roundedMinutesFromStart;

    const result = new Date(dateTime);
    result.setHours(Math.floor(finalMinutes / 60), finalMinutes % 60, 0, 0);

    // Handle day overflow
    if (finalMinutes >= 24 * 60) {
      result.setDate(result.getDate() + 1);
      result.setHours(
        Math.floor((finalMinutes % (24 * 60)) / 60),
        (finalMinutes % (24 * 60)) % 60,
        0,
        0,
      );
    }

    return result;
  }

  /**
   * Get the next available slot based on current time and scheduling policy
   */
  static async getNextSlot(currentTime?: Date): Promise<{
    success: boolean;
    nextSlot?: Date;
  }> {
    const schedulingPolicy = await db.query.SchedulingPolicy.findFirst({
      with: {
        arrivalWindowTemplate: true,
        operatingHoursPolicy: {
          with: {
            rules: true,
          },
        },
      },
    });

    if (!schedulingPolicy) {
      return { success: false };
    }

    const now = currentTime ?? new Date();
    const nextSlot = this.roundToNearestStep(
      now,
      schedulingPolicy as SchedulingPolicy,
    );

    return {
      success: true,
      nextSlot,
    };
  }

  static async getSlots() {
    const schedulingPolicy = await db.query.SchedulingPolicy.findFirst({
      with: {
        arrivalWindowTemplate: true,
        operatingHoursPolicy: {
          with: {
            rules: true,
          },
        },
      },
    });

    if (!schedulingPolicy) {
      return { success: false, data: "No scheduling policy found." };
    }

    const nextSlot = await this.getNextSlot();
    if (!nextSlot.nextSlot) {
      return {
        success: false,
        data: "Unable to retrieve next slot with current date.",
      };
    }

    const maxLookDays = 14;
    let startDate = nextSlot.nextSlot;

    for (let day = 0; day < maxLookDays; day++) {
      const operatingHours = schedulingPolicy.operatingHoursPolicy.rules.filter(
        (ohp) => ohp.dayOfWeek === startDate.getDay(),
      );

      if (!operatingHours || operatingHours.length == 0) {
        break;
      }
      const dayRules = operatingHours[0];

      console.log(startDate.getTime());
    }

    return {
      success: true,
      data: {
        debugInfo: {
          nextSlot: nextSlot.nextSlot,
          currentTime: new Date(),
          policyUsed: schedulingPolicy,
        },
      },
    };
  }
}
