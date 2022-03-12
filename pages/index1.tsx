import type { NextPage } from 'next'
import React, {useEffect, useState} from 'react'
import Head from 'next/head'
import {TweenMax, gsap} from 'gsap'
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
  let fadeupOrder = -1
  const scene = new THREE.Scene()
  setTimeout(() => {setLoading(false);}, 1000);
  // setTimeout(() => fadeUp(), 5000);
  const fadeUp = () => {
    const fadeups = document.getElementsByClassName('fade-up-show')
    fadeupOrder ++
    fadeupOrder %=2
    if (fadeups){
      TweenMax.to(fadeups[fadeupOrder], 0.1, {y:1000, opacity:0})
      TweenMax.to(fadeups[fadeupOrder], 2, {y:0, opacity:1, delay:0.1, ease: 'Power4.easeOut',})
      TweenMax.to(fadeups[fadeupOrder], 2, {y:-1000, opacity:0, delay:5, ease: 'Power4.easeIn',})
      TweenMax.to(fadeups[fadeupOrder], {y:1000, opacity:0, delay:7,})
    }
  }
  const webGLRender = () => {
    container = document.getElementById('webGLRender')
    const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true });
    container.appendChild( renderer.domElement )
    const viewport = { width : container.clientWidth, height : container.clientHeight, aspectRatio : container.clientWidth / container.clientHeight}    
    camera = new THREE.PerspectiveCamera( 75, viewport.aspectRatio, 0.1, 100000 )
    const viewSize = { distance : camera.position.z, vFov : (camera.fov * Math.PI) / 180, height : 2 * Math.tan((camera.fov * Math.PI) / 180 / 2) * camera.position.z, width : 2 * Math.tan((camera.fov * Math.PI) / 180 / 2) * camera.position.z * viewport.aspectRatio, }
    camera.position.set(0, 30, 800)
    const controls = new OrbitControls( camera, renderer.domElement );
    controls.enableRotate = true;
    controls.update();

    setViewPort(viewport)
    setViewSize(viewSize)
    renderer.setClearColor('#000000', 0.1)
    renderer.setSize(viewport.width, viewport.height)
    renderer.setPixelRatio(window.devicePixelRatio)

    const light = new THREE.PointLight(0xffffff, 2)
    light.position.set(0, 600, -500)
    scene.add(light)

    const texturloader = new TextureLoader();
    // const loader = new GLTFLoader();
    // const r = 'textures/logos/';
    // const urls = [ r + '1.png', r + '2.png', r + '3.png', r + '4.png', r + '5.png', r + '6.png' ];
    // const textureCube = new THREE.CubeTextureLoader().load( urls );
    
    // loader.load( 'models/cube.glb', function ( gltf ) {
    //   console.log(textureCube)
    //   let geo         
    //   const data = { color: 0x9999dd,  envMap: textureCube, refractionRatio: 1.0 , };
      
    //   // const _material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
    //   // const _material = new THREE.MeshPhongMaterial(data);
    //   const _material = new THREE.MeshBasicMaterial(data);
    //   gltf.scene.traverse( function( object ) {
    //     if ((object instanceof THREE.Mesh)) geo = object.geometry; 
    //   });
    //   const cubeGeo = new THREE.BoxGeometry(1,1,1)
    //   cube = new THREE.Mesh(cubeGeo, _material)
    //   cube.scale.set(100,100,100)
    //   cube.position.set(600, 0, 0)
    //   scene.add(cube);
    // }, undefined, function ( error ) {
    //   console.error( error );
    // });
    
    let planes: THREE.Object3D<THREE.Event>[] | THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>[] = [];  // just an array we can use to rotate the cubes
    const loadManager = new THREE.LoadingManager();
    const _loader = new THREE.TextureLoader(loadManager);

    // const materials = [
    //   new THREE.MeshBasicMaterial({color:0xdddddd, reflectivity:1, refractionRatio :0.98, map: _loader.load('textures/logos/1.png')}),
    //   new THREE.MeshBasicMaterial({color:0xdddddd, reflectivity:1, refractionRatio :0.98, map: _loader.load('textures/logos/2.png')}),
    //   new THREE.MeshBasicMaterial({color:0xdddddd, reflectivity:1, refractionRatio :0.98, map: _loader.load('textures/logos/3.png')}),
    //   new THREE.MeshBasicMaterial({color:0xdddddd, reflectivity:1, refractionRatio :0.98, map: _loader.load('textures/logos/4.png')}),
    //   new THREE.MeshBasicMaterial({color:0xdddddd, reflectivity:1, refractionRatio :0.98, map: _loader.load('textures/logos/5.png')}),
    //   new THREE.MeshBasicMaterial({color:0xdddddd, reflectivity:1, refractionRatio :0.98, map: _loader.load('textures/logos/6.png')}),
    // ];

    const planeMaterials = [
      new THREE.MeshBasicMaterial({color:0xdddddd, side:THREE.DoubleSide , map: _loader.load('textures/logos/m1.png'), alphaTest:0.2, alphaMap:_loader.load('textures/logos/m1.png'), }),
      new THREE.MeshBasicMaterial({color:0xdddddd, side:THREE.DoubleSide , map: _loader.load('textures/logos/m2.png'), alphaTest:0.05, alphaMap:_loader.load('textures/logos/m2.png'), }),
      new THREE.MeshBasicMaterial({color:0xdddddd, side:THREE.DoubleSide , map: _loader.load('textures/logos/m3.png'), alphaTest:0.2, alphaMap:_loader.load('textures/logos/m3.png'), }),
      new THREE.MeshBasicMaterial({color:0xdddddd, side:THREE.DoubleSide , map: _loader.load('textures/logos/m4.png'), alphaTest:0.2, alphaMap:_loader.load('textures/logos/m4m.png'),}),
      new THREE.MeshBasicMaterial({color:0xdddddd, side:THREE.DoubleSide , map: _loader.load('textures/logos/m5.png'), alphaTest:0.2, alphaMap:_loader.load('textures/logos/m5.png'), }),
      new THREE.MeshBasicMaterial({color:0xdddddd, side:THREE.DoubleSide , map: _loader.load('textures/logos/m6.png'), alphaTest:0.2, alphaMap:_loader.load('textures/logos/m6.png'), }),
      new THREE.MeshBasicMaterial({color:0xdddddd, side:THREE.DoubleSide , map: _loader.load('textures/logos/m7.png'), alphaTest:0.2, alphaMap:_loader.load('textures/logos/m7.png'), }),      
    ]
    
    // const progressBarElem = loadingElem.querySelector('.progressbar');
    const floorMaterial = new THREE.MeshStandardMaterial({color:0x222222, emissive:0x111111, side:THREE.DoubleSide, roughness:0, metalness:1.0, metalnessMap: _loader.load('textures/floor_mask.jpg') })
    loadManager.onLoad = () => {
      // loadingElem.style.display = 'none';
      // const cube = new THREE.Mesh(new THREE.BoxGeometry(400,400,400), materials);
      // scene.add(cube);
      
      var l = 150
      let Plane
      Plane = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000, 1, 1),  floorMaterial )
      Plane.rotateX(Math.PI/2)
      Plane.position.y = -50
      // scene.add(Plane)

      let PlaneGeo = new THREE.PlaneGeometry(600, 600, 1, 1)
      Plane = new THREE.Mesh(PlaneGeo, planeMaterials[6])
      Plane.position.y = 70
      planes.push(Plane)
      PlaneGeo = new THREE.PlaneGeometry(200, 200, 1, 1)
      Plane = new THREE.Mesh(PlaneGeo, planeMaterials[0])
      Plane.position.set(l*Math.cos(Math.PI/3), -10, -l*Math.sin(Math.PI/3))
      planes.push(Plane)
      Plane = new THREE.Mesh(PlaneGeo, planeMaterials[1])
      Plane.position.set(l*Math.cos(2*Math.PI/3), -10, -l*Math.sin(2*Math.PI/3))
      planes.push(Plane)
      Plane = new THREE.Mesh(PlaneGeo, planeMaterials[2])
      Plane.position.set(l*Math.cos(Math.PI), -10, -l*Math.sin(Math.PI))
      planes.push(Plane)
      Plane = new THREE.Mesh(PlaneGeo, planeMaterials[3])
      Plane.position.set(l*Math.cos(4*Math.PI/3), -10, -l*Math.sin(4*Math.PI/3))
      planes.push(Plane)
      Plane = new THREE.Mesh(PlaneGeo, planeMaterials[4])
      Plane.position.set(l*Math.cos(5*Math.PI/3), -10, -l*Math.sin(5*Math.PI/3))
      planes.push(Plane)
      Plane = new THREE.Mesh(PlaneGeo, planeMaterials[5])
      Plane.position.set(l*Math.cos(2*Math.PI), -10, -l*Math.sin(2*Math.PI))
      planes.push(Plane)
      scene.add(planes[0])
      scene.add(planes[1])
      scene.add(planes[2])
      scene.add(planes[3])
      scene.add(planes[4])
      scene.add(planes[5])
      scene.add(planes[6])
    };

    loadManager.onProgress = (urlOfLastItemLoaded, itemsLoaded, itemsTotal) => {
      const progress = itemsLoaded / itemsTotal;
      // progressBarElem.style.transform = `scaleX(${progress})`;
    };

    animate();
    function animate() {
      requestAnimationFrame( animate );
      if(planes.length === 7 ){
        const timer = - 0.00015 * Date.now();      
        for(let i = 1; i<7 ;i++){
          planes[i].position.x = 500 * Math.cos(timer + i * Math.PI/3 );
          planes[i].position.z = 500 * Math.sin(timer + i * Math.PI/3 );
        }
      }

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
    setInterval(() => fadeUp(), 7000);
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
            <section id='main' className='main w-full h-[100vh] relative z-1'  style={{background:'url(images/banner.png)',backgroundSize:'cover'}}>
              <div className='absolute top-0 left-0 w-full h-full'  style={{backgroundImage:'radial-gradient( circle, rgba(40, 40, 80, 0.99) 5%, rgba(0, 0, 00, 1.0)'}}></div>
              <div className='w-full h-[100vh] max-w-[1440px] mx-auto'>
                <div className='w-full h-full  flex items-center justify-center pt-12'>
                  <div className='details grid grid-cols-1 md:grid-cols-2 w-full'>
                    <div className='fade-up-hidden relative overflow-hidden w-full h-[40vh]'>
                      <div className='fade-up-show absolute top-0 left-0 w-full px-8 opacity-0'>
                        <div className='title text-[30px] md:text-[50px] mb-2 md:mb-6'>
                          Humble Past
                        </div>
                        <div className='text-[14px] md:text-[30px]'>
                          Established Feb 22, 2010 with very limited capital, 77 Media started as a 1 man multimedia production house. 
                          Today through the grace of God, 77 Media has become a holding company with 7 subsidiaries in the fields of communication, entertainment, and technology.
                        </div>
                      </div>
                      <div className='fade-up-show absolute top-0 left-0 w-full px-8 opacity-0'>
                        <div className='title text-[30px] md:text-[50px] mb-2 md:mb-6'>
                          Exciting Future
                        </div>
                        <div className='text-[14px] md:text-[30px]'>
                          Our vision is clear, and our ambitions are great. 
                          We are always looking for the next revolutionizing investment and partnership opportunity. 
                          Whether it is through organic growth of our current businesses or through a drastic pivot, we are eager and ready for to make a positive difference in our world.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </SmoothScroll>        
      </main>
      <Header/>
      <div id='webGLRender' className='fixed w-full h-full top-0 left-0 pointer-events-auto z-0'/>
      <div className='hidden md:block'>
        <Cursor/>
      </div>
    </div>
  )
}

export default Home