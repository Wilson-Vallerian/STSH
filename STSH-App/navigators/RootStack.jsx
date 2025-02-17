import React from "react";

// Navigation
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Colors } from "@/styles/styles";

// Screens
import Login from "./../screens/login";
import Register from "./../screens/register";
import Home from "./../screens/home";

const Stack = createNativeStackNavigator();

function RootStack() {
  return (
      <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "green",
        },
        headerTintColor: Colors.black,
        headerTransparent: true,
        headerTitle: "Hello",
        headerLeftContainerStyle: {
          paddingLeft: 20,
        },
      }}
      initialRouteName="Register"
    >
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen options={{ headerTintColor: Colors.black }} name="Home" component={Home} />
    </Stack.Navigator>
  );
}

export default RootStack;

// TODO: Correct Alignment, Correct Back Arrow
