"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

function ParticlesScene() {
  const pointsRef = useRef();
  const { mouse, viewport } = useThree();
  const [positions, setPositions] = useState(null);
  const [originalPositions, setOriginalPositions] = useState(null);
  const velocityRef = useRef([]);

  useEffect(() => {
    const count = 1200;
    const positionArray = new Float32Array(count * 3);
    const velocities = [];

    for (let i = 0; i < count * 3; i += 3) {
      positionArray[i] = (Math.random() - 0.5) * 2;
      positionArray[i + 1] = (Math.random() - 0.5) * 2;
      positionArray[i + 2] = (Math.random() - 0.5) * 2;

      velocities.push({
        x: (Math.random() - 0.5) * 0.005,
        y: (Math.random() - 0.5) * 0.005,
        z: (Math.random() - 0.5) * 0.005,
      });
    }

    setPositions(positionArray);
    setOriginalPositions(new Float32Array(positionArray));
    velocityRef.current = velocities;
  }, []);

  useFrame(() => {
    if (!pointsRef.current || !positions) return;

    const positions_ = pointsRef.current.geometry.attributes.position.array;
    const mouseX = (mouse.x * viewport.width) / 2;
    const mouseY = (mouse.y * viewport.height) / 2;
    const mousePos = new THREE.Vector3(mouseX, mouseY, 0);

    for (let i = 0; i < positions_.length; i += 3) {
      const particlePos = new THREE.Vector3(positions_[i], positions_[i + 1], positions_[i + 2]);
      const distance = particlePos.distanceTo(mousePos);
      const pullStrength = 0.08;
      const maxDistance = 0.5;

      if (distance < maxDistance) {
        const repulsion = (maxDistance - distance) / maxDistance;
        const direction = particlePos.clone().sub(mousePos).normalize();

        velocityRef.current[i / 3].x += direction.x * repulsion * pullStrength;
        velocityRef.current[i / 3].y += direction.y * repulsion * pullStrength;
        velocityRef.current[i / 3].z += direction.z * repulsion * pullStrength;
      }

      const vels = velocityRef.current[i / 3];
      positions_[i] += vels.x;
      positions_[i + 1] += vels.y;
      positions_[i + 2] += vels.z;

      const targetX = originalPositions[i];
      const targetY = originalPositions[i + 1];
      const targetZ = originalPositions[i + 2];

      vels.x += (targetX - positions_[i]) * 0.01;
      vels.y += (targetY - positions_[i + 1]) * 0.01;
      vels.z += (targetZ - positions_[i + 2]) * 0.01;

      vels.x *= 0.97;
      vels.y *= 0.97;
      vels.z *= 0.97;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!positions) return null;

  return (
    <>
      <color attach="background" args={["#fcfcfc"]} />
      <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#8b5cf6"
          size={0.008}
          sizeAttenuation
          depthWrite={false}
          opacity={0.6}
          emissive="#7c3aed"
          emissiveIntensity={0.5}
          toneMapped={false}
        />
      </Points>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#c084fc" />
      <pointLight position={[-10, -10, 10]} intensity={0.3} color="#7c3aed" />
    </>
  );
}

export default ParticlesScene;
