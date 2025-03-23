import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React, { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber/native";
import Loader from "@/components/3dModel/Loader";
import { SafeAreaView } from "react-native-safe-area-context";
import useControls from "r3f-native-orbitcontrols";
import { StatusBar } from "expo-status-bar";
import Gradient from "@/components/3dModel/Gradient";
import { DrawingProvider } from "@/components/3dModel/DrawingContext";
import DrawingTools from "@/components/3dModel/DrawingTools";
import Model3D from "@/components/3dModel/Model3D";
import ModeSelector from "@/components/3dModel/ModeSelector";
import * as THREE from "three";

const models = [
  {
    name: "Starlink",
    path: require("../../assets/models/Starlink.glb"),
    scale: 1,
    position: [0, -0.5, 0] as [number, number, number],
    rotation: [0, 0, 0] as [number, number, number],
    autoRotate: false,
  },
  {
    name: "Premier Ball",
    path: require("../../assets/models/premier_ball.glb"),
    scale: 0.5,
    position: [0, 0, 0] as [number, number, number],
    rotation: [0, Math.PI, 0] as [number, number, number],
    autoRotate: false,
  },
  // Buraya yeni modeller ekleyebilirsiniz
];

const Index = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [OrbitControls, events] = useControls();
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [mode, setMode] = useState<"draw" | "move">("move");

  const handleModeChange = (newMode: "draw" | "move") => {
    setMode(newMode);
  };

  const selectedModelData = models.find(
    (model) => model.name === selectedModel
  );

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
            <Canvas
              shadows
              camera={{
                fov: 45,
                near: 0.1,
                far: 1000,
                position: [0, 2, 5],
              }}
              gl={{
                antialias: true,
                alpha: true,
                preserveDrawingBuffer: true,
              }}
            >
              <OrbitControls
                enablePan={false}
                enableZoom={mode === "move"}
                enableRotate={mode === "move"}
              />

              {/* Ambient light for overall illumination */}
              <ambientLight intensity={0.6} />

              {/* Main directional lights */}
              <directionalLight
                position={[5, 5, 5]}
                intensity={0.8}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-far={50}
                shadow-camera-near={0.1}
                shadow-camera-left={-10}
                shadow-camera-right={10}
                shadow-camera-top={10}
                shadow-camera-bottom={-10}
              />

              <directionalLight
                position={[-5, 5, -5]}
                intensity={0.6}
                castShadow
              />

              {/* Hemisphere light for better ambient lighting */}
              <hemisphereLight
                intensity={0.4}
                groundColor={new THREE.Color(0x080820)}
                position={[0, 1, 0]}
              />

              {/* Fill lights for better coverage */}
              <pointLight position={[0, 5, 0]} intensity={0.3} />
              <pointLight position={[0, -5, 0]} intensity={0.2} />
              <pointLight position={[5, 0, 0]} intensity={0.3} />
              <pointLight position={[-5, 0, 0]} intensity={0.3} />

              <Suspense fallback={null}>
                {selectedModelData && (
                  <Model3D
                    mode={mode}
                    modelPath={selectedModelData.path}
                    scale={selectedModelData.scale}
                    position={selectedModelData.position}
                    rotation={selectedModelData.rotation}
                  />
                )}
              </Suspense>
            </Canvas>
          </View>
        </View>

        {mode === "draw" && <DrawingTools />}
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
});

export default Index;
