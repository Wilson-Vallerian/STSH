// import React, { useState, useContext } from "react";
// import {
//   Colors,
//   StyledContainer,
//   InnerContainer,
//   PageTitle,
//   SubTitle,
//   FormAreaStyled,
//   TextInputStyled,
//   InputLabel,
//   LoginIcon,
//   StyledButton,
//   ButtonText,
//   InputWrapper,
//   EyeIcon,
//   MsgBox,
//   Line,
//   ExtraView,
//   ExtraText,
//   TextLink,
//   TextLinkContent,
// } from "../styles/styles";
// import { StatusBar } from "expo-status-bar";
// import { Formik } from "formik";
// import { View, TouchableOpacity, ActivityIndicator } from "react-native";
// import { Ionicons, Octicons } from "@expo/vector-icons";
// import DateTimePicker from "@react-native-community/datetimepicker";
// import KeyboardAvoidingWrapper from "./../components/KeyboardAvoidingWrapper";
// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { CredentialsContext } from "./../components/CredentialsContext";

// function Register({ navigation }) {
//   const [hidePassword, setHidePassword] = useState(true);
//   const [hideConfirmPassword, setHideConfirmPassword] = useState(true);
//   const [show, setShow] = useState(false);
//   const [date, setDate] = useState(new Date(2000, 0, 1));
//   const [dob, setDob] = useState("");
//   const [message, setMessage] = useState();
//   const [messageType, setMessageType] = useState();
//   const {storedCredentials, setStoredCredentials} = useContext(CredentialsContext);

//   const onChange = (event, selectedDate) => {
//     if (selectedDate) {
//       setShow(false);
//       setDate(selectedDate);
//       setDob(selectedDate.toISOString().split("T")[0]); // Format as YYYY-MM-DD
//     }
//   };

//   const showDatePicker = () => {
//     setShow(true);
//   };

//   const handleRegister = (credentials, setSubmitting) => {
//     handleMessage(null);
//     const url = ""; // Put MongoDB Url here
//     axios
//       .post(url, credentials)
//       .then((response) => {
//         const resault = response.data;
//         const { message, status, data } = resault;

//         if (status !== "SUCCESS") {
//           handleMessage(message, status);
//         } else {
//           // navigation.navigate("Home", { ...data });
//           persistLogin({...data}, message, "SUCCESS")
//         }
//         setSubmitting(false);
//       })
//       .catch((error) => {
//         console.log(error.JSON());
//         setSubmitting(false);
//         handleMessage("An error occured. Check your network and try again!");
//       });
//   };

//   const persistLogin = (credentials, message, status) => {
//     AsyncStorage.setItem("stshCredentials", JSON.stringify(credentials))
//       .then(() => {
//         handleMessage(message, status); 
//         setStoredCredentials(credentials)
//       })
//       .catch((error) => {
//         console.log(error);
//         handleMessage("Persisting login failed");
//       });
//   };

//   return (
//     <KeyboardAvoidingWrapper>
//       <StyledContainer>
//         <StatusBar style="dark" />
//         <InnerContainer>
//           <PageTitle>Start Shield - STSH</PageTitle>
//           <SubTitle>Sign Up</SubTitle>

//           {show && (
//             <DateTimePicker
//               testID="dateTimePicker"
//               value={date}
//               mode="date"
//               is24Hour={true}
//               onChange={onChange}
//             />
//           )}

//           <Formik
//             initialValues={{
//               name: "",
//               email: "",
//               dateOfBirth: "",
//               password: "",
//               confirmPassword: "",
//             }}
//             onSubmit={(values, { setSubmitting }) => {
//               values = {...values, dateOfBirth: dob}
//               if (
//                 values.email == "" ||
//                 values.password == "" ||
//                 values.name == "" ||
//                 values.dateOfBirth == "" ||
//                 values.confirmPassword == ""
//               ) {
//                 handleMessage("Please fill in fields");
//                 setSubmitting(false);
//               } else if (values.password !== values.confirmPassword) {
//                 handleMessage("Password don't match!");
//                 setSubmitting(false);
//               } else {
//                 handleRegister(values, setSubmitting);
//               }
//             }}
//           >
//             {({
//               handleChange,
//               handleBlur,
//               handleSubmit,
//               values,
//               isSubmitting,
//             }) => (
//               <FormAreaStyled>
//                 <MyTextInput
//                   label="Full Name:"
//                   icon="person"
//                   placeholder="John Doe"
//                   placeholderTextColor={Colors.grey}
//                   onChangeText={handleChange("name")}
//                   onBlur={handleBlur("name")}
//                   value={values.name}
//                 />

