import { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import Stats from "three/examples/jsm/libs/stats.module";

const Scene = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const currentRef = mountRef.current;
    const { clientWidth: width, clientHeight: height } = currentRef;

    const texture = new THREE.TextureLoader().load(
        './textures/context.jpg'
    )
    const environmentMap = new THREE.CubeTextureLoader()
    const envMap = environmentMap.load([
        './envmap/px.jpg',
        './envmap/nx.jpg',
        './envmap/py.jpg',
        './envmap/ny.jpg',
        './envmap/pz.jpg',
        './envmap/nz.jpg'
    ])

    const scene = new THREE.Scene(); 
    scene.background = new THREE.Color(0xeafffa);
    const camera = new THREE.PerspectiveCamera(25, width / height, 0.01, 1000);
    camera.position.set(0,1.6,100);
    scene.add(camera);

    const renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentRef.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    // controls.enablePan = false;
    // controls.minDistance = 15;
    // controls.maxDistance = 25;

    // Load model
    const gltfLoader = new GLTFLoader()
    gltfLoader.load('./models/pieza/SCALEDcontext_ModeloOriginal(plano).gltf',
        (gltf) => {
            scene.add(gltf.scene)
        },
        () => {
            console.log('loading...')
        },
        () => {
            console.log('error')
        }
    )

    // context
    const context = new THREE.Mesh(
        new THREE.PlaneGeometry(191,115),
        new THREE.MeshBasicMaterial({
            map: texture
        })
    )
    context.rotation.x = -(Math.PI*0.5)
    context.position.y = -0.01
    scene.add(context)

    // const light = new THREE.PointLight(0xff0000,1,50);
    // light.position.set(0,0,0);
    // scene.add(light);
    scene.environment = envMap;

    const ambient = new THREE.AmbientLight(0xffffff,1);
    scene.add(ambient);

    // camera.lookAt(cube.position);

    const clock = new THREE.Clock();

    const stats = Stats();
    document.body.appendChild(stats.dom);

    const animate = () => {
      stats.update();
      const elapsedTime = clock.getElapsedTime()/5;
    //   cube.rotation.y = elapsedTime;
    //   cube.rotation.x = elapsedTime;
    //   cube.position.y = Math.sin(elapsedTime)*2;
    //   cube.position.x = Math.cos(elapsedTime)*1;
      //console.log(elapsedTime);
      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    const resize = () =>{
        const updatedWidth = currentRef.clientWidth;
        const updatedHeight = currentRef.clientHeight;
        renderer.setSize(updatedWidth, updatedHeight);
        camera.aspect = updatedWidth / updatedHeight;
        camera.updateProjectionMatrix();
    };
    window.addEventListener("resize",resize)

    animate();

    return () => {
      currentRef.removeChild(renderer.domElement);
      document.body.removeChild(stats.dom);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <div ref={mountRef} style={{ width: "100%", height: "100vh" }}></div>;
};

export default Scene;