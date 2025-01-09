import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import * as Notifications from "expo-notifications";
import { EventSubscription } from "expo-modules-core";
import { registerForPushNotificationsAsync } from "@/utils/registerForPushNotificationsAsync";
import { router } from "expo-router";
import { usePushStore } from "@/store/store";
import { getData, saveData } from "@/utils/localStorage";

interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  error: Error | null;
  setNotification: (notification: Notifications.Notification | null) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const setUrl = usePushStore().setUrl;
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const notificationListener = useRef<EventSubscription>();
  const responseListener = useRef<EventSubscription>();
  const handleLogin = async () => {
    const url = usePushStore((s) => s.url);
    try {
      const email = await getData("email");
      // const url = await getData<string>("url");
      if (email) {
        console.log("url", url);
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
    registerForPushNotificationsAsync().then(
      (token) => setExpoPushToken(token),
      (error) => {
        setError(error);
        console.log(error);
      }
    );

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("🔔 Notification Received: ", notification);
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(
          "🔔 Notification Response: ",
          JSON.stringify(response, null, 2),
          JSON.stringify(response.notification.request.content.data, null, 2)
        );
        const data = response.notification.request.content.data;
        if (data.url) {
          setUrl(data.url);
          saveData("url", data.url);
          router.push({
            pathname: "/home",
            params: { url: data.url }, // Optional params
          });
        }
        // Handle the notification response here
      });

    handleLogin(); // Automatically login user when app is opened
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{ expoPushToken, notification, error, setNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
