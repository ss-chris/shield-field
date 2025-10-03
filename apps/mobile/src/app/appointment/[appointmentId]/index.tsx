import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Calendar,
  ChevronLeft,
  Clock,
  MapPin,
  Phone,
  User,
  Wrench,
} from "lucide-react-native";

import appointments from "~/resources/mockAppointments.json";
import { formatAppointmentTime } from "~/utils/datetime";

export default function AppointmentDetailScreen() {
  const { appointmentId } = useLocalSearchParams<{ appointmentId: string }>();
  const appointment = appointments.find((apt) => apt.id === appointmentId);
  const router = useRouter();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleCall = async () => {
    if (appointment?.phoneNumber) {
      await Linking.openURL(`tel:${appointment.phoneNumber}`);
    }
  };

  const handleNavigate = async () => {
    if (appointment?.address) {
      const encodedAddress = encodeURIComponent(appointment.address);
      await Linking.openURL(`https://maps.google.com/?q=${encodedAddress}`);
    }
  };

  if (!appointment) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ChevronLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Appointment Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.content}>
          <Text style={styles.errorText}>Appointment not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Appointment Details</Text>
        <View style={styles.placeholder} />
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.statusCard]}>
          <Calendar size={24} color={"red"} />
          <View style={styles.statusInfo}>
            <Text style={styles.statusLabel}>IN PROGRESS</Text>
            <Text style={styles.appointmentId}>
              Appointment ID: {`APT-${appointment.id.slice(0, 8)}`}
            </Text>
          </View>
        </View>
        <View style={styles.clientSection}>
          <View style={styles.avatarContainer}>
            <User size={40} color="#666666" />
          </View>
          <View style={styles.clientInfo}>
            <Text style={styles.clientName}>
              {appointment.firstName} {appointment.lastName}
            </Text>
            <Text style={styles.serviceType}>IN PROGRESS</Text>
          </View>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCall}
            disabled={!appointment.phoneNumber}
          >
            <Phone size={20} color="#4B9CE2" />
            <Text style={styles.actionButtonText}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButtonPrimary}
            onPress={handleNavigate}
          >
            <MapPin size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonTextPrimary}>Navigate</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appointment Information</Text>
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Calendar size={20} color="#666666" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>
                {formatDate(appointment.startTime)}
              </Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Clock size={20} color="#666666" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Time</Text>
              <Text style={styles.infoValue}>
                {formatAppointmentTime(
                  appointment.startTime,
                  appointment.duration,
                )}
              </Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <MapPin size={20} color="#666666" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue}>{appointment.address}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Wrench size={20} color="#666666" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Priority</Text>
              <Text style={styles.infoValue}>HIGH</Text>
            </View>
          </View>
        </View>
        {/*{appointment.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Appointment Notes</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesLabel}>Customer Notes</Text>
              <Text style={styles.notesText}>{appointment.notes}</Text>
            </View>
          </View>
        )}*/}
      </ScrollView>
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
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingText: {
    textAlign: "center",
    color: "#999999",
    marginTop: 40,
  },
  errorText: {
    textAlign: "center",
    color: "#999999",
    marginTop: 40,
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderLeftWidth: 6,
    marginBottom: 20,
  },
  statusInfo: {
    marginLeft: 16,
    flex: 1,
  },
  statusLabel: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  appointmentId: {
    fontSize: 14,
    color: "#666666",
  },
  clientSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  serviceType: {
    fontSize: 16,
    color: "#666666",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: "#E3F2FD",
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4B9CE2",
  },
  actionButtonPrimary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: "#4CAF50",
  },
  actionButtonTextPrimary: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 16,
  },
  infoRow: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  notesCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666666",
    marginBottom: 8,
  },
  notesText: {
    fontSize: 15,
    color: "#333333",
    lineHeight: 22,
  },
});
