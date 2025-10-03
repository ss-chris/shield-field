import { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Calendar,
  Check,
  ChevronDown,
  Clock,
  LogOut,
  Map,
  Plus,
  User,
  X,
} from "lucide-react-native";

import TabViewHeader from "~/components/TabViewHeader";

const mapApplications = [
  { id: "system", label: "System Default" },
  { id: "apple", label: "Apple Maps" },
  { id: "google", label: "Google Maps" },
  { id: "waze", label: "Waze" },
];

export default function SettingsScreen() {
  const [selectedMapApp, setSelectedMapApp] = useState("system");
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [showPTOModal, setShowPTOModal] = useState(false);
  const [ptoRequests] = useState<any[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [loading] = useState(false);

  const handleSignOut = () => {
    console.log("Sign out");
  };

  const handleSubmitPTO = () => {
    if (!startDate || !endDate) return;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "#10B981";
      case "denied":
        return "#EF4444";
      default:
        return "#F59E0B";
    }
  };

  const handleMapAppSelect = (appId: string) => {
    setSelectedMapApp(appId);
    setShowMapPicker(false);
  };

  const getSelectedMapLabel = () => {
    return (
      mapApplications.find((app) => app.id === selectedMapApp)?.label ??
      "System Default"
    );
  };

  return (
    <>
      <View style={styles.container}>
        <TabViewHeader title="Me" subTitle="Manage your preferences and PTO" />
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.profileSection}>
            <View style={styles.profileCard}>
              <View style={styles.avatarContainer}>
                <User size={50} color="#666666" />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>John Technician</Text>
                <Text style={styles.profileEmail}>john.tech@example.com</Text>
              </View>
            </View>
          </View>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Map size={24} color="#4B9CE2" />
              <Text style={styles.sectionTitle}>Preferences</Text>
            </View>
            <TouchableOpacity
              style={styles.dropdownCard}
              onPress={() => setShowMapPicker(true)}
            >
              <View style={styles.dropdownInfo}>
                <Text style={styles.dropdownLabel}>Map Application</Text>
                <Text style={styles.dropdownValue}>
                  {getSelectedMapLabel()}
                </Text>
              </View>
              <ChevronDown size={24} color="#666666" />
            </TouchableOpacity>
          </View>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Clock size={24} color="#4B9CE2" />
              <Text style={styles.sectionTitle}>Hours</Text>
            </View>
            <TouchableOpacity
              style={styles.addPTOButton}
              onPress={() => setShowPTOModal(true)}
            >
              <Plus size={20} color="#4B9CE2" />
              <Text style={styles.addPTOButtonText}>Request Time Off</Text>
            </TouchableOpacity>
            {loading ? (
              <Text style={styles.loadingText}>Loading...</Text>
            ) : ptoRequests.length === 0 ? (
              <View style={styles.emptyState}>
                <Calendar size={48} color="#CCCCCC" />
                <Text style={styles.emptyStateText}>No PTO requests yet</Text>
              </View>
            ) : (
              ptoRequests.map((request) => (
                <View key={request.id} style={styles.ptoCard}>
                  <View style={styles.ptoCardContent}>
                    <View style={styles.ptoDateContainer}>
                      <Calendar size={20} color="#666666" />
                      <Text style={styles.ptoDate}>
                        {formatDate(request.start_date)} -{" "}
                        {formatDate(request.end_date)}
                      </Text>
                    </View>
                    {request.reason && (
                      <Text style={styles.ptoReason}>{request.reason}</Text>
                    )}
                  </View>
                  <View
                    style={[
                      styles.ptoStatusBadge,
                      { backgroundColor: getStatusColor(request.status) },
                    ]}
                  >
                    <Text style={styles.ptoStatusText}>{request.status}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
          <View style={styles.signOutContainer}>
            <TouchableOpacity
              style={styles.signOutButton}
              onPress={handleSignOut}
            >
              <LogOut size={20} color="#FFFFFF" />
              <Text style={styles.signOutButtonText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
      <Modal
        visible={showMapPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMapPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMapPicker(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Map Application</Text>
            </View>
            {mapApplications.map((app) => (
              <TouchableOpacity
                key={app.id}
                style={styles.modalOption}
                onPress={() => handleMapAppSelect(app.id)}
              >
                <Text style={styles.modalOptionText}>{app.label}</Text>
                {selectedMapApp === app.id && (
                  <Check size={24} color="#4B9CE2" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
      <Modal
        visible={showPTOModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPTOModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.ptoModalContent}>
            <View style={styles.ptoModalHeader}>
              <Text style={styles.modalTitle}>Request Time Off</Text>
              <TouchableOpacity onPress={() => setShowPTOModal(false)}>
                <X size={24} color="#666666" />
              </TouchableOpacity>
            </View>

            <View style={styles.ptoModalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Start Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={startDate}
                  onChangeText={setStartDate}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>End Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={endDate}
                  onChangeText={setEndDate}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Reason (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter reason for time off"
                  value={reason}
                  onChangeText={setReason}
                  multiline
                  numberOfLines={4}
                />
              </View>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmitPTO}
              >
                <Text style={styles.submitButtonText}>Submit Request</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileSection: {
    marginBottom: 32,
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 6,
  },
  profileEmail: {
    fontSize: 16,
    color: "#666666",
  },
  profileActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#E3F2FD",
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4B9CE2",
  },
  actionButtonSecondary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  actionButtonTextSecondary: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666666",
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  dropdownCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownInfo: {
    flex: 1,
  },
  dropdownLabel: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 6,
  },
  dropdownValue: {
    fontSize: 15,
    color: "#4B9CE2",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    width: "100%",
    maxWidth: 400,
    overflow: "hidden",
  },
  modalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalOptionText: {
    fontSize: 17,
    color: "#1A1A1A",
  },
  addPTOButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#4B9CE2",
    borderStyle: "dashed",
  },
  addPTOButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4B9CE2",
  },
  loadingText: {
    textAlign: "center",
    color: "#999999",
    fontSize: 15,
    padding: 20,
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 16,
    color: "#999999",
  },
  ptoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ptoCardContent: {
    flex: 1,
    marginRight: 12,
  },
  ptoDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  ptoDate: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  ptoReason: {
    fontSize: 14,
    color: "#666666",
    marginTop: 4,
  },
  ptoStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  ptoStatusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
    textTransform: "capitalize",
  },
  ptoModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    width: "100%",
    maxWidth: 400,
    overflow: "hidden",
  },
  ptoModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  ptoModalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#4B9CE2",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 10,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  signOutContainer: {
    padding: 20,
    paddingBottom: 30,
    backgroundColor: "#F5F7FA",
  },
  signOutButton: {
    backgroundColor: "#EF4444",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
