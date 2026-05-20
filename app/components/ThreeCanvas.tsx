"use client";
import { useEffect, useRef } from "react";

export default function ThreeCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let animId: number;
    let cleanup: (() => void) | null = null;

    (async () => {
      const THREE = await import("three");
      type ThreeMesh = InstanceType<typeof THREE.Mesh>;
      type S = { mesh: ThreeMesh; vx: number; vy: number; vr: number };

      const W = window.innerWidth, H = window.innerHeight;
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(W, H);
      renderer.setClearColor(0x000000, 0);
      const canvas = renderer.domElement;
      canvas.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;";
      mount.appendChild(canvas);

      const scene  = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, W / H, 0.1, 1000);
      camera.position.z = 5;

      const isMobile = W < 768;
      const N = isMobile ? 800 : 2500;
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(N * 3);
      const col = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) {
        pos[i*3]   = (Math.random() - 0.5) * 25;
        pos[i*3+1] = (Math.random() - 0.5) * 25;
        pos[i*3+2] = (Math.random() - 0.5) * 18;
        if (Math.random() > 0.7) { col[i*3]=0.91; col[i*3+1]=0.09; col[i*3+2]=0.23; }
        else { const b=0.15+Math.random()*0.25; col[i*3]=b; col[i*3+1]=b; col[i*3+2]=b; }
      }
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("color",    new THREE.BufferAttribute(col, 3));
      const pMat = new THREE.PointsMaterial({ size: isMobile?0.06:0.035, vertexColors:true, transparent:true, opacity:0.85 });
      const points = new THREE.Points(geo, pMat);
      scene.add(points);

      const shapes: S[] = [];
      const geoList = [new THREE.IcosahedronGeometry(0.45,0), new THREE.OctahedronGeometry(0.38,0), new THREE.TetrahedronGeometry(0.42,0)];
      for (let i = 0; i < (isMobile?4:9); i++) {
        const m = new THREE.MeshBasicMaterial({ color:i%3===0?0xe8173a:0xffffff, wireframe:true, transparent:true, opacity:i%3===0?0.13:0.05 });
        const mesh = new THREE.Mesh(geoList[i%3].clone(), m);
        mesh.position.set((Math.random()-0.5)*16,(Math.random()-0.5)*10,(Math.random()-0.5)*7-2);
        scene.add(mesh);
        shapes.push({ mesh, vx:(Math.random()-0.5)*0.004, vy:(Math.random()-0.5)*0.003, vr:Math.random()*0.005+0.001 });
      }

      let mx=0, my=0;
      const onMove  = (e: MouseEvent)  => { mx=(e.clientX/window.innerWidth-0.5)*0.7; my=-(e.clientY/window.innerHeight-0.5)*0.7; };
      const onTouch = (e: TouchEvent)  => { if(!e.touches[0])return; mx=(e.touches[0].clientX/window.innerWidth-0.5)*0.3; my=-(e.touches[0].clientY/window.innerHeight-0.5)*0.3; };
      const onResize= () => { const w=window.innerWidth,h=window.innerHeight; camera.aspect=w/h; camera.updateProjectionMatrix(); renderer.setSize(w,h); };
      window.addEventListener("mousemove",onMove,{passive:true});
      window.addEventListener("touchmove",onTouch,{passive:true});
      window.addEventListener("resize",onResize,{passive:true});

      const animate = () => {
        animId = requestAnimationFrame(animate);
        points.rotation.y += 0.00025; points.rotation.x += 0.00008;
        camera.position.x += (mx-camera.position.x)*0.028;
        camera.position.y += (my-camera.position.y)*0.028;
        shapes.forEach(s => {
          s.mesh.rotation.x+=s.vr; s.mesh.rotation.y+=s.vr*0.6;
          s.mesh.position.x+=s.vx; s.mesh.position.y+=s.vy;
          if(Math.abs(s.mesh.position.x)>10)s.vx*=-1;
          if(Math.abs(s.mesh.position.y)>7) s.vy*=-1;
        });
        renderer.render(scene, camera);
      };
      animate();

      cleanup = () => {
        cancelAnimationFrame(animId);
        window.removeEventListener("mousemove",onMove);
        window.removeEventListener("touchmove",onTouch);
        window.removeEventListener("resize",onResize);
        renderer.dispose();
        if(canvas.parentNode) canvas.parentNode.removeChild(canvas);
      };
    })();

    return () => { cleanup?.(); };
  }, []);

  return <div ref={mountRef} style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none"}}/>;
}
