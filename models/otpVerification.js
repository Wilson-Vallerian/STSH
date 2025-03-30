import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { styles } from "../styles/homeStyles";
import { Colors } from "../styles/styles";

const API_URL = "https://my-backend-n9xt.onrender.com";

export default function OtpVerification({ navigation, route }) {
  const { tempId, name, email, password, dateOfBirth } = route.params;

  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setMessage("OTP must be 6 digits");
      setMessageType("FAILED");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tempId,
          otp,
          name,
          email,
          dateOfBirth,
          password,
        }),
      });

      const data = await res.json();

      if (data.status === "SUCCESS") {
        Alert.alert("Success", "Your account has been verified!");
        navigation.replace("Login");
      } else {
        setMessage(data.message || "OTP verification failed");
        setMessageType("FAILED");
      }
    } catch (error) {
      setMessage("Something went wrong");
      setMessageType("FAILED");
    }
  };

  return (
    <View style={styles.profileContainer}>
      <StatusBar style="dark" />

      <Text style={styles.headerText}>OTP Verification</Text>

      <Text style={{ margin: 20, fontSize: 16, textAlign: "center" }}>
        Enter the 6-digit OTP sent to your email.
      </Text>

      <TextInput
        value={otp}
        onChangeText={setOtp}
        keyboardType="numeric"
        maxLength={6}
        placeholder="Enter OTP"
        style={{
          backgroundColor: Colors.white,
          borderRadius: 10,
          padding: 12,
          fontSize: 20,
          textAlign: "center",
          borderColor: Colors.grey,
          borderWidth: 1,
          marginBottom: 20,
          width: "80%",
          alignSelf: "center",
        }}
      />

      {message ? (
        <Text
          style={{
            color: messageType === "FAILED" ? Colors.red : Colors.green,
            marginBottom: 15,
            textAlign: "center",
          }}
        >
          {message}
        </Text>
      ) : null}

      <TouchableOpacity
        onPress={handleVerify}
        style={{
          backgroundColor: Colors.lightGreen,
          paddingVertical: 12,
          paddingHorizontal: 30,
          borderRadius: 10,
          alignSelf: "center",
        }}
      >
        <Text style={{ color: Colors.white, fontSize: 16, fontWeight: "bold" }}>
          Verify OTP
        </Text>
      </TouchableOpacity>
    </View>
  );
}
