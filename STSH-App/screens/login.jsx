import React, { useState } from "react";
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
import { View } from "react-native";
import { Ionicons, Octicons, Fontisto } from "@expo/vector-icons"; // Icons

function Login() {
  const [hidePassword, setHidePassword] = useState(true);
  return (
    <StyledContainer>
      <StatusBar style="dark" />
      <InnerContainer>
        <LoginLogo
          resizeMode="contain"
          source={require("./../assets/images/STSH-Logo.png")} // Placeholder Image (Replace with STSH logo)
        />
        <PageTitle>StartShield-STSH</PageTitle>
        <SubTitle>Login</SubTitle>

        <Formik
          initialValues={{ email: "", password: "" }}
          onSubmit={(values) => {
            console.log(values);
          }}
        >
          {({ handleChange, handleBlur, handleSubmit, values }) => (
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
                isPassword={true}
                hidePassword={hidePassword}
                setHidePassword={setHidePassword}
              />

              <MsgBox>...</MsgBox>

              <StyledButton onPress={handleSubmit}>
                <ButtonText>Login</ButtonText>
              </StyledButton>

              <Line />

              <StyledButton google={true} onPress={handleSubmit}>
                <Fontisto name="google" color={Colors.white} size={26} />
                <ButtonText google={true}>Sign in with Google </ButtonText>
              </StyledButton>

              <ExtraView>
                <ExtraText>Don't have an account? </ExtraText>
                <TextLink>
                  <TextLinkContent>Sign Up</TextLinkContent>
                </TextLink>
              </ExtraView>

            </FormAreaStyled>
          )}
        </Formik>
      </InnerContainer>
    </StyledContainer>
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
          {/* <Ionicons name={hidePassword ? "md-eye-off" : "md-eye"} size={30} color={Colors.darkGrey} /> */}
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
