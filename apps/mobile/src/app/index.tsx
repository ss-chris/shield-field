import { Redirect } from "expo-router";

import { authClient } from "~/utils/auth";

export default function Index() {
  const session = authClient.useSession();

  console.log(session);

  if (session.data?.user) {
    return <Redirect href="/(tabs)/appointments" />;
  } else {
    return <Redirect href="/auth" />;
  }
}
