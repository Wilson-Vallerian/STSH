// import React, {useState} from "react";

// // Stack
// import RootStack from "./../navigators/RootStack";
// import { NavigationContainer } from "@react-navigation/native";

// // App Loading
// import AppLoading from "expo-app-loading";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import {CredentialsContext} from "./../components/CredentialsContext";

// export default function StshApp() {
//   const [appReady, setAppReady] = useState(false);
//   const [storedCredentials, setStoredCredentials] = useState("");
//   const checkLoginCredentials = () => {
//     AsyncStorage
//       .getItem("stshCredentials")
//       .then((result)=>{
//         if(result !== null){
//           setStoredCredentials(JSON.parse(result));
//         } else {
//           setStoredCredentials(null);
//         }
//       })
//       .catch(error=>console.log(error))
//   }
//   if(!appReady){
//     return <AppLoading 
//               startAsync={checkLoginCredentials} 
//               onFinish={() => setAppReady(true)}
//               onError={console.warn}
//             />
//   }
//   return(
//     <CredentialsContext.Provide value={{storedCredentials, setStoredCredentials}}>
//       <RootStack />
//     </CredentialsContext.Provide>
//   );
// }

import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import RootStack from "../navigators/RootStack";
import { CredentialContext } from "../components/CredentialsContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SplashScreen from "expo-splash-screen";

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function StshApp() {
  const [appReady, setAppReady] = useState(false);
  const [storedCredentials, setStoredCredentials] = useState(null);

  useEffect(() => {
    const checkLoginCredentials = async () => {
      try {
        const result = await AsyncStorage.getItem("stshCredentials");
        if (result) {
          setStoredCredentials(JSON.parse(result));
        } else {
          setStoredCredentials(null);
        }
      } catch (error) {
        console.error("Error loading credentials:", error);
      }
      setAppReady(true);
      await SplashScreen.hideAsync();
    };

    checkLoginCredentials();
  }, []);

  if (!appReady) {
    return null; // Render nothing while loading
  }

  return (
    <CredentialContext.Provider value={{ storedCredentials, setStoredCredentials }}>
      <RootStack />
    </CredentialContext.Provider>
  );
}
