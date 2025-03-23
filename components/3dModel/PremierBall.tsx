import * as THREE from "three";
import React, { useRef, useState, useEffect } from "react";
import { useGLTF } from "@react-three/drei/native";
import { useDrawingContext } from "./DrawingContext";
import { GLTF } from "three-stdlib";
import { useFrame, useThree } from "@react-three/fiber/native";

type GLTFResult = GLTF & {
  nodes: {
    [key: string]: THREE.Mesh;
  };
  materials: {
    [key: string]: THREE.MeshStandardMaterial;
  };
};

type PremierBallProps = {
  mode: "draw" | "move";
} & JSX.IntrinsicElements["group"];

const PremierBall = ({ mode, ...props }: PremierBallProps) => {
  const group = useRef<THREE.Group>(null);
  const gltf = useGLTF(
    require("../../assets/models/premier_ball.glb")
  ) as GLTFResult;
  const { color, lineWidth } = useDrawingContext();
  const [drawing, setDrawing] = useState(false);
  const drawingPoints = useRef<THREE.Vector3[]>([]);
  const tempLine = useRef<THREE.Line | null>(null);

  useEffect(() => {
    console.log("PremierBall mode changed:", mode);
  }, [mode]);

  useEffect(() => {
    console.log("GLTF Structure:", {
      nodes: Object.keys(gltf.nodes),
      materials: Object.keys(gltf.materials),
      scenes: gltf.scenes,
      scene: gltf.scene,
    });
  }, [gltf]);

  const handlePointerDown = (event: any) => {
    if (mode === "draw") {
      console.log("Starting drawing");
      setDrawing(true);
      const point = event.point.clone();
      drawingPoints.current = [point];

      // Create initial temporary line
      const geometry = new THREE.BufferGeometry().setFromPoints([point, point]);
      const material = new THREE.LineBasicMaterial({
        color,
        linewidth: lineWidth,
        transparent: true,
        opacity: 0.5,
      });
      tempLine.current = new THREE.Line(geometry, material);
      if (group.current) {
        group.current.add(tempLine.current);
      }
    }
  };

  const handlePointerMove = (event: any) => {
    if (mode === "draw" && drawing) {
      const point = event.point.clone();
      drawingPoints.current.push(point);

      // Update temporary line
      if (tempLine.current && group.current) {
        const geometry = new THREE.BufferGeometry().setFromPoints(
          drawingPoints.current
        );
        tempLine.current.geometry.dispose();
        tempLine.current.geometry = geometry;
      }
    }
  };

  const handlePointerUp = () => {
    if (mode === "draw" && drawing) {
      console.log("Finishing drawing");
      setDrawing(false);

      // Remove temporary line
      if (tempLine.current && group.current) {
        group.current.remove(tempLine.current);
        tempLine.current.geometry.dispose();
        (tempLine.current.material as THREE.Material).dispose();
        tempLine.current = null;
      }

      // Create final line if we have enough points
      if (drawingPoints.current.length > 1) {
        const geometry = new THREE.BufferGeometry().setFromPoints(
          drawingPoints.current
        );
        const material = new THREE.LineBasicMaterial({
          color,
          linewidth: lineWidth,
          transparent: true,
          opacity: 0.8,
        });
        const line = new THREE.Line(geometry, material);
        if (group.current) {
          group.current.add(line);
        }
      }
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
        scale={0.5}
        position={[0, 0, 0]}
        rotation={[0, Math.PI, 0]}
      />
    </group>
  );
};

export default PremierBall;
