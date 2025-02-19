import styled from "styled-components/native";
import { View, Text, Image, TextInput, TouchableOpacity } from "react-native";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { Dimensions } from "react-native";

// Screen Height
const { height } = Dimensions.get("window");
// Status Bar
const statusBarHeight = Constants.statusBarHeight;

// Colors
export const Colors = {
  grey: "#959398",  // Placeholder Text
  red: "#dc3645",
  darkGreen: "#295662",  // Button Color
  lightGreen: "#4eba6f",  // Button Color
  darkCharcoal: "#333",  // Text Input Box
  black: "#000000",  // Text Color (Primary)
  white: "#fff",  // Text Color (Secondary)
  linkColor: "#007bff",  // Link and Icon Color
  darkGrey: "#63666A",  // Line
  inputText: "#ffffff",  // Input Text Color In Box
};

// Login & Register Screens
export const StyledContainer = styled.View`
  flex: 1;
  padding: 25px;
  padding-top: ${statusBarHeight}px;
  background-color: ${Colors.white};
  min-height: ${height}px;
`;

export const InnerContainer = styled.View`
  flex: 1;
  width: 100%;
  align-items: center;
`;

export const LoginLogo = styled.Image`
  width: 250px;
  height: 250px;
`;

export const PageTitle = styled.Text`
  font-size: 30px;
  text-align: center;
  font-weight: bold;
  color: ${Colors.black};
  padding: 10px;

  ${(props) => props.welcome && `
    margin-bottom: 5px;
    `}
`;

export const SubTitle = styled.Text`
  font-size: 18px;
  margin-bottom: 20px;
  letter-spacing: 1px;
  font-weight: bold;
  color: ${Colors.black};

  ${(props) => props.welcome && `
    font-size: 20px;
    padding: 0px;
    margin-bottom: 0px;
    `}
`;

export const FormAreaStyled = styled.View`
  width: 90%;
  align-items: center;
`;

export const TextInputStyled = styled.TextInput`
  width: 100%;
  background-color: ${Colors.darkCharcoal};
  padding: 15px;
  padding-left: 50px;
  border-radius: 5px;
  font-size: 16px;
  height: 55px;
  margin-top: 5px;
  color: ${Colors.inputText};
`;

export const InputWrapper = styled.View`
  width: 100%;
  align-items: center;
  margin-bottom: 15px;
  position: relative;
`;

export const InputLabel = styled.Text`
  color: ${Colors.darkCharcoal};
  font-size: 13px;
  text-align: left;
  width: 100%;
  padding-left: 5px;
`;

export const LoginIcon = styled.View`
  position: absolute;
  left: 10px;
  top: 35px;
  z-index: 1;
`;

export const EyeIcon = styled.TouchableOpacity`
  position: absolute;
  right: 15px;
  top: 35px;
  z-index: 1;
`;

export const StyledButton = styled.TouchableOpacity`
  padding: 15px;
  background-color: ${Colors.darkGreen};
  justify-content: center;
  align-items: center;
  border-radius: 5px;
  margin-vertical: 5px;
  height: 55px;
  width: 100%;

  ${(props) => props.google == true && `
    background-color: ${Colors.lightGreen};
    flex-direction: row;
    justify-content: center;
    `}
`;

export const ButtonText = styled.Text`
  color: ${Colors.white};
  font-size: 16px;
  font-weight: bold;

  ${(props) => props.google == true && `
    padding-left: 10px;
    `}
`;

export const MsgBox = styled.Text`
  text-align: center;
  font-size: 13px;
  color: ${props => props.type == 'SUCCESS' ? Colors.lightGreen: Colors.red}
`

export const Line = styled.View`
  height: 1px;
  width: 100%;
  background-color: ${Colors.darkGrey};
  margin-vertical: 10px;
`

export const ExtraView = styled.View`
    justify-content: center;
    flex-direction: row;
    align-items: center;
    padding: 10px;
`

export const ExtraText = styled.Text`
    justify-content: center;
    align-content: center;
    color: ${Colors.black};
    font-size: 15px;
`

export const TextLink = styled.TouchableOpacity`
    justify-content: center;
    align-items: center;
`

export const TextLinkContent = styled.Text`
    color: ${Colors.linkColor};
    font-size: 15px;
`

// Welcome Screen
export const WelcomeContainer = styled(InnerContainer)`
    padding: 25px;
    padding-top: 10px;
    justify-content: center;
`

export const Avatar = styled.Image`
    width: 100px;
    height: 100px;
    margin: auto;
    border-radius: 50px;
    border-width: 2px;
    button-color: ${Colors.white};
    margin-bottom: 10px;
    margin-top:10px;
`

export const WelcomeImage = styled.Image`
    height: 50%;
    min-width: 100%;
`
