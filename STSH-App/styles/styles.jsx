import styled from "styled-components/native";
import { View, Text, Image, TextInput, TouchableOpacity } from "react-native";
import Constants from "expo-constants";

// Status Bar
const statusBarHeight = Constants.statusBarHeight;

// Colors
export const Colors = {
  primary: "#f5f5f5", 
  secondary: "#333", // Text color
  btnColor: "#007bff", // Button color
  darkGrey: "#63666A", // Placeholder text color
  inputText: "#ffffff", // Fixed input text color for visibility
  green: "#00ff00",
};

export const StyledContainer = styled.View`
  flex: 1;
  padding: 25px;
  padding-top: ${statusBarHeight + 10}px;
  background-color: ${Colors.primary};
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

export const LoginTitle = styled.Text`
  font-size: 30px;
  text-align: center;
  font-weight: bold;
  color: ${Colors.secondary};
  padding: 10px;
`;

export const SubTitle = styled.Text`
  font-size: 18px;
  margin-bottom: 20px;
  letter-spacing: 1px;
  font-weight: bold;
  color: ${Colors.secondary}; /* Fixed color */
`;

export const FormAreaStyled = styled.View`
  width: 90%;
  align-items: center;
`;

export const TextInputStyled = styled.TextInput`
  width: 100%;
  background-color: ${Colors.secondary};
  padding: 15px;
  padding-left: 50px;
  border-radius: 5px;
  font-size: 16px;
  height: 55px;
  margin-top: 5px;
  color: ${Colors.inputText}; /* Fixed input text color */
`;

export const InputWrapper = styled.View`
  width: 100%;
  align-items: center;
  margin-bottom: 15px;
  position: relative; /* Fixed overlapping issue */
`;

export const InputLabel = styled.Text`
  color: ${Colors.secondary}; /* Fixed label color */
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
  background-color: ${Colors.green};
  justify-content: center;
  align-items: center;
  border-radius: 5px;
  margin-vertical: 5px;
  height: 55px;
  width: 100%;

  ${(props) => props.google == true && `
    background-color: ${Colors.secondary};
    flex-direction: row;
    justify-content: center;
    `}
`;

export const ButtonText = styled.Text`
  color: ${Colors.primary};
  font-size: 16px;
  font-weight: bold;

  ${(props) => props.google == true && `
    padding-left: 10px;
    `}
`;

export const MsgBox = styled.Text`
  text-align: center;
  font-size: 13px;
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
    color: ${Colors.secondary};
    font-size: 15px;
`

export const TextLink = styled.TouchableOpacity`
    justify-content: center;
    align-items: center;
`

export const TextLinkContent = styled.Text`
    color: ${Colors.btnColor};
    font-size: 15px;
`