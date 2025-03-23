import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useDrawingContext } from "./DrawingContext";

const DrawingTools = () => {
  const { setColor, setLineWidth } = useDrawingContext();

  const colors = [
    "#FF0000", // Kırmızı
    "#00FF00", // Yeşil
    "#0000FF", // Mavi
    "#FFFF00", // Sarı
  ];

  const lineWidths = [2, 5, 8]; // İnce, orta ve kalın kalem kalınlıkları

  return (
    <View style={styles.container}>
      <View style={styles.toolSection}>
        {lineWidths.map((width, index) => (
          <TouchableOpacity
            key={`width-${index}`}
            style={[styles.sizeButton, { height: width * 2, width: width * 2 }]}
            onPress={() => setLineWidth(width)}
          />
        ))}
      </View>
      <View style={styles.toolSection}>
        {colors.map((color, index) => (
          <TouchableOpacity
            key={`color-${index}`}
            style={[styles.colorButton, { backgroundColor: color }]}
            onPress={() => setColor(color)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 20,
    left: 20,
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 10,
    padding: 10,
    zIndex: 1000,
  },
  toolSection: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  sizeButton: {
    backgroundColor: "#000",
    borderRadius: 50,
    marginHorizontal: 5,
  },
  colorButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "#000",
  },
});

export default DrawingTools;
