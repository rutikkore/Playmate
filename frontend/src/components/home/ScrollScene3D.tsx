import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useScroll, MotionValue } from 'framer-motion';
import * as THREE from 'three';
import { PerspectiveCamera } from '@react-three/drei';

// Particle system component
function Particles({ count = 500, scrollYProgress }: { count?: number, scrollYProgress: MotionValue<number> }) {
    const mesh = useRef<THREE.InstancedMesh>(null);
    const geometry = useMemo(() => new THREE.SphereGeometry(0.1, 8, 8), []);
    const material = useMemo(() => new THREE.MeshStandardMaterial({
        color: "#22c55e",
        emissive: "#22c55e",
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.6
    }), []);

    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const t = Math.random() * 100;
            const factor = 20 + Math.random() * 100;
            const speed = 0.01 + Math.random() / 200;
            const x = Math.random() * 40 - 20;
            const y = Math.random() * 40 - 20;
            const z = Math.random() * 40 - 20;
            temp.push({ t, factor, speed, x, y, z, mx: 0, my: 0 });
        }
        return temp;
    }, [count]);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame((state) => {
        // Safe access to scroll progress
        const scroll = scrollYProgress?.get() || 0;

        particles.forEach((particle, i) => {
            let { t } = particle;
            const { factor, speed, x, y, z } = particle;

            t = particle.t += speed / 2;
            const s = Math.cos(t);

            // Add scroll influence to position
            const scrollY = y + scroll * 10; // Particles move up/down with scroll

            dummy.position.set(
                x + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
                scrollY + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
                z + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
            );

            dummy.scale.set(s, s, s);
            dummy.rotation.set(s * 5, s * 5, s * 5);
            dummy.updateMatrix();

            if (mesh.current) {
                mesh.current.setMatrixAt(i, dummy.matrix);
            }
        });
        if (mesh.current) {
            mesh.current.instanceMatrix.needsUpdate = true;
        }
    });

    return (
        <instancedMesh ref={mesh} args={[geometry, material, count]} />
    );
}

// Soccer Ball component
function SoccerBall({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            const scrollProgress = scrollYProgress?.get() || 0;
            const scrollOffset = scrollProgress * 10;

            meshRef.current.rotation.x = state.clock.elapsedTime * 0.3 + scrollOffset;
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.5 + scrollOffset;

            // Move based on scroll
            meshRef.current.position.y = Math.sin(scrollOffset) * 2;
            meshRef.current.position.x = Math.cos(scrollOffset * 0.5) * 3;

            // Scale based on scroll
            const scale = 1 + Math.sin(scrollProgress * Math.PI) * 0.3;
            meshRef.current.scale.setScalar(scale);
        }
    });

    return (
        <mesh ref={meshRef} position={[-5, 2, -5]}>
            <icosahedronGeometry args={[1.5, 1]} />
            <meshStandardMaterial
                color="#ffffff"
                roughness={0.3}
                metalness={0.8}
                emissive="#22c55e"
                emissiveIntensity={0.2}
            />
        </mesh>
    );
}

// Trophy component
function Trophy({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (groupRef.current) {
            const scrollProgress = scrollYProgress?.get() || 0;
            const scrollOffset = scrollProgress * 8;

            groupRef.current.rotation.y = state.clock.elapsedTime * 0.4;
            groupRef.current.position.y = 3 + Math.sin(scrollOffset + Math.PI) * 2;
            groupRef.current.position.x = Math.sin(scrollOffset * 0.3) * 4;

            // Fade in/out based on scroll
            const opacity = Math.sin(scrollProgress * Math.PI * 2);
            groupRef.current.scale.setScalar(Math.max(0.5, opacity));
        }
    });

    return (
        <group ref={groupRef} position={[6, 3, -3]}>
            {/* Base */}
            <mesh position={[0, -1, 0]}>
                <cylinderGeometry args={[0.8, 1, 0.3, 32]} />
                <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
            </mesh>

            {/* Stem */}
            <mesh position={[0, -0.5, 0]}>
                <cylinderGeometry args={[0.3, 0.3, 1, 32]} />
                <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
            </mesh>

            {/* Cup */}
            <mesh position={[0, 0.5, 0]}>
                <cylinderGeometry args={[1, 0.7, 1.5, 32]} />
                <meshStandardMaterial
                    color="#fbbf24"
                    metalness={1}
                    roughness={0.1}
                    emissive="#fbbf24"
                    emissiveIntensity={0.3}
                />
            </mesh>

            {/* Handles */}
            <mesh position={[1.2, 0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
                <torusGeometry args={[0.4, 0.1, 16, 32]} />
                <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
            </mesh>
            <mesh position={[-1.2, 0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
                <torusGeometry args={[0.4, 0.1, 16, 32]} />
                <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
            </mesh>
        </group>
    );
}

// Basketball Hoop component
function BasketballHoop({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (groupRef.current) {
            const scrollProgress = scrollYProgress?.get() || 0;
            const scrollOffset = scrollProgress * 12;

            groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
            groupRef.current.position.y = -2 + Math.cos(scrollOffset) * 2;
            groupRef.current.position.x = Math.sin(scrollOffset * 0.7) * 3;
        }
    });

    return (
        <group ref={groupRef} position={[4, -2, -8]}>
            {/* Rim */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[1.2, 0.08, 16, 32]} />
                <meshStandardMaterial
                    color="#ef4444"
                    metalness={0.8}
                    roughness={0.2}
                    emissive="#ef4444"
                    emissiveIntensity={0.3}
                />
            </mesh>

            {/* Net effect - simplified */}
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <mesh
                    key={i}
                    position={[
                        Math.cos((i / 8) * Math.PI * 2) * 1.1,
                        -0.8,
                        Math.sin((i / 8) * Math.PI * 2) * 1.1
                    ]}
                >
                    <cylinderGeometry args={[0.02, 0.02, 1.5, 8]} />
                    <meshStandardMaterial color="#ffffff" transparent opacity={0.3} />
                </mesh>
            ))}
        </group>
    );
}

