import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { use$ } from "@legendapp/state/react";

import { appointment$ } from "~/state/appointments";

export default function HorizontalDateSelector() {
  const selectedDateOffset = use$(appointment$.selectedDateOffset);

  const getWeekDays = () => {
    const today = new Date();
    const days = [];

    for (let i = 0; i <= 10; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
      const dayNumber = date.getDate();

      if (i === 10) {
        days.push({
          id: "view-more",
          name: "View",
          number: "More",
          offset: i,
          isToday: false,
          isViewMore: true,
        });
      } else {
        days.push({
          id: `${dayName.toLowerCase()}-${dayNumber}`,
          name: dayName,
          number: dayNumber,
          offset: i,
          isToday: i === 0,
          isViewMore: false,
        });
      }
    }

    return days;
  };

  const weekDays = getWeekDays();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.dateScroll}
      contentContainerStyle={styles.dateScrollContent}
    >
      {weekDays.map((day) => (
        <TouchableOpacity
          key={day.id}
          style={[
            styles.dateButton,
            selectedDateOffset === day.offset && styles.dateButtonActive,
            day.isViewMore && styles.viewMoreButton,
          ]}
          onPress={() => {
            if (day.isViewMore) {
              Alert.alert("View More", "Load additional appointments");
            } else {
              appointment$.selectedDateOffset.set(day.offset);
            }
          }}
        >
          <Text
            style={[
              styles.dateDay,
              selectedDateOffset === day.offset && styles.dateDayActive,
              day.isViewMore && styles.viewMoreText,
            ]}
          >
            {day.name}
          </Text>
          <Text
            style={[
              styles.dateNumber,
              selectedDateOffset === day.offset && styles.dateNumberActive,
              day.isViewMore && styles.viewMoreText,
            ]}
          >
            {day.number}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  dateScroll: {
    marginHorizontal: -20,
  },
  dateScrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  dateButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    minWidth: 80,
    alignItems: "center",
  },
  dateButtonActive: {
    backgroundColor: "#FFFFFF",
  },
  dateDay: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.9,
    marginBottom: 4,
  },
  dateDayActive: {
    color: "#4B9CE2",
    opacity: 1,
  },
  dateNumber: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  dateNumberActive: {
    color: "#4B9CE2",
  },
  viewMoreButton: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  viewMoreText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
