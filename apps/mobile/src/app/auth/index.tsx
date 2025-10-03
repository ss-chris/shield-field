import { Button, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { authClient } from "~/utils/auth";

export default function AuthScreen() {
  const handleLogin = async () => {
    await authClient.signIn.social({
      provider: "microsoft",
      callbackURL: "/",
    });
  };

  return (
    <SafeAreaView>
      <View>
        <Button title="Login with Microsoft" onPress={handleLogin} />
      </View>
    </SafeAreaView>
  );
}
