import { observable } from "@legendapp/state";

interface Preferences {
  mappingApp: "system" | "apple" | "google" | "waze";
}

export const preference$ = observable<Preferences>({
  mappingApp: "system",
});
