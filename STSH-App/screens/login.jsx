import React, { useState, useContext, useEffect } from "react";
import {
  Colors,
  StyledContainer,
  InnerContainer,
  LoginLogo,
  PageTitle,
  SubTitle,
  FormAreaStyled,
  TextInputStyled,
  InputLabel,
  LoginIcon,
  StyledButton,
  ButtonText,
  InputWrapper,
  EyeIcon,
  MsgBox,
  Line,
  ExtraView,
  ExtraText,
  TextLink,
  TextLinkContent,
} from "../styles/styles";
import { StatusBar } from "expo-status-bar";
import { Formik } from "formik";
import { View, ActivityIndicator } from "react-native";
import { Ionicons, Octicons, Fontisto } from "@expo/vector-icons";
import KeyboardAvoidingWrapper from "../components/KeyboardAvoidingWrapper";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CredentialContext } from "../components/CredentialsContext";
import * as Google from "expo-auth-session/providers/google";
import * as SecureStore from "expo-secure-store";

function Login({ navigation }) {
  const [hidePassword, setHidePassword] = useState(true);
  const [message, setMessage] = useState();
  const [messageType, setMessageType] = useState();
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const { setStoredCredentials } = useContext(CredentialContext);

  // Google Sign-In Configuration
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: "271194429957-7i96i00bes9pn6sjk04bgih1u0fnl3tm.apps.googleusercontent.com",
    iosClientId: "271194429957-2154pm0pi792h0k0hn9l1orq4tj2gg4u.apps.googleusercontent.com",
    expoClientId: "271194429957-hc1dhc5e2bo389926i9rbm65ip606nf4.apps.googleusercontent.com",
    webClientId: "271194429957-hc1dhc5e2bo389926i9rbm65ip606nf4.apps.googleusercontent.com",
    redirectUri: "https://auth.expo.io/@wilsonval/STSH-App",
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      fetchUserInfo(authentication.accessToken);
    }
  }, [response]);

  const fetchUserInfo = async (token) => {
    try {
      const res = await fetch("https://www.googleapis.com/userinfo/v2/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = await res.json();

      // Save credentials securely
      await SecureStore.setItemAsync("stshCredentials", JSON.stringify(user));
      setStoredCredentials(user);
    } catch (error) {
      console.error("Google Sign-In Error:", error);
    }
  };

  const handleLogin = async (credentials, setSubmitting) => {
    handleMessage(null);
    const url = "https://your-api-endpoint.com/login"; // Replace with actual API URL

    try {
      const response = await axios.post(url, credentials);
      const { message, status, data } = response.data;

      if (status !== "SUCCESS") {
        handleMessage(message, status);
      } else {
        persistLogin(data[0], message, status);
      }
    } catch (error) {
      console.error("Login Error:", error.response?.data || error.message);
      handleMessage("An error occurred. Check your network and try again!");
    }

    setSubmitting(false);
  };

  const handleMessage = (message, type = "FAILED") => {
    setMessage(message);
    setMessageType(type);
  };

  const persistLogin = async (credentials, message, status) => {
    try {
      await AsyncStorage.setItem("stshCredentials", JSON.stringify(credentials));
      handleMessage(message, status);
      setStoredCredentials(credentials);
    } catch (error) {
      console.error("Persisting login failed:", error);
      handleMessage("An error occurred while saving credentials.");
    }
  };

  return (
    <KeyboardAvoidingWrapper>
      <StyledContainer>
        <StatusBar style="dark" />
        <InnerContainer>
          <LoginLogo
            resizeMode="contain"
            source={require("../assets/images/STSH-Logo.png")}
          />
          <PageTitle>StartShield-STSH</PageTitle>
          <SubTitle>Login</SubTitle>

          <Formik
            initialValues={{ email: "", password: "" }}
            onSubmit={(values, { setSubmitting }) => {
              if (!values.email || !values.password) {
                handleMessage("Please fill in all fields");
                setSubmitting(false);
              } else {
                handleLogin(values, setSubmitting);
              }
            }}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              isSubmitting,
            }) => (
              <FormAreaStyled>
                <MyTextInput
                  label="Email:"
                  icon="mail"
                  placeholder="example@gmail.com"
                  placeholderTextColor={Colors.grey}
                  onChangeText={handleChange("email")}
                  onBlur={handleBlur("email")}
                  value={values.email}
                  keyboardType="email-address"
                />

                <MyTextInput
                  label="Password:"
                  icon="lock"
                  placeholder="Enter your password"
                  placeholderTextColor={Colors.grey}
                  onChangeText={handleChange("password")}
                  onBlur={handleBlur("password")}
                  value={values.password}
                  secureTextEntry={hidePassword}
                  isPassword
                  hidePassword={hidePassword}
                  setHidePassword={setHidePassword}
                />

                <MsgBox type={messageType}>{message}</MsgBox>
                {!isSubmitting ? (
                  <StyledButton onPress={handleSubmit}>
                    <ButtonText>Login</ButtonText>
                  </StyledButton>
                ) : (
                  <StyledButton disabled={true}>
                    <ActivityIndicator size="large" color={Colors.black} />
                  </StyledButton>
                )}

                <Line />

                {!googleSubmitting ? (
                  <StyledButton google={true} onPress={() => promptAsync()}>
                    <Fontisto name="google" color={Colors.white} size={26} />
                    <ButtonText google={true}>Sign in with Google</ButtonText>
                  </StyledButton>
                ) : (
                  <StyledButton google={true} disabled={true}>
                    <ActivityIndicator size="large" color={Colors.black} />
                  </StyledButton>
                )}

                <ExtraView>
                  <ExtraText>Don't have an account? </ExtraText>
                  <TextLink onPress={() => navigation.navigate("Register")}>
                    <TextLinkContent>Sign Up</TextLinkContent>
                  </TextLink>
                </ExtraView>
              </FormAreaStyled>
            )}
          </Formik>
        </InnerContainer>
      </StyledContainer>
    </KeyboardAvoidingWrapper>
  );
}

export default Login;

const MyTextInput = ({
  label,
  icon,
  isPassword,
  hidePassword,
  setHidePassword,
  ...props
}) => {
  return (
    <InputWrapper>
      <LoginIcon>
        <Octicons name={icon} size={25} color={Colors.linkColor} />
      </LoginIcon>
      <InputLabel>{label}</InputLabel>
      <TextInputStyled {...props} />
      {isPassword && (
        <EyeIcon onPress={() => setHidePassword(!hidePassword)}>
          <Ionicons
            name={hidePassword ? "eye-off" : "eye"}
            size={30}
            color={Colors.darkGrey}
          />
        </EyeIcon>
      )}
    </InputWrapper>
  );
};