//                 <MyTextInput
//                   label="Email Address:"
//                   icon="mail"
//                   placeholder="example@gmail.com"
//                   placeholderTextColor={Colors.grey}
//                   onChangeText={handleChange("email")}
//                   onBlur={handleBlur("email")}
//                   value={values.email}
//                   keyboardType="email-address"
//                 />

//                 <MyTextInput
//                   label="Date Of Birth:"
//                   icon="calendar"
//                   placeholder="YYYY-MM-DD"
//                   placeholderTextColor={Colors.grey}
//                   value={dob}
//                   isDate={true}
//                   editable={false}
//                   showDatePicker={showDatePicker}
//                 />

//                 <MyTextInput
//                   label="Password:"
//                   icon="lock"
//                   placeholder="Enter your password"
//                   placeholderTextColor={Colors.grey}
//                   onChangeText={handleChange("password")}
//                   onBlur={handleBlur("password")}
//                   value={values.password}
//                   secureTextEntry={hidePassword}
//                   isPassword={true}
//                   hidePassword={hidePassword}
//                   setHidePassword={setHidePassword}
//                 />

//                 <MyTextInput
//                   label="Confirm Password:"
//                   icon="lock"
//                   placeholder="Confirm your password"
//                   placeholderTextColor={Colors.grey}
//                   onChangeText={handleChange("confirmPassword")}
//                   onBlur={handleBlur("confirmPassword")}
//                   value={values.confirmPassword}
//                   secureTextEntry={hideConfirmPassword}
//                   isPassword={true}
//                   hidePassword={hideConfirmPassword}
//                   setHidePassword={setHideConfirmPassword}
//                 />

//                 <MsgBox type={messageType}>{message}</MsgBox>

//                 {!isSubmitting && (
//                   <StyledButton onPress={handleSubmit}>
//                     <ButtonText>Register</ButtonText>
//                   </StyledButton>
//                 )}

//                 <MsgBox type={messageType}>{message}</MsgBox>
//                 {isSubmitting && (
//                   <StyledButton disabled={true}>
//                     <ActivityIndicator size="large" color={Colors.black} />
//                   </StyledButton>
//                 )}

//                 <Line />

//                 <ExtraView>
//                   <ExtraText>Already have an account? </ExtraText>
//                   <TextLink onPress={() => navigation.navigate("Login")}>
//                     <TextLinkContent>Login</TextLinkContent>
//                   </TextLink>
//                 </ExtraView>
//               </FormAreaStyled>
//             )}
//           </Formik>
//         </InnerContainer>
//       </StyledContainer>
//     </KeyboardAvoidingWrapper>
//   );
// }

// export default Register;

// const MyTextInput = ({
//   label,
//   icon,
//   isPassword,
//   hidePassword,
//   setHidePassword,
//   isDate,
//   showDatePicker,
//   ...props
// }) => {
//   return (
//     <InputWrapper>
//       <LoginIcon>
//         <Octicons name={icon} size={25} color={Colors.linkColor} />
//       </LoginIcon>
//       <InputLabel>{label}</InputLabel>

//       {isDate ? (
//         <TouchableOpacity onPress={showDatePicker} style={{ width: "100%" }}>
//           <TextInputStyled {...props} />
//         </TouchableOpacity>
//       ) : (
//         <TextInputStyled {...props} />
//       )}

//       {isPassword && (
//         <EyeIcon onPress={() => setHidePassword(!hidePassword)}>
//           <Ionicons
//             name={hidePassword ? "eye-off" : "eye"}
//             size={30}
//             color={Colors.grey}
//           />
//         </EyeIcon>
//       )}
//     </InputWrapper>
//   );
// };

