import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useLoader } from '@react-three/fiber'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'

function STLModel({path}) {
    const geometry = useLoader(STLLoader, path)
    return (
        <mesh geometry={geometry} rotation={[-Math.PI / 2,0,0]} scale={1}>
            <meshStandardMaterial color="orange"/>
        </mesh>
    )
}

export default function STLViewer({url}) {
    return (
        <Canvas camera = {{position: [0,0,100], fov: 60}}>
            <ambientLight intensity={0.5}/>
            <directionalLight position={[10,10,10]} />
            <STLModel path={url} />
            <OrbitControls/>
        </Canvas>
    )
}
