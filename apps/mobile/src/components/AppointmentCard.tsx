import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Clock, MapPin, Phone, Wrench } from "lucide-react-native";

import type { Appointment } from "~/app.types";
import { formatAppointmentTime } from "~/utils/datetime";

interface AppointmentCardProps {
  appointment: Appointment;
}

export function AppointmentCard({ appointment }: AppointmentCardProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => {
        router.push(`/appointment/${appointment.id}`);
      }}
    >
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.clientInfo}>
            <View style={styles.nameContainer}>
              <Text style={styles.clientName}>
                {appointment.firstName} {appointment.lastName.charAt(0)}
              </Text>
              <Text style={styles.serviceType}>{appointment.kind}</Text>
            </View>
          </View>
        </View>
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Clock size={20} color="#4B9CE2" />
            <Text style={styles.detailText}>
              {formatAppointmentTime(
                appointment.startTime,
                appointment.duration,
              )}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <MapPin size={20} color="#4B9CE2" />
            <Text style={styles.detailText}>
              {appointment.address}, {appointment.city}
            </Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.outlinedButton}
              onPress={async () => {
                await Linking.openURL(`tel:${appointment.phoneNumber}`);
              }}
            >
              <Phone size={18} color="#4B9CE2" />
              <Text style={styles.outlinedButtonText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.outlinedButton}
              onPress={() => {
                // ...
              }}
            >
              <Wrench size={18} color="#4B9CE2" />
              <Text style={styles.outlinedButtonText}>Navigate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  clientInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  nameContainer: {
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  serviceType: {
    fontSize: 14,
    color: "#666666",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusCompleted: {
    backgroundColor: "#E8F5E9",
  },
  statusScheduled: {
    backgroundColor: "#E3F2FD",
  },
  statusPending: {
    backgroundColor: "#FFF3E0",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  details: {
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  detailText: {
    fontSize: 14,
    color: "#333333",
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  outlinedButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    flex: 1,
    justifyContent: "center",
  },
  outlinedButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B9CE2",
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "#4B9CE2",
    flex: 1,
    justifyContent: "center",
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
