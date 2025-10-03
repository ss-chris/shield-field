import dayjs from "dayjs";

export function formatAppointmentTime(startTime: string, duration: number) {
  return `${dayjs(startTime).format("h:mma")} — ${dayjs(startTime).add(duration, "hours").format("h:mma")}`;
}
