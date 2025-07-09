/* eslint-disable react/no-unknown-property */
import PropTypes from "prop-types";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls, Bounds, useBounds } from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { useEffect } from "react";

function STLModel({ path }) {
  const geometry = useLoader(STLLoader, path);
  const bounds = useBounds();

  // After model is loaded, fit it into view
  useEffect(() => {
    if (geometry) {
      bounds.refresh().fit(); // this centers and zooms
    }
  }, [geometry]);

  return (
    <mesh
      geometry={geometry}
      rotation={[0, 0, 0]}
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
      camera={{ fov: 60 }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} />

      {/* Bounds wraps your model and auto fits/zooms */}
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