import React, { useState, useContext } from "react";
import {
  Colors,
  StyledContainer,
  InnerContainer,
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
import { View, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons, Octicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import KeyboardAvoidingWrapper from "../components/KeyboardAvoidingWrapper";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CredentialContext } from "../components/CredentialsContext";

function Register({ navigation }) {
  const [hidePassword, setHidePassword] = useState(true);
  const [hideConfirmPassword, setHideConfirmPassword] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date(2000, 0, 1));
  const [dob, setDob] = useState("");
  const [message, setMessage] = useState();
  const [messageType, setMessageType] = useState();
  const { setStoredCredentials } = useContext(CredentialContext);

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setShowDatePicker(false);
      setDate(selectedDate);
      setDob(selectedDate.toISOString().split("T")[0]); // Format as YYYY-MM-DD
    }
  };

  const handleRegister = async (credentials, setSubmitting) => {
    handleMessage(null);
    const url = "https://your-api-endpoint.com/register"; // Replace with actual API URL

    try {
      const response = await axios.post(url, credentials);
      const { message, status, data } = response.data;

      if (status !== "SUCCESS") {
        handleMessage(message, status);
      } else {
        persistLogin(data, message, "SUCCESS");
      }
    } catch (error) {
      console.error("Registration Error:", error.response?.data || error.message);
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
          <PageTitle>Start Shield - STSH</PageTitle>
          <SubTitle>Sign Up</SubTitle>

          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={date}
              mode="date"
              is24Hour={true}
              display="default"
              onChange={handleDateChange}
            />
          )}

          <Formik
            initialValues={{
              name: "",
              email: "",
              dateOfBirth: "",
              password: "",
              confirmPassword: "",
            }}
            onSubmit={(values, { setSubmitting }) => {
              values = { ...values, dateOfBirth: dob };
              if (!values.email || !values.password || !values.name || !values.dateOfBirth || !values.confirmPassword) {
                handleMessage("Please fill in all fields");
                setSubmitting(false);
              } else if (values.password !== values.confirmPassword) {
                handleMessage("Passwords do not match!");
                setSubmitting(false);
              } else {
                handleRegister(values, setSubmitting);
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
                  label="Full Name:"
                  icon="person"
                  placeholder="John Doe"
                  placeholderTextColor={Colors.grey}
                  onChangeText={handleChange("name")}
                  onBlur={handleBlur("name")}
                  value={values.name}
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
                  label="Date of Birth:"
                  icon="calendar"
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={Colors.grey}
                  value={dob}
                  isDate={true}
                  editable={false}
                  showDatePicker={() => setShowDatePicker(true)}
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

                <MyTextInput
                  label="Confirm Password:"
                  icon="lock"
                  placeholder="Confirm your password"
                  placeholderTextColor={Colors.grey}
                  onChangeText={handleChange("confirmPassword")}
                  onBlur={handleBlur("confirmPassword")}
                  value={values.confirmPassword}
                  secureTextEntry={hideConfirmPassword}
                  isPassword
                  hidePassword={hideConfirmPassword}
                  setHidePassword={setHideConfirmPassword}
                />

                <MsgBox type={messageType}>{message}</MsgBox>

                {!isSubmitting ? (
                  <StyledButton onPress={handleSubmit}>
                    <ButtonText>Register</ButtonText>
                  </StyledButton>
                ) : (
                  <StyledButton disabled={true}>
                    <ActivityIndicator size="large" color={Colors.black} />
                  </StyledButton>
                )}

                <Line />

                <ExtraView>
                  <ExtraText>Already have an account? </ExtraText>
                  <TextLink onPress={() => navigation.navigate("Login")}>
                    <TextLinkContent>Login</TextLinkContent>
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
        <TouchableOpacity onPress={showDatePicker} style={{ width: "100%" }}>
          <TextInputStyled {...props} />
        </TouchableOpacity>
      ) : (
        <TextInputStyled {...props} />
      )}

      {isPassword && (
        <EyeIcon onPress={() => setHidePassword(!hidePassword)}>
          <Ionicons
            name={hidePassword ? "eye-off" : "eye"}
            size={30}
            color={Colors.grey}
          />
        </EyeIcon>
      )}
    </InputWrapper>
  );
};
