import * as THREE from "three";
import { createNoise3D } from "simplex-noise";
import { useRecoilValue } from "recoil";
import { processState, speedState, spikeState } from "../atoms/slider-atom";
import { useEffect } from "react";

const Blob = () => {
  const speedValue = useRecoilValue(speedState);
  const spikeValue = useRecoilValue(spikeState);
  const processValue = useRecoilValue(processState);

  useEffect(() => {
    const canvas = document.getElementById("blob-canvas") as HTMLCanvasElement;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      context: canvas?.getContext("webgl2") || undefined,
      antialias: true,
      alpha: true,
    });

    const noise3D = createNoise3D();

    renderer.setSize(canvas.width, canvas.height);
    renderer.setPixelRatio(window.devicePixelRatio || 1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      canvas.width / canvas.height,
      0.1,
      1000
    );

    camera.position.z = 5;

    const geometry = new THREE.SphereGeometry(0.8, 128, 128);

    const material = new THREE.MeshPhongMaterial({
      color: 0xe4ecfa,
      shininess: 100,
    });
    const sphere = new THREE.Mesh(geometry, material);

    const lightTop = new THREE.DirectionalLight(0xffffff, 0.7);
    lightTop.position.set(0, 500, 200);
    lightTop.castShadow = true;
    scene.add(lightTop);

    const lightBottom = new THREE.DirectionalLight(0xffffff, 0.25);
    lightBottom.position.set(0, -500, 400);
    lightBottom.castShadow = true;
    scene.add(lightBottom);

    const ambientLight = new THREE.AmbientLight(0x798296);
    scene.add(ambientLight);

    scene.add(sphere);

    const update = () => {
      const time =
          performance.now() * 0.00001 * speedValue * Math.pow(processValue, 3),
        spikes = spikeValue * processValue;

      const position = sphere.geometry.attributes.position;
      const vector = new THREE.Vector3();

      for (let i = 0; i < position.count; i++) {
        vector.fromBufferAttribute(position, i);
        vector
          .normalize()
          .multiplyScalar(
            1 +
              0.3 *
                noise3D(
                  vector.x * spikes,
                  vector.y * spikes,
                  vector.z * spikes + time
                )
          );
      }

      sphere.geometry.computeVertexNormals();
      position.needsUpdate = true;
    };

    const animate = () => {
      update();
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [speedValue, spikeValue, processValue]);

  return (
    <div id="blob">
      <canvas id="blob-canvas" />
    </div>
  );
};

export default Blob;
