import React from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";

type ModeSelectorProps = {
  mode: "draw" | "move";
  setMode: (mode: "draw" | "move") => void;
};

const ModeSelector = ({ mode, setMode }: ModeSelectorProps) => {
  console.log("ModeSelector rendered with mode:", mode);

  const handleModeChange = (newMode: "draw" | "move") => {
    console.log("Mode change requested:", newMode);
    setMode(newMode);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.testButton, mode === "draw" && styles.activeButton]}
        onPress={() => {
          console.log("TEST BUTTON PRESSED - DRAW");
          handleModeChange("draw");
        }}
      >
        <Text style={styles.testButtonText}>KALEM MODU</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.testButton, mode === "move" && styles.activeButton]}
        onPress={() => {
          console.log("TEST BUTTON PRESSED - MOVE");
          handleModeChange("move");
        }}
      >
        <Text style={styles.testButtonText}>HAREKET MODU</Text>
      </TouchableOpacity>

      {/* Debug butonu */}
      <TouchableOpacity
        style={[styles.testButton, { backgroundColor: "blue" }]}
        onPress={() => {
          console.log("DEBUG BUTTON PRESSED");
          alert("Current mode: " + mode);
        }}
      >
        <Text style={styles.testButtonText}>DEBUG</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    marginHorizontal: 20,
    borderRadius: 10,
  },
  testButton: {
    backgroundColor: "#444",
    padding: 10,
    borderRadius: 5,
    flex: 1,
  },
  activeButton: {
    backgroundColor: "red",
  },
  testButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default ModeSelector;
