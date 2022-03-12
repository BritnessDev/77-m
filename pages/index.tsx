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
import ColorAnimationText from './components/ColorAnimationText'
import Slider from "react-slick"
const Home: NextPage = () => {
  const [loading, setLoading] = useState(true)
  const [viewport, setViewPort] = useState({width:0, height:0, aspectRatio:1})
  const [viewSize, setViewSize] = useState({distance:3, vFov:0, height:1, width:1})
  const [cursorPos, setPosition] = useState({x:0, y:0})
  const [uniforms, setUniforms] = useState({uTexture: {value: new THREE.Texture},uOffset: {value: new THREE.Vector2(0.0, 0.0)},uAlpha: {value: 1}})    
    
  const settings = {
    dots: false,
    arrows:false,
    infinite: true,
    speed: 2500,
    autoplay: true,
    autoplaySpeed: 2500,
    slidesToShow: 5,
    slidesToScroll: 1,
    pauseOnHover: false,
    centerMode: true,
    cssEase: "linear",
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 5,
          slidesToScroll: 1,
          infinite: true,
          dots: false
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          initialSlide: 1
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };
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
    const loader = new GLTFLoader();
    const r = 'textures/logos/';
    const urls = [ r + '1.png', r + '2.png', r + '3.png', r + '4.png', r + '5.png', r + '6.png' ];
    const textureCube = new THREE.CubeTextureLoader().load( urls );
    
    
    let planes: THREE.Object3D<THREE.Event>[] | THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>[] = [];  // just an array we can use to rotate the cubes
    const loadManager = new THREE.LoadingManager();
    const _loader = new THREE.TextureLoader(loadManager);

    const materials = [
      new THREE.MeshBasicMaterial({color:0xdddddd, reflectivity:1, refractionRatio :0.98, map: _loader.load('textures/logos/1.png')}),
      new THREE.MeshBasicMaterial({color:0xdddddd, reflectivity:1, refractionRatio :0.98, map: _loader.load('textures/logos/2.png')}),
      new THREE.MeshBasicMaterial({color:0xdddddd, reflectivity:1, refractionRatio :0.98, map: _loader.load('textures/logos/3.png')}),
      new THREE.MeshBasicMaterial({color:0xdddddd, reflectivity:1, refractionRatio :0.98, map: _loader.load('textures/logos/4.png')}),
      new THREE.MeshBasicMaterial({color:0xdddddd, reflectivity:1, refractionRatio :0.98, map: _loader.load('textures/logos/5.png')}),
      new THREE.MeshBasicMaterial({color:0xdddddd, reflectivity:1, refractionRatio :0.98, map: _loader.load('textures/logos/6.png')}),
    ];
    
    
    loadManager.onLoad = () => {      
      loader.load( 'models/cube.glb', function ( gltf ) {
        console.log(materials)
        let geo
        gltf.scene.traverse( function( object ) {
          if ((object instanceof THREE.Mesh)) geo = object.geometry; 
        });
        const cubeGeo = new THREE.BoxGeometry(1,1,1)
        cube = new THREE.Mesh(cubeGeo, materials)
        cube.scale.set(100,100,100)
        cube.position.set(0, 0, 0)
        scene.add(cube);
      }, undefined, function ( error ) {
        console.error( error );
      });
      // const cube = new THREE.Mesh(new THREE.BoxGeometry(400,400,400), materials);
      // scene.add(cube);
      
    };

    loadManager.onProgress = (urlOfLastItemLoaded, itemsLoaded, itemsTotal) => {
      const progress = itemsLoaded / itemsTotal;
      // progressBarElem.style.transform = `scaleX(${progress})`;
    };

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
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Mono:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet"/>
      </Head>

      <main className={styles.main}>        
        <div className='Loading-wrapper fixed top-0 left-0 w-full h-[100vh]' style={{background:'#000', zIndex:'10000', display:loading?'block':'none'}}>
          <Loading2/>
        </div>
        
        {/* <SmoothScroll> */}
          
          <div className='content-wrapper w-full h-full text-white'>
            <section id='main' className='main w-full h-full relative z-1'  style={{background:'url(images/sea1.jpg)',backgroundSize:'cover'}}>              
              <div className='absolute top-0 left-0 w-full h-full'  
                // style={{backgroundImage:'radial-gradient(rgba(40, 40, 80, 0) 5%, rgba(0, 0, 0, 1.0) 80%'}}
                ></div>
              <Header/>
              <div className='w-full h-full md:max-w-[1440px] mx-auto pointer-events-none pb-60'>                
                <div className='w-full h-full pt-12'>
                  <div className='w-full flex flex-wrap justify-center items-center mt-2 mb-16 md:mt-20 md:mb-28'>
                    <ColorAnimationText/>
                  </div>
        
                  <div className='details grid grid-cols-1 md:grid-cols-2 w-full p-4 gap-8 text-[#ddd]'>
                    <div className='fade-up-hidden relative overflow-hidden w-full rounded-xl p-4' 
                      style={{backgroundImage: 'linear-gradient(359deg, #2c71ffcf, #c331dfa3)'}}>
                      <div className='fade-up-show '>
                        <div className='title text-[24px] md:text-[32px] mb-2 md:mb-3'>
                          Humble Past
                        </div>
                        <div className='text-[12px] md:text-[18px] text-justify'>
                          Established Feb 22, 2010 with very limited capital, 77 Media started as a 1 man multimedia production house. 
                          Today through the grace of God, 77 Media has become a holding company with 7 subsidiaries in the fields of communication, entertainment, and technology.
                        </div>
                      </div>
                    </div>
                    <div className='fade-up-hidden relative overflow-hidden w-full rounded-xl p-4' 
                      style={{backgroundImage: 'linear-gradient(359deg, #2c71ffcf, #c331dfa3)'}}>
                      <div className='fade-up-show '>
                        <div className='title text-[24px] md:text-[32px] mb-2 md:mb-3'>
                          Exciting Future
                        </div>
                        <div className='text-[12px] md:text-[18px] text-justify'>
                          Our vision is clear, and our ambitions are great. 
                          We are always looking for the next revolutionizing investment and partnership opportunity. 
                          Whether it is through organic growth of our current businesses or through a drastic pivot, we are eager and ready for to make a positive difference in our world.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='logos w-full md:my-16' style={{backgroundImage: 'radial-gradient(#93a4ec, transparent 50%)'}}>
                    <Slider {...settings}>
                      <div className='mx-2'>
                        <img src='images/logos/Antin.png'/>
                      </div>
                      <div className='mx-2'>
                        <img src='images/logos/Social.png'/>
                      </div>
                      <div className='mx-2'>
                        <img src='images/logos/Soul.png'/>
                      </div>
                      <div className='mx-2'>
                        <img src='images/logos/Brackets.png'/>
                      </div>
                      <div className='mx-2'>
                        <img src='images/logos/VFXStudio.png'/>
                      </div>
                      <div className='mx-2'>
                        <img src='images/logos/Kan.png'/>
                      </div>
                    </Slider>
                  </div>
                </div>
              </div>
            </section>
            <section id='companies' className='main w-full h-full relative z-1 -mt-60'
              style={{backgroundImage: 'linear-gradient(rgb(92 122 249 / 0%), #020930 20%)'}}
            >
              <div className='w-full h-full max-w-[1440px] mx-auto pointer-events-none'>                
                <div className='w-full h-full pt-12 grid-cols-1 md:grid-cols-2 gap-8'>
                  <div className='h-96 py-60'>

                  </div>
                </div>
              </div>
            </section>
          </div>
        {/* </SmoothScroll> */}
      </main>
      <div id='webGLRender' className='fixed w-full h-full top-0 left-0 pointer-events-none hidden z-0'/>
      <div className='hidden md:block'>
        <Cursor/>
      </div>
    </div>
  )
}

export default Home