'use client';

import React, { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Center } from '@react-three/drei';
import { Box3, Vector3 } from 'three';

interface Model3DViewerProps {
  url: string;
  width: number;
  height: number;
}

const Model = ({ url }: { url: string }) => {
  const { scene } = useGLTF(url);
  const ref = useRef<any>(null);

  // Auto-scale model to fit view
  React.useEffect(() => {
    if (ref.current) {
      const box = new Box3().setFromObject(ref.current);
      const size = new Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      if (maxDim > 0) {
        const scale = 2 / maxDim;
        ref.current.scale.setScalar(scale);
      }
    }
  }, [scene]);

  return (
    <Center>
      <primitive ref={ref} object={scene} />
    </Center>
  );
};

const LoadingFallback = () => (
  <mesh>
    <boxGeometry args={[0.5, 0.5, 0.5]} />
    <meshStandardMaterial color="#6366f1" wireframe />
  </mesh>
);

export const Model3DViewer = ({ url, width, height }: Model3DViewerProps) => {
  return (
    <div
      className="model-3d-viewer"
      style={{ width, height }}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <Canvas
        camera={{ position: [0, 1, 3], fov: 45 }}
        style={{ borderRadius: '6px' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <Suspense fallback={<LoadingFallback />}>
          <Model url={url} />
          <Environment preset="studio" />
        </Suspense>
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          autoRotate
          autoRotateSpeed={2}
        />
      </Canvas>

      <div className="model-3d-badge">3D</div>
    </div>
  );
};
