import type { LegendListRef, LegendListRenderItemProps } from "@legendapp/list";
import { useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { LegendList } from "@legendapp/list";
import { use$ } from "@legendapp/state/react";
import dayjs from "dayjs";

import type { Appointment } from "~/app.types";
import { AppointmentCard } from "~/components/AppointmentCard";
import HorizontalDateSelector from "~/components/HorizontalDateSelector";
import TabViewHeader from "~/components/TabViewHeader";
import appointments from "~/resources/mockAppointments.json";
import { appointment$ } from "~/state/appointments";

export default function AppointmentsTab() {
  const listRef = useRef<LegendListRef | null>(null);

  const renderItem = ({ item }: LegendListRenderItemProps<Appointment>) => {
    return <AppointmentCard appointment={item} />;
  };

  const selectedDateOffset = use$(appointment$.selectedDateOffset);

  const data = appointments.filter(
    (apt) =>
      dayjs(apt.startTime).format("YYYY-MM-DD") ===
      dayjs().add(selectedDateOffset, "days").format("YYYY-MM-DD"),
  );

  return (
    <View style={styles.container}>
      <TabViewHeader
        title="Appointments"
        subTitle={appointments.length + ` Upcoming`}
      >
        <HorizontalDateSelector />
      </TabViewHeader>
      <View style={styles.content}>
        {data.length ? (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedDateOffset === 0
                ? "Today's"
                : selectedDateOffset < 0
                  ? "Past"
                  : "Upcoming"}{" "}
              Appointments
            </Text>
            {selectedDateOffset === 0 && (
              <Text style={styles.appointmentCount}>37 min til next</Text>
            )}
          </View>
        ) : (
          <Text style={styles.sectionTitle}>No appointments on this day</Text>
        )}
        <View style={styles.container}>
          <LegendList
            data={data}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            recycleItems={true}
            maintainVisibleContentPosition
            ref={listRef}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    backgroundColor: "#4B9CE2",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginVertical: 18,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    color: "#FFFFFF",
    opacity: 0.9,
  },
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
  content: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  appointmentCount: {
    fontSize: 14,
    color: "#999999",
  },
});
