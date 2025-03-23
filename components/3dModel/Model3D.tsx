import * as THREE from "three";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { useGLTF, useAnimations } from "@react-three/drei/native";
import { useDrawingContext } from "./DrawingContext";
import { GLTF } from "three-stdlib";
import { useFrame } from "@react-three/fiber/native";
import { useSharedValue, withTiming } from "react-native-reanimated";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

// Maksimum çizim noktası sayısı
const MAX_POINTS = 1000;
// Nokta ekleme aralığı (ms)
const POINT_THROTTLE = 16; // ~60fps

type GLTFResult = GLTF & {
  nodes: {
    [key: string]: THREE.Mesh;
  };
  materials: {
    [key: string]: THREE.MeshStandardMaterial;
  };
};

type Model3DProps = {
  mode: "draw" | "move";
  modelPath: string | string[];
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  animationName?: string;
  autoRotate?: boolean;
} & JSX.IntrinsicElements["group"];

const Model3D: React.FC<Model3DProps> = ({
  mode,
  modelPath,
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  ...props
}) => {
  const group = useRef<THREE.Group>(null);
  const gltf = useGLTF(modelPath) as GLTFResult;
  const lastPointTime = useRef(0);
  const completedLines = useRef<THREE.Line[]>([]);
  const drawingPoints = useRef<THREE.Vector3[]>([]);
  const currentLine = useRef<THREE.Line | null>(null);
  const [drawing, setDrawing] = useState(false);
  const rotationY = useSharedValue(0);

  const { actions } = useAnimations(gltf.animations, group);
  const { color, lineWidth } = useDrawingContext();

  useEffect(() => {
    if (gltf.scene) {
      gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // Mesh'in normallerini düzelt
          child.geometry.computeVertexNormals();

          // Tangent hesaplama için gerekli attribute'ları kontrol et
          if (
            child.geometry.attributes.position &&
            child.geometry.attributes.normal &&
            child.geometry.attributes.uv &&
            child.geometry.index
          ) {
            try {
              child.geometry.computeTangents();
            } catch (error) {
              console.warn("Tangent hesaplama başarısız oldu:", error);
            }
          }

          // Orijinal materyal özelliklerini koru
          const originalColor = child.material.color
            ? child.material.color.clone()
            : new THREE.Color(0xffffff);
          const originalMap = child.material.map;

          // Çift taraflı materyal oluştur
          const newMaterial = new THREE.MeshStandardMaterial({
            color: originalColor,
            map: originalMap,
            metalness: 0.3,
            roughness: 0.7,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 1,
            flatShading: false,
            wireframe: false,
          });

          // Eski materyali dispose et ve yenisini ata
          if (child.material) {
            child.material.dispose();
          }
          child.material = newMaterial;

          // Gölgeleri ve ray etkileşimini etkinleştir
          child.castShadow = true;
          child.receiveShadow = true;
          child.raycast = new THREE.Mesh().raycast;
        }
      });
    }
  }, [gltf]);

  // Temizleme fonksiyonu
  const cleanup = useCallback(() => {
    if (currentLine.current && group.current) {
      group.current.remove(currentLine.current);
      currentLine.current.geometry.dispose();
      (currentLine.current.material as THREE.Material).dispose();
      currentLine.current = null;
    }
    drawingPoints.current = [];
  }, []);

  // Yeni çizgi oluşturma fonksiyonu
  const createNewLine = useCallback(
    (points: THREE.Vector3[]) => {
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color,
        linewidth: lineWidth,
      });
      return new THREE.Line(geometry, material);
    },
    [color, lineWidth]
  );

  // Mod değiştiğinde temizlik yap
  useEffect(() => {
    if (mode === "move") {
      cleanup();
      setDrawing(false);
    }
  }, [mode, cleanup]);

  // Component unmount olduğunda temizlik
  useEffect(() => {
    return () => {
      cleanup();
      completedLines.current.forEach((line) => {
        if (line && group.current) {
          group.current.remove(line);
          line.geometry.dispose();
          (line.material as THREE.Material).dispose();
        }
      });
      completedLines.current = [];
    };
  }, [cleanup]);

  useFrame(() => {
    if (group.current) {
      group.current.rotation.y = rotationY.value;
    }
  });

  const handlePointerDown = (event: any) => {
    if (mode === "draw" && event.face) {
      const point = event.point.clone();

      // Önceki çizgiyi temizle
      cleanup();

      // Yeni çizgiye başla
      drawingPoints.current = [point];
      currentLine.current = createNewLine([point, point]);

      if (group.current && currentLine.current) {
        group.current.add(currentLine.current);
      }

      setDrawing(true);
      lastPointTime.current = Date.now();
    }
  };

  const handlePointerMove = (event: any) => {
    if (mode === "draw" && drawing && currentLine.current && event.face) {
      const now = Date.now();
      if (now - lastPointTime.current < POINT_THROTTLE) {
        return;
      }
      lastPointTime.current = now;

      const point = event.point.clone();

      // Minimum mesafe kontrolü
      const lastPoint = drawingPoints.current[drawingPoints.current.length - 1];
      if (lastPoint && point.distanceTo(lastPoint) < 0.01) {
        return; // Çok yakın noktaları ekleme
      }

      if (drawingPoints.current.length >= MAX_POINTS) {
        drawingPoints.current.shift();
      }

      drawingPoints.current.push(point);

      // Geçici çizgiyi güncelle
      const newGeometry = new THREE.BufferGeometry().setFromPoints(
        drawingPoints.current
      );
      currentLine.current.geometry.dispose();
      currentLine.current.geometry = newGeometry;
    }
  };

  const handlePointerUp = () => {
    if (mode === "draw" && drawing) {
      if (drawingPoints.current.length > 1) {
        // Mevcut çizgiyi tamamlanmış çizgilere ekle
        if (currentLine.current) {
          completedLines.current.push(currentLine.current);

          // Maksimum çizgi sayısını kontrol et
          if (completedLines.current.length > 50) {
            const oldestLine = completedLines.current.shift();
            if (oldestLine && group.current) {
              group.current.remove(oldestLine);
              oldestLine.geometry.dispose();
              (oldestLine.material as THREE.Material).dispose();
            }
          }

          // Referansı temizle ama çizgiyi silme
          currentLine.current = null;
        }
      } else {
        // Tek noktalı çizgileri temizle
        cleanup();
      }

      setDrawing(false);
      drawingPoints.current = [];
    }
  };

  return (
    <group
      ref={group}
      {...props}
      dispose={null}
      onPointerDown={mode === "draw" ? handlePointerDown : undefined}
      onPointerMove={mode === "draw" ? handlePointerMove : undefined}
      onPointerUp={mode === "draw" ? handlePointerUp : undefined}
    >
      <primitive
        object={gltf.scene}
        scale={scale}
        position={position}
        rotation={rotation}
      />
    </group>
  );
};

// GLTF modellerinin önbelleğe alınmasını devre dışı bırak
useGLTF.preload = () => {};

export default Model3D;
