import React, { useContext, useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Alert,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CredentialsContext } from "../components/CredentialsContext";
import { styles } from "../styles/homeStyles";
import MyHeader from "../components/MyHeader";
import MyBottomNav from "../components/MyBottomNav";
import { Colors } from "../styles/styles";
import { Ionicons, Octicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Clipboard } from "react-native";

// Backend API URL
const API_URL = "https://my-backend-n9xt.onrender.com";

function UserDashboard({ navigation }) {
  const { storedCredentials, setStoredCredentials } =
    useContext(CredentialsContext);
  const { name, photoUrl, _id, stshToken, loan } = storedCredentials;
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  // QR
  const [qrVisible, setQrVisible] = useState(false);
  // Transfer
  const [recipientId, setRecipientId] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [password, setPassword] = useState("");
  // Loan
  const [loanAmount, setLoanAmount] = useState("");
  const [loanPassword, setLoanPassword] = useState("");
  const [loanModalVisible, setLoanModalVisible] = useState(false);
  const [activeLoan, setActiveLoan] = useState(null);
  // Loan Payment
  const [payLoanModalVisible, setPayLoanModalVisible] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentPassword, setPaymentPassword] = useState("");

  useEffect(() => {
    fetchActiveLoan();
  }, []);

  const fetchActiveLoan = async () => {
    try {
      const res = await fetch(`${API_URL}/loan/${_id}`);
      const data = await res.json();

      if (res.ok && data.loan) {
        setActiveLoan(data.loan);
        setStoredCredentials((prev) => ({
          ...prev,
          loan: data.loan.amount,
        }));
      } else {
        setActiveLoan(null);
        setStoredCredentials((prev) => ({
          ...prev,
          loan: 0,
        }));
      }
    } catch (error) {
      console.log("Fetch loan error:", error);
    }
  };

  const handleLoanApplication = async () => {
    if (!loanAmount || isNaN(loanAmount) || loanAmount <= 0) {
      handleMessage("Invalid loan amount.", "FAILED");
      return;
    }
    if (!loanPassword) {
      handleMessage("Please enter your password.", "FAILED");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/loan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: _id,
          amount: parseInt(loanAmount),
          password: loanPassword,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }

      setLoanModalVisible(false);
      setLoanAmount("");
      setLoanPassword("");

      handleMessage(data.message, "SUCCESS");
      fetchActiveLoan();
    } catch (error) {
      handleMessage(error.message, "FAILED");
    } finally {
      setLoading(false);
    }
  };

  // Handle Loan Payment
  const handleLoanPayment = async () => {
    if (
      !paymentAmount ||
      isNaN(paymentAmount) ||
      parseFloat(paymentAmount) <= 0
    ) {
      handleMessage("Invalid payment amount.", "FAILED");
      return;
    }

    if (parseFloat(paymentAmount) > stshToken) {
      handleMessage("Insufficient STSH Token balance.", "FAILED");
      return;
    }

    if (parseFloat(paymentAmount) > activeLoan.amount) {
      handleMessage("Payment exceeds remaining loan amount.", "FAILED");
      return;
    }

    if (!paymentPassword) {
      handleMessage("Please enter your password.", "FAILED");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/loan/pay/${activeLoan._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: _id,
          paymentAmount: parseFloat(paymentAmount),
          password: paymentPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }

      setPayLoanModalVisible(false);
      setPaymentAmount("");
      setPaymentPassword("");

      const newLoanAmount = activeLoan.amount - parseFloat(paymentAmount);

      setStoredCredentials({
        ...storedCredentials,
        stshToken: data.updatedUser.stshToken,
        loan: newLoanAmount,
      });

      handleMessage(data.message, "SUCCESS");

      fetchActiveLoan();
    } catch (error) {
      handleMessage(error.message, "FAILED");
    } finally {
      setLoading(false);
    }
  };

  // Logout Handler
  const clearLogin = async () => {
    try {
      await AsyncStorage.removeItem("stshCredentials");
      setStoredCredentials({});
      navigation.replace("Login");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  // Copy User ID to Clipboard
  const copyToClipboard = () => {
    Clipboard.setString(_id);
    Alert.alert("Copied", "User ID copied to clipboard!");
  };

  // Animation for arrow rotation
  const arrowAnimation = useRef(new Animated.Value(0)).current;
  const qrHeightAnimation = useRef(new Animated.Value(0)).current;

  // Function to rotate arrow smoothly
  const toggleQrVisibility = () => {
    const toValue = qrVisible ? 0 : 1;

    // Animate the arrow rotation
    Animated.timing(arrowAnimation, {
      toValue,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();

    // Animate the QR code height expansion
    Animated.timing(qrHeightAnimation, {
      toValue: qrVisible ? 0 : 150,
      duration: 400,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();

    setQrVisible(!qrVisible);
  };

  // Interpolating rotation
  const rotateArrow = arrowAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  // Transfer STSH Token
  const handleTransfer = async () => {
    const availableBalance = stshToken - loan;

    if (!recipientId || !transferAmount) {
      handleMessage(
        "Please enter a recipient's ID or email and STSH Token amount.",
        "FAILED"
      );
      return;
    }

    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount < 5 || amount > 3000) {
      handleMessage("Transfer amount must be between 5 and 3000 STSH Tokens.", "FAILED");
      return;
    }

    // Calculate tax
    const tax = Math.floor(transferAmount / 500);
    const totalAmount = parseInt(transferAmount) + tax;

    if (totalAmount > availableBalance) {
      handleMessage(
        `Insufficient balance. You need ${totalAmount} STSH Tokens including tax.`,
        "FAILED"
      );
      return;
    }

    setLoading(true);

    try {
      let searchEndpoint;

      if (recipientId.includes("@")) {
        searchEndpoint = `${API_URL}/user/email/${recipientId.toLowerCase()}`;
      } else {
        searchEndpoint = `${API_URL}/user/${recipientId}`;
      }

      const response = await fetch(searchEndpoint);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setRecipientName(data.name);
      setRecipientId(data._id);
      setRecipientEmail(data.email);
      setModalVisible(true);
    } catch (error) {
      handleMessage("User not found. Check the email or ID.", "FAILED");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalTransfer = async () => {
    if (!password) {
      handleMessage("Please enter your password.", "FAILED");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: _id,
          recipientId,
          amount: parseInt(transferAmount),
          password,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }

      // Success: Update stored balance & close modal
      setStoredCredentials({
        ...storedCredentials,
        stshToken: data.senderBalance,
      });

      setMessage(data.message);
      setMessageType("SUCCESS");
      setModalVisible(false);
      setRecipientId("");
      setTransferAmount("");
      setPassword("");
    } catch (error) {
      handleMessage(error.message, "FAILED"); // Show error inside the modal
    } finally {
      setLoading(false);
    }
  };

  // Handle messages
  const handleMessage = (message, type = "FAILED") => {
    setMessage(message);
    setMessageType(type);
  };

  return (
    <TouchableWithoutFeedback onPress={() => {}}>
      <View style={styles.container}>
        <StatusBar style="dark" />

        {/* Header */}
        <MyHeader
          title={`Hello, ${name}`}
          navigation={navigation}
          photoUrl={photoUrl}
          onLogout={clearLogin}
        />

        {/* Scrollable Content */}
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* QR Code & User ID Section */}
          <LinearGradient
            colors={[Colors.darkGreen, Colors.lightGreen]}
            style={styles.qrUserIdContainer}
          >
            {/* QR Code Section */}
            <Animated.View
              style={[styles.qrCodeContainer, { height: qrHeightAnimation }]}
            >
              {qrVisible &&
                (storedCredentials.qrCodeUrl ? (
                  <Image
                    source={{ uri: storedCredentials.qrCodeUrl }}
                    style={styles.qrCodeImage}
                    resizeMode="contain"
                  />
                ) : (
                  <Text style={{ color: Colors.white, textAlign: "center" }}>
                    QR Code not available
                  </Text>
                ))}
            </Animated.View>

            {/* User ID */}
            <TouchableWithoutFeedback onPress={copyToClipboard}>
              <View style={styles.userIdContainer}>
                <Text style={styles.userIdText}>User ID</Text>
                <Text style={styles.userIdText}>{_id}</Text>
              </View>
            </TouchableWithoutFeedback>

            {/* Arrow Button (Toggle QR Code) */}
            <TouchableOpacity
              style={styles.arrowButton}
              onPress={toggleQrVisibility}
            >
              <Animated.View style={{ transform: [{ rotate: rotateArrow }] }}>
                <Ionicons name="chevron-down" size={24} color={Colors.white} />
              </Animated.View>
            </TouchableOpacity>
          </LinearGradient>

          {/* Transfer STSH Token Section */}
          <View style={styles.transferContainer}>
            <Text style={styles.transferTitle}>Transfer STSH Token</Text>

            {/* User ID Input with QR Scanner */}
            <View style={styles.inputWithIcon}>
              <View style={styles.inputField}>
                <TextInput
                  placeholder="Enter recipient's User ID or Email"
                  placeholderTextColor={Colors.grey}
                  value={recipientId}
                  onChangeText={setRecipientId}
                  style={styles.textInput}
                />
              </View>
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={() => Alert.alert("Feature in development")}
              >
                <Ionicons name="camera" size={25} color={Colors.white} />
              </TouchableOpacity>
            </View>

            {/* STSH Token Amount Input */}
            <View style={styles.inputField}>
              <TextInput
                placeholder="Enter amount"
                placeholderTextColor={Colors.grey}
                keyboardType="numeric"
                value={transferAmount}
                onChangeText={setTransferAmount}
                style={styles.textInput}
              />
            </View>

            {/* Display calculated tax */}
            {transferAmount ? (
              <Text style={{ color: Colors.lightGreen, textAlign: "center" }}>
                Tax: {Math.floor(parseInt(transferAmount) / 500) + 1} STSH Token
              </Text>
            ) : null}

            {/* Message Box */}
            {message ? (
              <Text
                style={{
                  color:
                    messageType === "SUCCESS" ? Colors.lightGreen : Colors.red,
                  textAlign: "center",
                }}
              >
                {message}
              </Text>
            ) : null}

            {/* Send Button */}
            {!loading ? (
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleTransfer}
              >
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
            ) : (
              <ActivityIndicator size="large" color={Colors.black} />
            )}
          </View>

          {/* Confirmation Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Confirm Transfer</Text>

                {/* Show recipient's ID and name */}
                <Text style={styles.modalText}>To: {recipientName}</Text>
                <Text style={styles.modalText}>To: {recipientEmail}</Text>
                <Text style={styles.modalText}>
                  Amount: {transferAmount} STSH Token
                </Text>

                {/* Password Input */}
                <TextInput
                  placeholder="Enter your password"
                  placeholderTextColor={Colors.grey}
                  secureTextEntry={true}
                  value={password}
                  onChangeText={setPassword}
                  style={styles.modalInput}
                />

                {/* Error Message */}
                {messageType === "FAILED" && message ? (
                  <Text style={styles.errorMessage}>{message}</Text>
                ) : null}

                {/* Confirm & Cancel Buttons */}
                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={() => handleFinalTransfer()}
                  >
                    <Text style={styles.modalButtonText}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Features Section */}
          <View style={styles.featureContainer}>
            {/* Topup */}
            <TouchableOpacity
              style={styles.featureButton}
              onPress={() => Alert.alert("This feature is in development.")}
            >
              <Ionicons
                name="add-circle-outline"
                size={40}
                color={Colors.darkGreen}
              />
              <Text style={styles.featureText}>Top Up</Text>
            </TouchableOpacity>

            {/* History */}
            <TouchableOpacity
              style={styles.featureButton}
              onPress={() => navigation.navigate("TransactionHistory")}
            >
              <Ionicons
                name="albums-outline"
                size={40}
                color={Colors.darkGreen}
              />
              <Text style={styles.featureText}>History</Text>
            </TouchableOpacity>

            {/* Apply Loan */}
            <TouchableOpacity
              style={styles.featureButton}
              onPress={() => setLoanModalVisible(true)}
            >
              <Ionicons
                name="cash-outline"
                size={40}
                color={Colors.darkGreen}
              />
              <Text style={styles.featureText}>Apply Loan</Text>
            </TouchableOpacity>

            {/* Loan Modal */}
            <Modal
              animationType="slide"
              transparent={true}
              visible={loanModalVisible}
              onRequestClose={() => setLoanModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                  <Text style={styles.modalTitle}>Apply for a Loan</Text>

                  <TextInput
                    placeholder="Enter STSH Loan Amount"
                    placeholderTextColor={Colors.grey}
                    keyboardType="numeric"
                    value={loanAmount}
                    onChangeText={setLoanAmount}
                    style={styles.modalInput}
                  />

                  <TextInput
                    placeholder="Confirm Your Password"
                    placeholderTextColor={Colors.grey}
                    secureTextEntry={true}
                    value={loanPassword}
                    onChangeText={setLoanPassword}
                    style={styles.modalInput}
                  />

                  {messageType === "FAILED" && message ? (
                    <Text style={styles.errorMessage}>{message}</Text>
                  ) : null}

                  <View style={styles.modalButtonContainer}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => setLoanModalVisible(false)}
                    >
                      <Text style={styles.modalButtonText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.confirmButton}
                      onPress={handleLoanApplication}
                    >
                      <Text style={styles.modalButtonText}>Confirm</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>

            {/* Insurance */}
            <TouchableOpacity
              style={styles.featureButton}
              onPress={() => Alert.alert("This feature is in development.")}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={40}
                color={Colors.darkGreen}
              />
              <Text style={styles.featureText}>Insurance</Text>
            </TouchableOpacity>
          </View>

          {/* Loan Section */}
          <View style={styles.loanContainer}>
            <Text style={styles.loanTitle}>Current Loan</Text>
            {activeLoan ? (
              <View style={styles.loanCard}>
                <Text style={styles.loanText}>
                  Amount: {activeLoan.amount} Token
                </Text>
                <Text style={styles.loanText}>
                  Approval:{" "}
                  <Text
                    style={[
                      styles.loanText,
                      {
                        color: activeLoan.approval
                          ? Colors.lightGreen
                          : Colors.red,
                      },
                    ]}
                  >
                    {activeLoan.approval ? "Approved" : "Not approved"}
                  </Text>
                </Text>
                <Text style={styles.loanText}>
                  Status:{" "}
                  <Text
                    style={[
                      styles.loanText,
                      {
                        color:
                          activeLoan.status === "paid"
                            ? Colors.green
                            : Colors.red,
                      },
                    ]}
                  >
                    {activeLoan.status === "paid" ? "Paid" : "In debt"}
                  </Text>
                </Text>

                {activeLoan &&
                  activeLoan.status !== "paid" &&
                  activeLoan.approval === true && (
                    <TouchableOpacity
                      style={styles.payLoanButton}
                      onPress={() => setPayLoanModalVisible(true)}
                    >
                      <Text style={styles.payLoanButtonText}>Pay Loan</Text>
                    </TouchableOpacity>
                  )}

                {/* Loan Payment Modal */}
                <Modal
                  animationType="slide"
                  transparent={true}
                  visible={payLoanModalVisible}
                  onRequestClose={() => setPayLoanModalVisible(false)}
                >
                  <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                      <Text style={styles.modalTitle}>Pay Loan</Text>

                      <TextInput
                        placeholder="Enter STSH Token Amount"
                        placeholderTextColor={Colors.grey}
                        keyboardType="numeric"
                        value={paymentAmount}
                        onChangeText={setPaymentAmount}
                        style={styles.modalInput}
                      />

                      <TextInput
                        placeholder="Confirm Your Password"
                        placeholderTextColor={Colors.grey}
                        secureTextEntry={true}
                        value={paymentPassword}
                        onChangeText={setPaymentPassword}
                        style={styles.modalInput}
                      />

                      {messageType === "FAILED" && message ? (
                        <Text style={styles.errorMessage}>{message}</Text>
                      ) : null}

                      <View style={styles.modalButtonContainer}>
                        <TouchableOpacity
                          style={styles.cancelButton}
                          onPress={() => setPayLoanModalVisible(false)}
                        >
                          <Text style={styles.modalButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.confirmButton}
                          onPress={handleLoanPayment}
                        >
                          <Text style={styles.modalButtonText}>Confirm</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </Modal>
              </View>
            ) : (
              <Text style={styles.noLoanText}>No active loan</Text>
            )}
          </View>

          {/* Empty Spacer to Allow Scrolling to Bottom */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Bottom Navigation */}
        <MyBottomNav navigation={navigation} activeScreen="UserDashboard" />
      </View>
    </TouchableWithoutFeedback>
  );
}

export default UserDashboard;

// TODO: Correct the QR handling (QR code link expired)
// TODO: Add tax 5% for loan
