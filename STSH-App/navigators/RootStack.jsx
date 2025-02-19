import React, { useContext } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Colors } from "../styles/styles";

// Screens
import Login from "../screens/login";
import Register from "../screens/register";
import Home from "../screens/home";

// Credentials Context
import { CredentialContext } from "../components/CredentialsContext";

const Stack = createNativeStackNavigator();

function RootStack() {
  const { storedCredentials } = useContext(CredentialContext);

  // Default Credentials (If No Login Exists)
  const hasCredentials = storedCredentials !== null;

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "transparent" },
        headerTintColor: Colors.black,
        headerTransparent: true,
        headerTitle: "",
        headerLeftContainerStyle: { paddingLeft: 20 },
      }}
      initialRouteName={hasCredentials ? "Home" : "Login"}
    >
      {hasCredentials ? (
        <Stack.Screen
          name="Home"
          component={Home}
          options={{ headerShown: false }}
        />
      ) : (
        <>
          <Stack.Screen
            name="Login"
            component={Login}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Register" component={Register} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default RootStack;
