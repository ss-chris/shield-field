import { StyleSheet, Text, View } from "react-native";

export default function InventoryTab() {
  return (
    <View style={styles.container}>
      <Text>Tab</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
