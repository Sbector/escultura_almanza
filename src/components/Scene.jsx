import { useRef, useEffect } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"

import * as dat from 'dat.gui'
import Stats from "three/examples/jsm/libs/stats.module"


const Scene = () => {
  const mountRef = useRef(null)

  useEffect(() => {
    const currentRef = mountRef.current
    const { clientWidth: width, clientHeight: height } = currentRef

    /**
     * Global variables
     */
    const gui = new dat.GUI()

    /**
     * Carga de texturas y envMap
     */
    //Textura de contexto
    const texture = new THREE.TextureLoader().load(
        './textures/context(pow2).jpg'
    )
    // texture.minFilter = THREE.NearestFilter
    texture.magFilter = THREE.NearestFilter;

    //EnvMap
    const environmentMap = new THREE.CubeTextureLoader()
    const envMap = environmentMap.load([
        './envmap/px.jpg',
        './envmap/nx.jpg',
        './envmap/py.jpg',
        './envmap/ny.jpg',
        './envmap/pz.jpg',
        './envmap/nz.jpg'
    ])

    /**
     * Scene, camera & renderer
     */
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xeafffa)
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.01, 1000)
    camera.position.set(20,1.6,-7)
    scene.add(camera)

    const renderer = new THREE.WebGLRenderer({antialias:true})
    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio)
    currentRef.appendChild(renderer.domElement)

    /**
     * Controls
     */
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.target.set(0,4,0)
    controls.enablePan = false
    controls.minDistance = 15
    controls.maxDistance = 56
    
    const centerPosition = controls.target.clone();
    centerPosition.y = 0;
    const groundPosition = camera.position.clone();
    groundPosition.y = 0;
    const d = (centerPosition.distanceTo(groundPosition));

    const origin = new THREE.Vector2(controls.target.y,0);
    const remote = new THREE.Vector2(2.5,d); // replace 0 with raycasted ground altitude
    const angleRadians = Math.atan2(remote.y - origin.y, remote.x - origin.x);
    controls.maxPolarAngle = angleRadians;


    /**
     * GLTF model
     */
    const gltfLoader = new GLTFLoader()
    let pieza
    gltfLoader.load('./models/pieza/SCALEDcontext_ModeloOriginal(plano).gltf',
        (gltf) => {
            pieza = gltf.scene
            scene.add(pieza)
            // dat.gui controls
            gui.add(pieza.position,'x', -20, 20, 0.001)
               .name('Xpos')
            gui.add(pieza.position,'z', -10, 10, 0.001)
               .name('Ypos')
            gui.add(pieza.rotation,'y', -Math.PI, Math.PI, Math.PI * 0.001)
               .name('Rotación')

            const piezaAux = {
              size: 1
            }
            gui.add(piezaAux,'size', {
              'normal': 1,
              'nuevo': 0.5
            })
               .name('versión')
               .onChange(()=> {
                 pieza.scale.set(
                   piezaAux.size,
                   piezaAux.size,
                   piezaAux.size
                 )
               })
        },
        () => {
            console.log('loading...')
        },
        () => {
            console.log('error')
        }
    )
    
    

    /**
     * Contexto y referencias
     */
    const context = new THREE.Mesh(
        new THREE.PlaneGeometry(191,115),
        new THREE.MeshBasicMaterial({
            map: texture
        })
    )
    context.rotation.x = -(Math.PI*0.5)
    context.rotation.z = -(Math.PI * 0.1)
    context.position.y = -0.01
    context.position.z = 10
    scene.add(context)

    // referencia
    const ref = new THREE.Mesh(
      new THREE.CylinderGeometry()
    )

    
    /**
     * Iluminación
     */
    scene.environment = envMap

    const light = new THREE.PointLight(0xffffff,4,80)
    light.position.set(-20,50,0)
    scene.add(light)

    const ambient = new THREE.AmbientLight(0xffffff,1)
    scene.add(ambient)

    /**
     * Clock
     */
    const clock = new THREE.Clock()

    /**
     * Stats
     */
    const stats = Stats()
    document.body.appendChild(stats.dom)

    /**
     * Animate
     */
    const animate = () => {
      stats.update()
      const elapsedTime = clock.getElapsedTime()/5
      //console.log(elapsedTime);
      controls.update()
      renderer.render(scene, camera)
      requestAnimationFrame(animate)
    };

    /**
     * Resize
     */
    const resize = () =>{
        const updatedWidth = currentRef.clientWidth
        const updatedHeight = currentRef.clientHeight
        renderer.setSize(updatedWidth, updatedHeight)
        camera.aspect = updatedWidth / updatedHeight
        camera.updateProjectionMatrix()
    };
    window.addEventListener("resize",resize)

    animate()

    return () => {
      currentRef.removeChild(renderer.domElement)
      document.body.removeChild(stats.dom)
      gui.destroy()
      window.removeEventListener("resize", resize)
    }
  }, [])

  return <div ref={mountRef} style={{ width: "100%", height: "100vh" }}></div>
}

export default Scene