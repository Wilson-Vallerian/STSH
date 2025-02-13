import { View, Text, StyleSheet } from "react-native";
import { Link } from "expo-router";
import React from "react";

const stshApp = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Test</Text>
    </View>
  );
};

export default stshApp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
  },
  text: {
    color: "black",
    fontSize: 42,
    fontWeight: "bold",
    textAlign: "center",
  },
});
