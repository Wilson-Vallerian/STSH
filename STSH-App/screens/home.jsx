import React, { useContext } from "react";
import {
  InnerContainer,
  PageTitle,
  SubTitle,
  FormAreaStyled,
  StyledButton,
  ButtonText,
  WelcomeContainer,
  WelcomeImage,
  Avatar,
} from "../styles/styles";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CredentialContext } from "../components/CredentialsContext";

function Home({ navigation }) {
  const { storedCredentials, setStoredCredentials } = useContext(CredentialContext);

  // Default Credentials (if user is not logged in)
  const defaultCredentials = {
    name: "John Doe",
    email: "johndoe@gmail.com",
    photoUrl: null,
  };

  // Merge stored credentials with defaults (if empty, use defaults)
  const { name, email, photoUrl } = storedCredentials || defaultCredentials;

  const AvatarImg = photoUrl ? { uri: photoUrl } : require("../assets/images/STSH-Logo.png");

  const clearLogin = async () => {
    try {
      await AsyncStorage.removeItem("stshCredentials");
      setStoredCredentials(null);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <>
      <StatusBar style="dark" />
      <InnerContainer>
        <WelcomeImage source={AvatarImg} resizeMode="contain" />
        <WelcomeContainer>
          <PageTitle welcome={true}>Welcome!</PageTitle>
          <SubTitle welcome={true}>{name}</SubTitle>
          <SubTitle welcome={true}>{email}</SubTitle>

          <FormAreaStyled>
            <Avatar resizeMode="contain" source={require("../assets/images/STSH-Logo.png")} />
            <StyledButton onPress={clearLogin}>
              <ButtonText>Logout</ButtonText>
            </StyledButton>
          </FormAreaStyled>
        </WelcomeContainer>
      </InnerContainer>
    </>
  );
}

export default Home;
