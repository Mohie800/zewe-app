import * as Notifications from "expo-notifications";
import { router, Stack } from "expo-router";
import { NotificationProvider } from "@/context/NotificationContext";
import { useEffect } from "react";
import { getData } from "@/utils/localStorage";
import { usePushStore } from "@/store/store";

// Define types for notifications

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
  const handleLogin = async () => {
    try {
      const email = await getData("email");
      const url = await getData<string>("url");
      if (email) {
        console.log(url);
        // router.push("/home");
        router.push({
          pathname: "/home",
          params: { url: url }, // Optional params
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    handleLogin();
  }, []);
  return (
    <NotificationProvider>
      <Stack screenOptions={{ headerShown: false, statusBarHidden: true }} />
    </NotificationProvider>
  );
}
