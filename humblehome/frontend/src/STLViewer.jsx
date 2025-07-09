/* eslint-disable react/no-unknown-property */

import PropTypes from "prop-types";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, Bounds, Center } from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";

function STLModel({ path }) {
  const geometry = useLoader(STLLoader, path);

  return (
    <mesh
      geometry={geometry}
      rotation={[-Math.PI / 2, -0.3, -0.5]}
      position={[0, -1, 0]} // move down slightly
    >
      <meshStandardMaterial color="orange" />
    </mesh>
  );
}

STLModel.propTypes = {
  path: PropTypes.string.isRequired,
};

export default function STLViewer({ url }) {
  return (
    <Canvas
      style={{ width: "100%", height: "100%" }}
      camera={{ position: [0, 0, 40], fov: 60 }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} />
      <Bounds fit clip>
        <STLModel path={url} />
      </Bounds>
      <OrbitControls />
    </Canvas>
  );
}

STLViewer.propTypes = {
  url: PropTypes.string.isRequired,
};
