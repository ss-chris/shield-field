import type { Record } from "jsforce";

export function stripAttributes<T extends Record>(obj: T): T {
  if (obj["attributes"]) {
    delete obj["attributes"];
    for (let key in obj) {
      if (typeof obj[key] === "object" && obj[key]?.["attributes"]) {
        stripAttributes(obj[key]);
      } else if (obj[key]?.records?.length && Array.isArray(obj[key].records)) {
        obj[key].records.forEach((record: any) => {
          if (typeof record === "object") {
            stripAttributes(record);
          }
        });
      }
    }
  }
  return obj;
}
