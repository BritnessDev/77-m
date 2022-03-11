import type { NextPage } from 'next'
import React, {useEffect, useState} from 'react'
import Head from 'next/head'
import {TweenLite, gsap} from 'gsap'
import * as THREE from "three"
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import { TextureLoader } from 'three'
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

import styles from '../styles/Home.module.scss'
import Loading1 from './components/Loading1'
import Loading2 from './components/Loading2'
import SmoothScroll from './components/SmoothScroll'
import Cursor from './components/Cursor'
import Header from './components/Header'

const Home: NextPage = () => {
  const [loading, setLoading] = useState(true)
  const [viewport, setViewPort] = useState({width:0, height:0, aspectRatio:1})
  const [viewSize, setViewSize] = useState({distance:3, vFov:0, height:1, width:1})
  const [cursorPos, setPosition] = useState({x:0, y:0})
  const [uniforms, setUniforms] = useState({uTexture: {value: new THREE.Texture},uOffset: {value: new THREE.Vector2(0.0, 0.0)},uAlpha: {value: 1}})    
  const bkColor = ['#000', '#3e0000', '#3e3e00', '#003e00', '#003e3e', '#00003e', '#3e3e3e', '#000']
  const foreColor = '#dddddd'
  let mouse = new THREE.Vector2() 
  let camera: any
  let container: any
  var cube : THREE.Mesh
  const scene = new THREE.Scene()
  setTimeout(() => setLoading(false), 1000);
  const webGLRender = () => {
    container = document.getElementById('webGLRender')
    const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true });
    container.appendChild( renderer.domElement )
    const viewport = { width : container.clientWidth, height : container.clientHeight, aspectRatio : container.clientWidth / container.clientHeight}    
    camera = new THREE.PerspectiveCamera( 75, viewport.aspectRatio, 0.1, 100000 )
    const viewSize = { distance : camera.position.z, vFov : (camera.fov * Math.PI) / 180, height : 2 * Math.tan((camera.fov * Math.PI) / 180 / 2) * camera.position.z, width : 2 * Math.tan((camera.fov * Math.PI) / 180 / 2) * camera.position.z * viewport.aspectRatio, }
    camera.position.set(600, 100, 1000)
    const controls = new OrbitControls( camera, renderer.domElement );
    controls.enableRotate = true;
    controls.update();

    setViewPort(viewport)
    setViewSize(viewSize)
    renderer.setClearColor('#000000', 0.1)
    renderer.setSize(viewport.width, viewport.height)
    renderer.setPixelRatio(window.devicePixelRatio)

    const texturloader = new TextureLoader();
    const loader = new GLTFLoader();
    const r = 'textures/logos/';
    const urls = [ r + '1.png', r + '2.png', r + '3.png', r + '4.png', r + '5.png', r + '6.png' ];
    const textureCube = new THREE.CubeTextureLoader().load( urls );
    
    loader.load( 'models/cube.glb', function ( gltf ) {
      let geo         
      const data = { color: 0x9999dd, envMap: textureCube, refractionRatio: 1.0 , };
      // const _material = new THREE.MeshPhongMaterial(data);
      const _material = new THREE.MeshBasicMaterial(data);
      gltf.scene.traverse( function( object ) {
        if ((object instanceof THREE.Mesh)) geo = object.geometry; 
      });
      cube = new THREE.Mesh(geo, _material)
      cube.scale.set(100,100,100)
      cube.position.set(600, 0, 0)
      scene.add(cube);
    }, undefined, function ( error ) {
      console.error( error );
    });

    animate();
    function animate() {
      requestAnimationFrame( animate );
      
      renderer.render( scene, camera );    
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })

    window.addEventListener( 'resize', onWindowResize )
    function onWindowResize() {      
      const viewport = {
        width : container.clientWidth, height : container.clientHeight,
        aspectRatio : container.clientWidth / container.clientHeight
      }
      
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      
      const viewSize = {
        distance : camera.position.z,
        vFov : (camera.fov * Math.PI) / 180,
        height : 2 * Math.tan((camera.fov * Math.PI) / 180 / 2) * camera.position.z,
        width : 2 * Math.tan((camera.fov * Math.PI) / 180 / 2) * camera.position.z * viewport.aspectRatio,
      }
      
      setViewPort(viewport)
      setViewSize(viewSize)
      renderer.setSize( window.innerWidth, window.innerHeight );
    }
  }

  useEffect(() => {
    if(typeof document !== "undefined"){
      webGLRender()
    }
  }, [])

  useEffect(() => {
    window.addEventListener("mousemove", (event: { clientX: number; clientY: number }) => {
      setPosition({x:event.clientX, y:event.clientY})      
    });
  }, [])
  
  useEffect(() => {
    mouse.x = (cursorPos.x / viewport.width) * 2 - 1
    mouse.y = -(cursorPos.y / viewport.height) * 2 + 1    
    let x = mouse.x * viewSize.width/2;
    let y = mouse.y * viewSize.height/2;
  })

  useEffect(() => {
    window.addEventListener('scroll', ()=>{
      let scrollPercent = Math.floor(((document.documentElement.scrollTop || document.body.scrollTop) / ((document.documentElement.scrollHeight || document.body.scrollHeight) - document.documentElement.clientHeight)) * 100)
      const body = document.getElementsByTagName('body')
      const temp = ((scrollPercent<11)?11:scrollPercent)-11 
      const newbgColor = bkColor[ Math.floor(temp/11) ]
      gsap.to(body, 2, {backgroundColor:`${newbgColor}`})
      if(scrollPercent>94){
        const body = document.getElementById('contact_bg')
        gsap.to(body, 2, {opacity:0.25})
      }else{
        const body = document.getElementById('contact_bg')
        gsap.to(body, 2, {opacity:0})
      }
    });    
  },[]); 

  const followerCursorHidden = () => {
    if(typeof window !== "undefined"){
      let cursors = document.getElementsByClassName('cursor')
      if(cursors){
        gsap.to(cursors[0], 0.3, {opacity:0, scale:20});
        gsap.to(cursors[1], 0.3, {opacity:0, scale:20});
      }
    }
  }

  const followerCursorShow = () => {
    if(typeof window !== "undefined"){
      let cursors = document.getElementsByClassName('cursor')
      if(cursors){
        gsap.to(cursors[0], 0.3, {opacity:1, scale:1});
        gsap.to(cursors[1], 0.3, {opacity:1, scale:1});
      }
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>77 Media Holding</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/default-favicon.ico" />
      </Head>

      <main className={styles.main}>        
        <div className='Loading-wrapper fixed top-0 left-0 w-full h-[100vh]' style={{background:'#000', zIndex:'10000', display:loading?'block':'none'}}>
          <Loading2/>
        </div>
        <SmoothScroll>
          <div className='content-wrapper mx-auto' style={{ color:foreColor}}>            
            <div id='webGLRender' className='fixed w-full h-full border border-green border-dotted top-0 left-0 pointer-events-none z-0'></div>
            <section id='main' className='main w-full h-[100vh] relative z-1' >
              <div className='w-full h-[100vh] max-w-[1440px] mx-auto'>
                <div className='w-full h-full  flex items-center justify-center pt-12'>
                  <div className='details grid grid-cols-1 md:grid-cols-2 w-full'>
                    <div className='fade-up-hidden relative overflow-hidden w-full h-[50vh]'>
                      <div className='fade-up-show absolute top-0 left-0 w-full px-8'>
                        <div className='title text-[50px] mb-8'>
                          Humble Past
                        </div>
                        <div className='text-[30px]'>
                          Established Feb 22, 2010 with very limited capital, 77 Media started as a 1 man multimedia production house. Today through the grace of God, 77 Media has become a holding company with 7 subsidiaries in the fields of communication, entertainment, and technology.
                        </div>
                      </div>
                      {/* <div className='fade-up-show absolute '>
                        <div className='title text-[30px]'>
                          Exciting Future
                        </div>
                        <div className='text-[20px]'>
                          Our vision is clear, and our ambitions are great. We are always looking for the next revolutionizing investment opportunity. Whether it is through organic growth of our current businesses or through a drastic pivot, we are eager and ready for any challenge.
                        </div>
                      </div> */}
                    </div>
                    
                  </div>
                </div>
              </div>
            </section>
          </div>
        </SmoothScroll>        
      </main>
      <Header/>
      <div className='hidden md:block'>
        <Cursor/>
      </div>
    </div>
  )
}

export default Home