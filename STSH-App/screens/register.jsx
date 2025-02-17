import React, { useState } from "react";
import {
  Colors,
  StyledContainer,
  InnerContainer,
  LoginLogo,
  LoginTitle,
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
import { View, TouchableOpacity } from "react-native";
import { Ionicons, Octicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

function Register() {
  const [hidePassword, setHidePassword] = useState(true);
  const [hideConfirmPassword, setHideConfirmPassword] = useState(true);
  const [show, setShow] = useState(false);
  const [date, setDate] = useState(new Date(2000, 0, 1));
  const [dob, setDob] = useState("");

  const onChange = (event, selectedDate) => {
    if (selectedDate) {
      setShow(false);
      setDate(selectedDate);
      setDob(selectedDate.toISOString().split("T")[0]); // Format as YYYY-MM-DD
    }
  };

  const showDatePicker = () => {
    setShow(true);
  };

  return (
    <StyledContainer>
      <StatusBar style="dark" />
      <InnerContainer>
        <LoginTitle>Start Shield - STSH</LoginTitle>
        <SubTitle>Sign Up</SubTitle>

        {show && (
          <DateTimePicker
            testID="dateTimePicker"
            value={date}
            mode="date"
            is24Hour={true}
            onChange={onChange}
          />
        )}

        <Formik
          initialValues={{
            fullName: "",
            email: "",
            dateOfBirth: "",
            password: "",
            confirmPassword: "",
          }}
          onSubmit={(values) => {
            console.log({ ...values, dateOfBirth: dob });
          }}
        >
          {({ handleChange, handleBlur, handleSubmit, values, setFieldValue }) => (
            <FormAreaStyled>
              <MyTextInput
                label="Full Name:"
                icon="person"
                placeholder="John Doe"
                placeholderTextColor={Colors.grey}
                onChangeText={handleChange("fullName")}
                onBlur={handleBlur("fullName")}
                value={values.fullName}
              />

              <MyTextInput
                label="Email Address:"
                icon="mail"
                placeholder="example@gmail.com"
                placeholderTextColor={Colors.grey}
                onChangeText={handleChange("email")}
                onBlur={handleBlur("email")}
                value={values.email}
                keyboardType="email-address"
              />

              <MyTextInput
                label="Date Of Birth:"
                icon="calendar"
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.grey}
                value={dob}
                isDate={true}
                editable={false}
                showDatePicker={showDatePicker}
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

              <MyTextInput
                label="Confirm Password:"
                icon="lock"
                placeholder="Confirm your password"
                placeholderTextColor={Colors.grey}
                onChangeText={handleChange("confirmPassword")}
                onBlur={handleBlur("confirmPassword")}
                value={values.confirmPassword}
                secureTextEntry={hideConfirmPassword}
                isPassword={true}
                hidePassword={hideConfirmPassword}
                setHidePassword={setHideConfirmPassword}
              />

              <MsgBox>...</MsgBox>

              <StyledButton onPress={handleSubmit}>
                <ButtonText>Register</ButtonText>
              </StyledButton>

              <Line />

              <ExtraView>
                <ExtraText>Already have an account? </ExtraText>
                <TextLink>
                  <TextLinkContent>Login</TextLinkContent>
                </TextLink>
              </ExtraView>
            </FormAreaStyled>
          )}
        </Formik>
      </InnerContainer>
    </StyledContainer>
  );
}

export default Register;

const MyTextInput = ({
  label,
  icon,
  isPassword,
  hidePassword,
  setHidePassword,
  isDate,
  showDatePicker,
  ...props
}) => {
  return (
    <InputWrapper>
      <LoginIcon>
        <Octicons name={icon} size={25} color={Colors.linkColor} />
      </LoginIcon>
      <InputLabel>{label}</InputLabel>

      {isDate ? (
        <TouchableOpacity onPress={showDatePicker} style={{ width: '100%' }}>
          <TextInputStyled {...props} />
        </TouchableOpacity>
      ) : (
        <TextInputStyled {...props} />
      )}

      {isPassword && (
        <EyeIcon onPress={() => setHidePassword(!hidePassword)}>
          <Ionicons name={hidePassword ? "eye-off" : "eye"} size={30} color={Colors.grey} />
        </EyeIcon>
      )}
    </InputWrapper>
  );
};