// Abstract geometric shapes
function FloatingGeometry({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
    const geo1Ref = useRef<THREE.Mesh>(null);
    const geo2Ref = useRef<THREE.Mesh>(null);
    const geo3Ref = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        const time = state.clock.elapsedTime;
        const scrollProgress = scrollYProgress?.get() || 0;
        const scroll = scrollProgress * 15;

        if (geo1Ref.current) {
            geo1Ref.current.rotation.x = time * 0.3 + scroll * 0.1;
            geo1Ref.current.rotation.y = time * 0.2 + scroll * 0.15;
            geo1Ref.current.position.y = Math.sin(scroll + time) * 3;
            geo1Ref.current.position.z = -10 + Math.cos(scroll) * 2;
        }

        if (geo2Ref.current) {
            geo2Ref.current.rotation.x = time * 0.4 + scroll * 0.12;
            geo2Ref.current.rotation.z = time * 0.3 + scroll * 0.1;
            geo2Ref.current.position.y = Math.cos(scroll + time + 1) * 3;
            geo2Ref.current.position.x = Math.sin(scroll * 0.5) * 5;
        }

        if (geo3Ref.current) {
            geo3Ref.current.rotation.y = time * 0.5 + scroll * 0.2;
            geo3Ref.current.rotation.z = time * 0.2 + scroll * 0.1;
            geo3Ref.current.position.y = Math.sin(scroll + time + 2) * 2.5;
            geo3Ref.current.position.x = Math.cos(scroll * 0.3) * 4;
        }
    });

    return (
        <>
            <mesh ref={geo1Ref} position={[-8, 0, -10]}>
                <dodecahedronGeometry args={[1]} />
                <meshStandardMaterial
                    color="#3b82f6"
                    wireframe
                    transparent
                    opacity={0.4}
                />
            </mesh>

            <mesh ref={geo2Ref} position={[8, 0, -12]}>
                <octahedronGeometry args={[1.2]} />
                <meshStandardMaterial
                    color="#8b5cf6"
                    wireframe
                    transparent
                    opacity={0.3}
                />
            </mesh>

            <mesh ref={geo3Ref} position={[0, 0, -15]}>
                <tetrahedronGeometry args={[1.5]} />
                <meshStandardMaterial
                    color="#06b6d4"
                    wireframe
                    transparent
                    opacity={0.35}
                />
            </mesh>
        </>
    );
}

// Mouse-reactive camera
function MouseCamera() {
    const { camera, mouse } = useThree();

    useFrame(() => {
        // Safe linear interpolation
        if (camera && mouse) {
            camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouse.x * 2, 0.05);
            camera.position.y = THREE.MathUtils.lerp(camera.position.y, mouse.y * 2, 0.05);
        }
    });

    return null;
}

// Main scene component
function Scene({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={75} />
            <MouseCamera />

            {/* Lighting */}
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#22c55e" />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
            <spotLight
                position={[0, 15, 0]}
                angle={0.3}
                penumbra={1}
                intensity={1}
                castShadow
                color="#ffffff"
            />

            {/* 3D Objects */}
            <SoccerBall scrollYProgress={scrollYProgress} />
            <Trophy scrollYProgress={scrollYProgress} />
            <BasketballHoop scrollYProgress={scrollYProgress} />
            <FloatingGeometry scrollYProgress={scrollYProgress} />
            <Particles count={500} scrollYProgress={scrollYProgress} />
        </>
    );
}

// Main export component
export function ScrollScene3D() {
    const { scrollYProgress } = useScroll();

    return (
        <div className="scroll-section">
            <Canvas
                className="canvas-3d"
                gl={{
                    antialias: true,
                    alpha: true,
                    powerPreference: "high-performance"
                }}
            >
                <Suspense fallback={null}>
                    <Scene scrollYProgress={scrollYProgress} />
                </Suspense>
            </Canvas>
        </div>
    );
}
