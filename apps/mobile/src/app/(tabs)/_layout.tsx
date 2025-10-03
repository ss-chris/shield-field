import { Platform } from "react-native";
import {
  Icon,
  Label,
  NativeTabs,
  VectorIcon,
} from "expo-router/unstable-native-tabs";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

export default function TabsLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="appointments">
        <Label>Appointments</Label>
        {Platform.OS === "ios" ? (
          <Icon sf="list.clipboard.fill" />
        ) : (
          <Icon
            src={<VectorIcon family={FontAwesome6} name="clipboard-list" />}
          />
        )}
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="inventory">
        <Label>Inventory</Label>
        {Platform.OS === "ios" ? (
          <Icon sf="shippingbox.fill" />
        ) : (
          <Icon src={<VectorIcon family={FontAwesome6} name="box" />} />
        )}
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="me">
        {Platform.OS === "ios" ? (
          <Icon sf="person.circle.fill" />
        ) : (
          <Icon src={<VectorIcon family={FontAwesome6} name="user-large" />} />
        )}
        <Label>Me</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
