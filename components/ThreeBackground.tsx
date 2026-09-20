
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Html } from '@react-three/drei';
import { Facebook, Instagram, Linkedin, Twitter, Youtube, Hash, AtSign, Globe } from 'lucide-react';

const FloatingIcon = ({ icon: Icon, color, position, speed, rotationIntensity }: any) => {
  return (
    <Float speed={speed} rotationIntensity={rotationIntensity} floatIntensity={2}>
      <mesh position={position}>
        <Html transform distanceFactor={15}>
          <div className={`p-4 rounded-3xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] transition-all hover:scale-125 hover:bg-white/10 group`}>
             <Icon size={48} className={`${color} opacity-80 group-hover:opacity-100 transition-opacity filter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]`} />
          </div>
        </Html>
      </mesh>
    </Float>
  );
};

const SocialField = () => {
  return (
    <group>
       <FloatingIcon icon={Facebook} color="text-blue-500" position={[-4, 2, -5]} speed={1.5} rotationIntensity={0.5} />
       <FloatingIcon icon={Instagram} color="text-pink-500" position={[4, -2, -6]} speed={2} rotationIntensity={0.7} />
       <FloatingIcon icon={Linkedin} color="text-blue-400" position={[-3, -3, -4]} speed={1.2} rotationIntensity={0.4} />
       <FloatingIcon icon={Twitter} color="text-cyan-400" position={[3, 3, -5]} speed={1.8} rotationIntensity={0.6} />
       <FloatingIcon icon={Youtube} color="text-red-500" position={[0, 1, -8]} speed={1} rotationIntensity={0.3} />
       <FloatingIcon icon={Hash} color="text-purple-400" position={[-6, 0, -7]} speed={2.5} rotationIntensity={0.8} />
       <FloatingIcon icon={AtSign} color="text-orange-400" position={[6, 1, -9]} speed={1.5} rotationIntensity={0.5} />
       <FloatingIcon icon={Globe} color="text-green-400" position={[0, -4, -6]} speed={1.3} rotationIntensity={0.4} />
    </group>
  );
};

const ThreeBackground: React.FC<{ mode: any }> = ({ mode }) => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <fog attach="fog" args={['#000000', 5, 25]} />
        <ambientLight intensity={0.5} />
        <SocialField />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-80" />
      <div className="absolute inset-0 opacity-[0.03] brightness-100 contrast-150 mix-blend-overlay" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`}}></div>
    </div>
  );
};

export default ThreeBackground;