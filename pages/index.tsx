import type { NextPage } from 'next'
import React, {useEffect, useState} from 'react'
import Head from 'next/head'
import {TweenMax, gsap} from 'gsap'
import * as THREE from "three"
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import { BoxGeometry, Light, PlaneGeometry, TextureLoader,  } from 'three'
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

import styles from '../styles/Home.module.scss'
import Cursor from './components/Cursor'
// import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
// import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
// import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

const Home: NextPage = () => {
  const [loading, setLoading] = useState(true)

  let camera: any
  let container: any
  const scene = new THREE.Scene()
  
  const webGLRender = () => {
    
    container = document.getElementById('webglContainer')
    const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    container.appendChild( renderer.domElement )
    var viewport = { width : container.clientWidth, height : container.clientHeight, aspectRatio : container.clientWidth / container.clientHeight}    
    camera = new THREE.PerspectiveCamera( 45, viewport.aspectRatio, 0.1, 10000 )
    camera.position.z = 100
    var viewSize = { distance : camera.position.z, vFov : (camera.fov * Math.PI) / 180, height : 2 * Math.tan((camera.fov * Math.PI) / 180 / 2) * camera.position.z, width : 2 * Math.tan((camera.fov * Math.PI) / 180 / 2) * camera.position.z * viewport.aspectRatio, }
    var touchvalue:number
    // const controls = new OrbitControls( camera, renderer.domElement );
    // controls.enableRotate = true;
    // controls.update();

    renderer.setClearColor('#111111', 0)
    renderer.setSize(viewport.width, viewport.height)
    renderer.setPixelRatio(viewport.aspectRatio)

    scene.add(new THREE.AmbientLight(0xdddddd, 1000))
    const loader = new GLTFLoader();    
    const loadManager = new THREE.LoadingManager();
    const _loader = new THREE.TextureLoader(loadManager)    
    const r = 'textures/skybox/'
    const urls = [ r + 's_px.jpg',r + 's_nx.jpg',r + 's_py.jpg',r + 's_ny.jpg',r + 's_pz.jpg',r + 's_nz.jpg' ]
    const CubeTexture = new THREE.CubeTextureLoader().load( urls )
		CubeTexture.mapping = THREE.CubeRefractionMapping;

    const bgTexture = _loader.load('textures/bg1.jpg')
    
    loadManager.onProgress = (urlOfLastItemLoaded, itemsLoaded, itemsTotal) => {
      scene.background = bgTexture
      const progress = itemsLoaded / itemsTotal;
      console.log(urlOfLastItemLoaded)
    };

    const SkyBox = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshBasicMaterial({color:0xbbbbbb, side:THREE.DoubleSide, envMap:CubeTexture}))
    // SkyBox.scale.set(1000,1000,1000)
    scene.add(SkyBox)

    animate();

    function animate() {
      requestAnimationFrame( animate )      
      renderer.render( scene, camera )
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })

    window.addEventListener( 'resize', ()=>{
      container = document.getElementById('webglContainer')
      viewport.width = container.clientWidth
      viewport.height = container.clientHeight
      viewport.aspectRatio = viewport.width/viewport.height
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();      
      const viewSize = {
        distance : camera.position.z,
        vFov : (camera.fov * Math.PI) / 180,
        height : 2 * Math.tan((camera.fov * Math.PI) / 180 / 2) * camera.position.z,
        width : 2 * Math.tan((camera.fov * Math.PI) / 180 / 2) * camera.position.z * viewport.aspectRatio,
      }      
      renderer.setSize( container.clientWidth, container.clientHeight )
    })
    window.addEventListener("wheel",  function(event: { deltaY: number }) {
      const alphaX = SkyBox.rotation.x
      console.log(alphaX)
      if(event.deltaY>0){
        TweenMax.to(SkyBox.rotation, 0.5, { x: alphaX + Math.PI/2 ,  ease: 'Power0.easeInOut'})
      }
      else{
        TweenMax.to(SkyBox.rotation, 0.5, { x: alphaX - Math.PI/2 ,  ease: 'Power0.easeInOut'})
      }
    })
    window.addEventListener("touchstart", function(touchEvent) {      
      touchvalue = touchEvent.changedTouches[0].pageY      
    }, false);
    window.addEventListener("touchend", function(touchEvent) {
      const alphaX = SkyBox.rotation.x
      if (touchvalue < touchEvent.changedTouches[0].pageY){        
        TweenMax.to(SkyBox.rotation, 0.5, { x: alphaX + Math.PI/2 ,  ease: 'Power0.easeInOut'})
      } else{
        TweenMax.to(SkyBox.rotation, 0.5, { x: alphaX - Math.PI/2 ,  ease: 'Power0.easeInOut'})
      }
    }, false);
  }

  useEffect(() => {
    if(typeof document !== "undefined"){
      webGLRender()
    }
  }, []) 
  
  return (
    <div className={styles.container}>
      <Head>
        <title>77 Media Holding</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/default-favicon.ico" />
      </Head>

      <main className={styles.main}>
             
      </main>
      <div id='webglContainer' className='fixed top-0 left-0 w-full h-full'></div>
      <div className='hidden md:block'>
        <Cursor/>
      </div>
    </div>
  )
}

export default Home