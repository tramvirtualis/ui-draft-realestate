import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { galleryState } from "./galleryState";

/* Cảnh 3D "cú máy xuyên qua phòng tranh" (Three.js qua React Three Fiber).
   - Camera bay dọc một đường cong 3D (CatmullRom) theo galleryState.progress do ScrollTrigger điều khiển:
     cuộn tới là bay tới, cuộn ngược là lùi lại đúng đường cũ. Camera nhìn trước một đoạn trên đường bay + nghiêng nhẹ khi rẽ.
   - Các tấm ảnh treo hai bên đường bay ở độ cao, độ sâu, góc xoay khác nhau; sương mù cùng màu nền
     làm ảnh hiện dần từ bóng tối, lớn lên khi tới gần, lướt qua rồi chìm lại phía sau.
   - Tấm cuối nằm chắn ngay cuối đường bay: camera lao thẳng vào cho tới khi ảnh phủ kín khung → nối sang cảnh sau.
   - Bụi sáng lơ lửng tạo cảm giác chiều sâu. Chỉ vẽ khi khối đang trong màn hình. */

export type GalleryItem = { src: string; label: string };

const BG = "#0d0d12";
const GOLD = "#c9991f";
const FINAL_Z = -61;

const PATH = new THREE.CatmullRomCurve3(
  [
    [0, 0, 8],
    [1.3, 0.5, 0],
    [-1.1, 0.9, -8],
    [-2.1, -0.2, -16],
    [0.4, -0.7, -24],
    [2.3, 0.3, -32],
    [0.5, 1, -40],
    [-1.3, 0.2, -48],
    [0, 0, -56],
  ].map(([x, y, z]) => new THREE.Vector3(x, y, z)),
  false,
  "catmullrom",
  0.5,
);

// Giả ngẫu nhiên cố định theo chỉ số (bố cục giống nhau mỗi lần tải)
const rnd = (i: number, k: number) => {
  const s = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return s - Math.floor(s);
};

type Slot = { pos: THREE.Vector3; rot: THREE.Euler; width: number; side: number };

function layout(n: number, spread: number): Slot[] {
  return Array.from({ length: n }, (_, i) => {
    const t = 0.05 + (i * 0.86) / Math.max(1, n - 1);
    const p = PATH.getPointAt(t);
    const side = i % 2 ? 1 : -1;
    return {
      pos: new THREE.Vector3(p.x + side * spread * (0.85 + rnd(i, 1) * 0.6), p.y + (rnd(i, 2) - 0.5) * 2.2, p.z + (rnd(i, 3) - 0.5) * 2),
      rot: new THREE.Euler((rnd(i, 4) - 0.5) * 0.18, -side * (0.3 + rnd(i, 5) * 0.35), (rnd(i, 6) - 0.5) * 0.12),
      width: 2.6 + rnd(i, 7) * 1.4,
      side,
    };
  });
}

function Photo({ tex, slot, index }: { tex: THREE.Texture; slot: Slot; index: number }) {
  const group = useRef<THREE.Group>(null);
  const img = tex.image as { width?: number; height?: number } | undefined;
  const aspect = img?.width && img?.height ? img.height / img.width : 0.66;
  const w = slot.width;
  const h = w * aspect;

  useFrame(({ camera, clock }) => {
    const g = group.current;
    if (!g) return;
    // Càng tới gần, tấm ảnh càng xoay hé ra phía camera rồi lật đi khi đã lướt qua
    const dz = g.position.z - camera.position.z; // âm: còn ở phía trước
    const near = THREE.MathUtils.clamp(1 - Math.abs(dz) / 10, 0, 1);
    g.rotation.y = slot.rot.y * (1 - near * 0.7) + (dz > 0 ? slot.side * near * 0.4 : 0);
    g.position.y = slot.pos.y + Math.sin(clock.elapsedTime * 0.6 + index) * 0.08; // lơ lửng
  });

  return (
    <group ref={group} position={slot.pos} rotation={slot.rot}>
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[w + 0.08, h + 0.08]} />
        <meshBasicMaterial color={GOLD} side={THREE.DoubleSide} />
      </mesh>
      <mesh>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={tex} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
    </group>
  );
}

function FinalPlate({ tex }: { tex: THREE.Texture }) {
  return (
    <mesh position={[0, 0, FINAL_Z]}>
      <planeGeometry args={[14, 9]} />
      <meshBasicMaterial map={tex} toneMapped={false} />
    </mesh>
  );
}

