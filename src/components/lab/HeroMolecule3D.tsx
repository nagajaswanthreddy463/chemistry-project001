import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { CAFFEINE_ATOMS, CAFFEINE_BONDS, ATOM_STYLE } from "@/lib/caffeine";

function Bond({ a, b }: { a: THREE.Vector3; b: THREE.Vector3 }) {
  const { pos, quat, len } = useMemo(() => {
    const dir = new THREE.Vector3().subVectors(b, a);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    return { pos: new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5), quat: q, len: dir.length() };
  }, [a, b]);
  return (
    <mesh position={pos} quaternion={quat}>
      <cylinderGeometry args={[0.09, 0.09, len, 12]} />
      <meshStandardMaterial color="#c9d3e6" roughness={0.4} metalness={0.2} />
    </mesh>
  );
}

function Molecule() {
  const group = useRef<THREE.Group>(null);
  const pts = useMemo(() => CAFFEINE_ATOMS.map((a) => new THREE.Vector3(a.x, a.y, a.z)), []);
  useFrame((_, d) => { if (group.current) group.current.rotation.y += Math.min(d, 0.05) * 0.35; });
  return (
    <group ref={group} rotation={[0.35, 0, 0.1]}>
      {CAFFEINE_ATOMS.map((a, i) => (
        <mesh key={i} position={pts[i]!}>
          <sphereGeometry args={[ATOM_STYLE[a.el].r, 32, 32]} />
          <meshStandardMaterial color={ATOM_STYLE[a.el].color} roughness={0.3} metalness={0.15} />
        </mesh>
      ))}
      {CAFFEINE_BONDS.map(([i, j], k) => <Bond key={k} a={pts[i]!} b={pts[j]!} />)}
    </group>
  );
}

export default function HeroMolecule3D() {
  return (
    <Canvas camera={{ position: [0, 0, 11], fov: 45 }} dpr={[1, 2]} gl={{ alpha: true, antialias: true }}
      onCreated={({ gl }) => gl.domElement.parentElement?.parentElement?.setAttribute("data-scene-ready", "")}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 6, 8]} intensity={1.6} />
      <pointLight position={[-6, -3, 4]} intensity={30} color="#3b7bff" />
      <pointLight position={[6, 4, -3]} intensity={25} color="#C9A227" />
      <Molecule />
      <OrbitControls enableZoom={false} enablePan={false} />
    </Canvas>
  );
}
