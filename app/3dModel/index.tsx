import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React, { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber/native";
import Trigger from "@/components/3dModel/Trigger";
import Loader from "@/components/3dModel/Loader";
import { SafeAreaView } from "react-native-safe-area-context";
import Starlink from "@/components/3dModel/Starlink";
import useControls from "r3f-native-orbitcontrols";
import { StatusBar } from "expo-status-bar";
import Gradient from "@/components/3dModel/Gradient";
import { router } from "expo-router";
import { DrawingProvider } from "@/components/3dModel/DrawingContext";
import DrawingTools from "@/components/3dModel/DrawingTools";
import PremierBall from "@/components/3dModel/PremierBall";
import ModeSelector from "@/components/3dModel/ModeSelector";

const Index = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [OrbitControls, events] = useControls();
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [mode, setMode] = useState<"draw" | "move">("move");

  console.log("Current mode in Index:", mode);

  const handleModeChange = (newMode: "draw" | "move") => {
    console.log("Setting new mode in Index:", newMode);
    setMode(newMode);
  };

  const models = [
    { name: "Starlink", component: Starlink },
    { name: "Premier Ball", path: "../../assets/models/premier_ball.glb" },
  ];

  if (!selectedModel) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar animated style="light" />
        <View style={styles.textContainer}>
          <Text style={styles.textTitle}>Model Seçimi</Text>
          <Text style={styles.text}>Boyamak istediğiniz 3D modeli seçin</Text>
        </View>
        <View style={styles.modelListContainer}>
          {models.map((model) => (
            <TouchableOpacity
              key={model.name}
              style={styles.modelButton}
              onPress={() => setSelectedModel(model.name)}
            >
              <Text style={styles.modelButtonText}>{model.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <DrawingProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar animated style="light" />
        <View style={styles.textContainer}>
          <Text style={styles.textTitle}>3D Model Boyama</Text>
          <Text style={styles.text}>
            Kalem ikonuna tıklayarak boyama yapabilir, el ikonuna tıklayarak
            modeli hareket ettirebilirsiniz
          </Text>
        </View>

        <ModeSelector mode={mode} setMode={handleModeChange} />

        <View style={styles.canvasContainer}>
          <View
            style={[styles.modelContainer]}
            {...(mode === "move" ? events : {})}
          >
            <Gradient />
            {loading && <Loader />}
            <Canvas>
              <OrbitControls
                enablePan={false}
                enableZoom={mode === "move"}
                enableRotate={mode === "move"}
              />
              <directionalLight position={[1, 0, 0]} args={["white", 2]} />
              <directionalLight position={[-1, 0, 0]} args={["white", 2]} />
              <directionalLight position={[0, 0, 1]} args={["white", 2]} />
              <directionalLight position={[0, 0, -1]} args={["white", 2]} />
              <directionalLight position={[0, 1, 0]} args={["white", 15]} />
              <directionalLight position={[0, -1, 0]} args={["white", 2]} />
              <Suspense fallback={<Trigger setLoading={setLoading} />}>
                {selectedModel === "Starlink" ? (
                  <Starlink mode={mode} />
                ) : (
                  <PremierBall mode={mode} />
                )}
              </Suspense>
            </Canvas>
          </View>
        </View>

        {mode === "draw" && <DrawingTools />}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setSelectedModel(null)}
          >
            <Text style={styles.textButton}>Model Değiştir</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <Text style={styles.textButton}>Geri Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </DrawingProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  canvasContainer: {
    flex: 1,
    position: "relative",
  },
  modelContainer: {
    flex: 1,
  },
  textContainer: {
    marginHorizontal: 24,
    gap: 4,
    marginVertical: 20,
  },
  textTitle: {
    fontFamily: "Inter-Bold",
    color: "white",
    fontSize: 18,
    textAlign: "center",
  },
  text: {
    fontFamily: "Inter-Light",
    color: "white",
    fontSize: 14,
    textAlign: "center",
  },
  button: {
    backgroundColor: "white",
    padding: 14,
    flex: 1,
    marginHorizontal: 10,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  textButton: {
    fontFamily: "Inter-Bold",
    color: "black",
    fontSize: 14,
  },
  modelListContainer: {
    padding: 20,
    gap: 10,
  },
  modelButton: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 8,
  },
  modelButtonText: {
    fontFamily: "Inter-Bold",
    color: "black",
    fontSize: 16,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    padding: 20,
  },
});

export default Index;