function Dust() {
  const geo = useMemo(() => {
    const n = 600;
    const a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      a[i * 3] = (rnd(i, 11) - 0.5) * 18;
      a[i * 3 + 1] = (rnd(i, 12) - 0.5) * 9;
      a[i * 3 + 2] = 10 - rnd(i, 13) * 74;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(a, 3));
    return g;
  }, []);
  return (
    <points geometry={geo}>
      <pointsMaterial color="#e8b93a" size={0.035} sizeAttenuation transparent opacity={0.7} depthWrite={false} />
    </points>
  );
}

function Rig({ items, captionRef }: { items: GalleryItem[]; captionRef?: RefObject<HTMLSpanElement | null> }) {
  const textures = useTexture(items.map((i) => i.src)) as THREE.Texture[];
  const { camera, size } = useThree();
  const spread = size.width / size.height < 1 ? 1.3 : 2.7; // màn dọc: ảnh khép sát đường bay hơn
  const photos = items.slice(0, -1);
  const slots = useMemo(() => layout(photos.length, spread), [photos.length, spread]);
  const look = useMemo(() => new THREE.Vector3(), []);
  const pos = useMemo(() => new THREE.Vector3(), []);
  const ta = useMemo(() => new THREE.Vector3(), []);
  const tb = useMemo(() => new THREE.Vector3(), []);
  const finalTarget = useMemo(() => new THREE.Vector3(0, 0, FINAL_Z), []);
  const caption = useRef("");

  useLayoutEffect(() => {
    textures.forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
      t.needsUpdate = true;
    });
  }, [textures]);

  useFrame(() => {
    const p = THREE.MathUtils.clamp(galleryState.progress, 0, 1);
    PATH.getPointAt(p, pos);
    PATH.getPointAt(Math.min(1, p + 0.035), look);
    // Đoạn cuối: hướng nhìn dồn dần về tấm ảnh cuối để cú máy kết thúc thẳng vào nó
    look.lerp(finalTarget, THREE.MathUtils.smoothstep(p, 0.82, 1));
    camera.position.copy(pos);
    camera.lookAt(look);
    PATH.getTangentAt(p, ta);
    PATH.getTangentAt(Math.min(1, p + 0.03), tb);
    // Nghiêng nhẹ theo khúc cua (giới hạn ±0.12 rad để cú máy đằm), về thẳng khi sắp chạm tấm cuối
    const bank = THREE.MathUtils.clamp((ta.x - tb.x) * 1.4, -0.12, 0.12);
    camera.rotateZ(bank * (1 - THREE.MathUtils.smoothstep(p, 0.85, 1)));

    // Chú thích: tấm ảnh gần nhất phía trước camera
    let best = -1;
    let bestDz = Infinity;
    slots.forEach((s, i) => {
      const dz = camera.position.z - s.pos.z; // dương: còn ở phía trước
      if (dz > -1 && dz < bestDz) {
        bestDz = dz;
        best = i;
      }
    });
    const text = p > 0.9 || best < 0 ? items[items.length - 1].label : photos[best].label;
    if (captionRef?.current && text !== caption.current) {
      caption.current = text;
      captionRef.current.textContent = text;
    }
  });

  return (
    <>
      {photos.map((it, i) => (
        <Photo key={it.src} tex={textures[i]} slot={slots[i]} index={i} />
      ))}
      <FinalPlate tex={textures[textures.length - 1]} />
      <Dust />
    </>
  );
}

// items: các tấm treo dọc đường bay; PHẦN TỬ CUỐI là tấm chắn cuối đường (ảnh của cảnh kế tiếp)
export default function GalleryFlythrough({ items, captionRef }: { items: GalleryItem[]; captionRef?: RefObject<HTMLSpanElement | null> }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  // Chỉ vẽ liên tục khi khối nằm trong màn hình
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "200px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="absolute inset-0" aria-hidden>
      <Canvas
        dpr={[1, 1.75]}
        frameloop={active ? "always" : "never"}
        camera={{ fov: 50, near: 0.1, far: 120, position: [0, 0, 8] }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={[BG]} />
        <fog attach="fog" args={[BG, 4, 26]} />
        <Suspense fallback={null}>
          <Rig items={items} captionRef={captionRef} />
        </Suspense>
      </Canvas>
    </div>
  );
}
