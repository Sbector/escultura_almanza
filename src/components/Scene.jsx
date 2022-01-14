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

    const loadingManager = new THREE.LoadingManager()

    loadingManager.onStart = ()=>
     {
         console.log('onStart')
     }
     
    loadingManager.onLoaded = ()=>
     {
         console.log('Loaded')
     }
     
    loadingManager.onProgress = ()=>
     {
         console.log('onProgress')
     }
     
    loadingManager.onError = ()=>
     {
         console.log('Error')
     }
     
    const textureLoader = new THREE.TextureLoader(loadingManager)
     
     
    //Textura de contexto
    // const contextTexture = textureLoader.load('./textures/updatedContext.jpg')
    
    //Textura de contexto lejano
    const contextTextureFar = textureLoader.load('./textures/updatedContextFar.jpg')
    //Textura de referencia humana
    const refTexture = textureLoader.load('./textures/human-silhouette-walking-4.png')
    //Textura de envMap
    // const sphereEnv = textureLoader.load('./textures/envMap.jpg')
    //Textura de envMap
    // const scaleMap = textureLoader.load('./textures/escala.jpg')
    

    //  contextTextureFar.minFilter = THREE.NearestFilter
    // contextTextureFar.magFilter = THREE.NearestFilter;

    //EnvMap
    const environmentMap = new THREE.CubeTextureLoader()
    const envMap = environmentMap.load([
        './envmap/colomos/px.png',
        './envmap/colomos/nx.png',
        './envmap/colomos/py.png',
        './envmap/colomos/ny.png',
        './envmap/colomos/pz.png',
        './envmap/colomos/nz.png'
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
    controls.maxDistance = 30
    
    // Offset angle and orbit ground limit
    const centerPosition = controls.target.clone();
    centerPosition.y = 0;
    const groundPosition = camera.position.clone();
    groundPosition.y = 0;
    const d = (centerPosition.distanceTo(groundPosition));

    const origin = new THREE.Vector2(controls.target.y,0);
    const remote = new THREE.Vector2(2.5,d); // replace 0 with raycasted ground altitude
    const angleRadians = Math.atan2(remote.y - origin.y, remote.x - origin.x);
    controls.maxPolarAngle = angleRadians;
    controls.minPolarAngle = Math.PI/4


    /**
     * GLTF model
     */
    const gltfLoader = new GLTFLoader()
    let pieza
    gltfLoader.load(
        './models/bakedMedAjustes/textureBaking(ajustes-10-ene-22).gltf',
        (gltf) => {
            pieza = gltf.scene
            // pieza.scale.z = -1
            pieza.scale.x = -1
            pieza.rotation.y = -Math.PI
            scene.add(pieza)
            // dat.gui controls
            gui.add(pieza.position,'x', -20, 20, 0.0001)
               .name('Xpos')
            gui.add(pieza.position,'z', -10, 10, 0.0001)
               .name('Ypos')
            gui.add(pieza.rotation,'y', -Math.PI, Math.PI, Math.PI * 0.0001)
               .name('Rotación')

            // Objeto auxiliar
            const piezaAux = {
              size: 1,
              mirror: false
            }
            // Controles de escala
            gui.add(piezaAux,'size', {
              'Original': 1,
              'Actualizado': 0.671642
            })
               .name('versión')
               .onChange(()=> {
                 if(!piezaAux.mirror){
                  pieza.scale.set(
                    -(piezaAux.size),
                    piezaAux.size,
                    piezaAux.size
                  )
                 }else{
                  pieza.scale.set(
                    piezaAux.size,
                    piezaAux.size,
                    piezaAux.size
                  )
                 }
                 
            })
            // Checkbox Mirror
            gui.add(piezaAux,'mirror')
               .onChange(()=> {
                //  console.log("mirror")
                //  console.log(piezaAux.mirror)
                 if (piezaAux.mirror){
                 pieza.scale.set(
                   (piezaAux.size * 1), 
                   piezaAux.size,
                   piezaAux.size)
                 }else{
                  pieza.scale.set(
                    (piezaAux.size * -1), 
                    piezaAux.size,
                    piezaAux.size)
                 }
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
    // const context = new THREE.Mesh(
    //     new THREE.PlaneGeometry(157,96.1),
    //     new THREE.MeshBasicMaterial({
    //         map: contextTexture
    //     })
    // )
    // context.rotation.set(-(Math.PI*0.5),0,-(Math.PI * 0.1))
    // // context.rotation.x = -(Math.PI*0.5)
    // // context.rotation.z = -(Math.PI * 0.1)
    // context.position.set(-0.7,-0.001,2.5)
    // // context.position.y = -0.001
    // // context.position.z = 3.13
    // scene.add(context)
    
    //Contexto lejano
    const contextFar = new THREE.Mesh(
        new THREE.PlaneGeometry(571,345),
        new THREE.MeshBasicMaterial({
            map: contextTextureFar
        })
    )
    contextFar.rotation.set(-(Math.PI*0.5),0,-(Math.PI * 0.1))
    contextFar.position.set(-0.7,-0.02,2.5)
    scene.add(contextFar)


    // referencia
    const planeRef = new THREE.PlaneGeometry(.84,1.7)
    const ref = new THREE.Mesh(planeRef,
      new THREE.MeshStandardMaterial({
        map: refTexture,
        transparent: true,
        metalness: .6,
        roughness: .1
      })
    )
    ref.position.set(10.7,1.7/2,-5.1)
    scene.add(ref)
    gui.add(ref.position,'x',-15,15,0.1)
       .name('ReferenciaPosX')
    gui.add(ref.position,'z',-15,15,0.1)
       .name('ReferenciaPosY')


    /**
     * revisión de escala
     */
    // const scale = new THREE.Mesh(
    //   new THREE.PlaneGeometry(.84,13.4),
    //   new THREE.MeshBasicMaterial({
    //     map: scaleMap
    //   })
    // )
    // scale.position.set(-3.7, 13.4/2, -1.5)
    // scale.rotation.y = Math.PI
    // scene.add(scale)

    /**
     * Fake EnvMap
     */
    // const sphereGeometry = new THREE.SphereGeometry (180,16,8)
    // const sphereMaterial = new THREE.MeshBasicMaterial({
    //   map: sphereEnv,
    //   side: THREE.BackSide
    // })
    // const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
    // scene.add(sphere)
    
    /**
     * Iluminación
     */
    scene.environment = envMap

    const light = new THREE.DirectionalLight(0xffffff,1.2)
    light.position.set(-20,50,0)
    scene.add(light)

    const ambient = new THREE.AmbientLight(0xffffff,0.4)
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
      ref.rotation.y = Math.atan2(
        (camera.position.x - ref.position.x),
        (camera.position.z - ref.position.z)
        )
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