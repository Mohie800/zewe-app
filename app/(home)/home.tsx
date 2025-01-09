import { useNotification } from "@/context/NotificationContext";
import { usePushStore } from "@/store/store";
import { saveData } from "@/utils/localStorage";
import { router, useGlobalSearchParams, useNavigation } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { RefreshControl, ScrollView } from "react-native";
import { WebView } from "react-native-webview";

const Home = () => {
  const navigation = useNavigation();
  const webRef = useRef<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [containsContent, setContainsContent] = useState(false);
  const email = usePushStore((s) => s.email);
  const { url } = useGlobalSearchParams();
  const [uri, setUri] = useState<any>("");

  const { notification, setNotification } = useNotification();

  const onRefresh = () => {
    setRefreshing(true); // Start the refresh indicator
    if (webRef.current) {
      webRef.current.reload(); // Reload the WebView content
    }
    setTimeout(() => setRefreshing(false), 1000); // End the refresh indicator after a short delay
  };

  const handleMessage = (event: any) => {
    const message = event.nativeEvent.data;
    setContainsContent(message === "true");
    console.log("Log from WebView:", event.nativeEvent.data);
  };

  // Effect
  useEffect(() => {
    navigation.addListener("beforeRemove", (e) => {
      e.preventDefault();
      console.log("onback");
      webRef.current?.goBack();
      // Do your stuff here
      // navigation.dispatch(e.data.action);
    });
    if (url) {
      setUri(url);
      setTimeout(() => {
        saveData("url", "");
      }, 5000);
    } else {
      setUri(`https://zewetech.com/mobile-login?email=${email}`);
    }
  }, []);
  useEffect(() => {
    // console.log("⚠️", notification?.request?.content?.data?.body);
    if (notification?.request?.content?.data?.body) {
      const body = JSON.parse(notification?.request?.content?.data?.body);
      console.log(body);
      if (body.Logout) {
        saveData("email", null);
        setNotification(null);
        router.push("/");
      }
    }
  }, [notification]);
  return (
    <ScrollView
      contentContainerStyle={{ flex: 1 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <WebView
        source={{ uri }}
        style={{ flex: 1 }}
        ref={webRef}
        // injectedJavaScript={cookieScript}
        onMessage={handleMessage}
      />
    </ScrollView>
  );
};

export default Home;
