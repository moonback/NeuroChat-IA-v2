import { VRCanvas, DefaultXRControllers } from '@react-three/xr';
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Mesh } from 'three';

function AssistantSphere() {
  const ref = useRef<Mesh>(null!);
  useFrame(({ clock }) => {
    const s = 1 + Math.sin(clock.elapsedTime * 2) * 0.1;
    ref.current.scale.set(s, s, s);
  });
  return (
    <mesh ref={ref} position={[0, 1.5, -2]}>
      <sphereGeometry args={[0.3, 32, 32]} />
      <meshStandardMaterial color="hotpink" emissive="hotpink" emissiveIntensity={0.5} />
    </mesh>
  );
}

export function VrScene({ children }: { children?: React.ReactNode }) {
  return (
    <VRCanvas>
      <ambientLight intensity={0.5} />
      <pointLight position={[2, 2, 2]} />
      <AssistantSphere />
      {children}
      <DefaultXRControllers />
    </VRCanvas>
  );
}
