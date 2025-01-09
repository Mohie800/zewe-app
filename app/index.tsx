import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import axios, { AxiosError } from "axios";
import { usePushStore } from "@/store/store";
import { router } from "expo-router";
import { useNotification } from "@/context/NotificationContext";
import { saveData } from "@/utils/localStorage";

const countries = [
  { code: "ksa", name: "Saudi arabia", dialCode: "+966" },
  { code: "US", name: "United States", dialCode: "+1" },
  { code: "GB", name: "United Kingdom", dialCode: "+44" },
  { code: "IN", name: "India", dialCode: "+91" },
  // Add more countries as needed
];

const LoginScreen = () => {
  const [phone, setPhone] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [modalVisible, setModalVisible] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const setEmail = usePushStore((s) => s.setEmail);
  const [isLoading, setIsLoading] = useState(false);
  const { expoPushToken } = useNotification();
  const [validationError, setValidationError] = useState("");

  const sendToken = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.post(
        "https://zewetech.com/api/v1/phone-login",
        {
          notify_token: expoPushToken,
          phone: selectedCountry.dialCode + phone,
        }
      );
      setEmail(data.data.email);
      setIsLoading(false);
      saveData("email", data.data.email);
      router.push("/home");
    } catch (error) {
      setIsLoading(false);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.data.error?.phone) {
          setValidationError(
            error.response.data.error?.phone[0] || "phone not valid"
          );
        }
      }
      console.log(error);
    }
  };

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogin = () => {
    sendToken();
    console.log("Login attempted with:", selectedCountry.dialCode + phone);
  };

  const renderCountryItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.countryItem}
      onPress={() => {
        setSelectedCountry(item);
        setModalVisible(false);
      }}
    >
      <Text style={styles.countryName}>{item.name}</Text>
      <Text style={styles.dialCode}>{item.dialCode}</Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <StatusBar style="light" />
      <LinearGradient
        colors={["#4c669f", "#3b5998", "#192f6a"]}
        style={styles.gradient}
      >
        <Animated.View
          style={[
            styles.formContainer,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Welcome</Text>
            <Text style={styles.subtitle}>Enter your phone number</Text>
          </View>

          <View style={styles.phoneContainer}>
            <TouchableOpacity
              style={styles.countrySelector}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.countryCode}>{selectedCountry.dialCode}</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.phoneInput}
              placeholder="Phone Number"
              placeholderTextColor="#8b9cb5"
              value={phone}
              onChangeText={setPhone}
              editable={!isLoading}
              keyboardType="phone-pad"
              maxLength={12}
            />
          </View>

          {validationError ? (
            <Text style={styles.errorText}>{validationError}</Text>
          ) : null}

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            {isLoading ? (
              <ActivityIndicator />
            ) : (
              <Text style={styles.loginButtonText}>Continue</Text>
            )}
          </TouchableOpacity>

          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Country</Text>
                <FlatList
                  data={countries}
                  renderItem={renderCountryItem}
                  keyExtractor={(item) => item.code}
                />
              </View>
            </View>
          </Modal>
        </Animated.View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 14,
    marginTop: -15,
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  formContainer: {
    width: Dimensions.get("window").width * 0.9,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1a2f6a",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  phoneContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  countrySelector: {
    backgroundColor: "#f5f6fa",
    borderRadius: 10,
    padding: 15,
    marginRight: 10,
    justifyContent: "center",
  },
  countryCode: {
    fontSize: 16,
    color: "#2c3e50",
  },
  phoneInput: {
    flex: 1,
    backgroundColor: "#f5f6fa",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: "#2c3e50",
  },
  loginButton: {
    backgroundColor: "#4c669f",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  loginButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: Dimensions.get("window").height * 0.7,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#1a2f6a",
  },
  countryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  countryName: {
    fontSize: 16,
    color: "#2c3e50",
  },
  dialCode: {
    fontSize: 16,
    color: "#666",
  },
});

export default LoginScreen;
