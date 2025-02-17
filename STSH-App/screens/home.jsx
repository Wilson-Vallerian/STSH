import React from "react";
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

function Home({navigation}) {
  return (
    <>
      <StatusBar style="light"/>
      <InnerContainer>
        <WelcomeImage
          source={require("./../assets/images/STSH-Logo.png")}
          resizeMode="contain"
        />
        <WelcomeContainer>
          <PageTitle welcome={true}>Welcome!</PageTitle>
          <SubTitle welcome={true}>John Doe</SubTitle>
          <SubTitle welcome={true}>JohnDoe@gmail.com</SubTitle>

          <FormAreaStyled>
            <Avatar
              resizeMode="contain"
              source={require("./../assets/images/STSH-Logo.png")}
            />
            <StyledButton onPress={() => {navigation.navigate("Login")}}>
              <ButtonText>Logout</ButtonText>
            </StyledButton>
          </FormAreaStyled>
        </WelcomeContainer>
      </InnerContainer>
    </>
  );
}

export default Home;
