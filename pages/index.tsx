import type { NextPage } from 'next'
import React, {useEffect, useState} from 'react'
import Head from 'next/head'
import {TweenMax, gsap} from 'gsap'
import * as THREE from "three"
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import { BoxGeometry, Light, PlaneGeometry, TextureLoader,  } from 'three'
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

import styles from '../styles/Home.module.scss'
import Loading1 from './components/Loading1'
import Loading2 from './components/Loading2'
import SmoothScroll from './components/SmoothScroll'
import Cursor from './components/Cursor'
import Header from './components/Header'
import ColorAnimationText from './components/ColorAnimationText'
import Slider from "react-slick"
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

const Home: NextPage = () => {
  const [loading, setLoading] = useState(true)
  const [viewport, setViewPort] = useState({width:0, height:0, aspectRatio:1})
  const [viewSize, setViewSize] = useState({distance:3, vFov:0, height:1, width:1})
  const [cube, setCube] = useState(new THREE.Object3D)
    
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
  let composer: EffectComposer
  let fadeupOrder = -1
  const scene = new THREE.Scene()
  setTimeout(() => {setLoading(false);}, 2000);
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
    camera = new THREE.PerspectiveCamera( 45, viewport.aspectRatio, 0.1, 100000 )
    const viewSize = { distance : camera.position.z, vFov : (camera.fov * Math.PI) / 180, height : 2 * Math.tan((camera.fov * Math.PI) / 180 / 2) * camera.position.z, width : 2 * Math.tan((camera.fov * Math.PI) / 180 / 2) * camera.position.z * viewport.aspectRatio, }
    camera.position.set(-200, 300, 800)
    const controls = new OrbitControls( camera, renderer.domElement );
    controls.enableRotate = true;
    controls.update();

    setViewPort(viewport)
    setViewSize(viewSize)
    renderer.setClearColor('#111111', 0)
    renderer.setSize(viewport.width, viewport.height)
    renderer.setPixelRatio(viewport.aspectRatio)

    const light = new THREE.AmbientLight( 0x404040 ); // soft white light
    scene.add( light );
    const light1 = new THREE.PointLight(0x808080, 1, 2000)
    light1.position.set(-1550,500,1000)
    scene.add(light1)

    const loader = new GLTFLoader();
    
    const loadManager = new THREE.LoadingManager();
    const _loader = new THREE.TextureLoader(loadManager);

    // const materials = [
    //   new THREE.MeshBasicMaterial({color:0xdddddd, side:THREE.DoubleSide, reflectivity:1, refractionRatio :0.98, map: _loader.load('textures/logos/1.png')}),
    //   new THREE.MeshBasicMaterial({color:0xdddddd, side:THREE.DoubleSide, reflectivity:1, refractionRatio :0.98, map: _loader.load('textures/logos/2.png')}),
    //   new THREE.MeshBasicMaterial({color:0xdddddd, side:THREE.DoubleSide, reflectivity:1, refractionRatio :0.98, map: _loader.load('textures/logos/3.png')}),
    //   new THREE.MeshBasicMaterial({color:0xdddddd, side:THREE.DoubleSide, reflectivity:1, refractionRatio :0.98, map: _loader.load('textures/logos/4.png')}),
    //   new THREE.MeshBasicMaterial({color:0xdddddd, side:THREE.DoubleSide, reflectivity:1, refractionRatio :0.98, map: _loader.load('textures/logos/5.png')}),
    //   new THREE.MeshBasicMaterial({color:0xdddddd, side:THREE.DoubleSide, reflectivity:1, refractionRatio :0.98, map: _loader.load('textures/logos/6.png')}),
    // ];    

    const materials = [
      new THREE.MeshBasicMaterial({color:0xdddddd, side:THREE.DoubleSide , map: _loader.load('textures/logos/m1.png'), alphaTest:0.2, alphaMap:_loader.load('textures/logos/m1.png'), }),
      new THREE.MeshBasicMaterial({color:0xdddddd, side:THREE.DoubleSide , map: _loader.load('textures/logos/m2.png'), alphaTest:0.05, alphaMap:_loader.load('textures/logos/m2.png'), }),
      new THREE.MeshBasicMaterial({color:0xdddddd, side:THREE.DoubleSide , map: _loader.load('textures/logos/m3.png'), alphaTest:0.2, alphaMap:_loader.load('textures/logos/m3.png'), }),
      new THREE.MeshBasicMaterial({color:0xdddddd, side:THREE.DoubleSide , map: _loader.load('textures/logos/m4.png'), alphaTest:0.2, alphaMap:_loader.load('textures/logos/m4m.png'),}),
      new THREE.MeshBasicMaterial({color:0xdddddd, side:THREE.DoubleSide , map: _loader.load('textures/logos/m5.png'), alphaTest:0.2, alphaMap:_loader.load('textures/logos/m5.png'), }),
      new THREE.MeshBasicMaterial({color:0xdddddd, side:THREE.DoubleSide , map: _loader.load('textures/logos/m6.png'), alphaTest:0.2, alphaMap:_loader.load('textures/logos/m6.png'), }),
      new THREE.MeshBasicMaterial({color:0xdddddd, side:THREE.DoubleSide , map: _loader.load('textures/logos/m7.png'), alphaTest:0.2, alphaMap:_loader.load('textures/logos/m7.png'), }),      
    ]
    const material = new THREE.MeshPhysicalMaterial({color:0xF0FFFF
    });    
    material.metalness= 0.0
    material.roughness= 1.0
    material.transmission= 0.1
    material.ior= 2.0
    material.reflectivity=0.2
    material.envMapIntensity= 0
    material.clearcoat= 1
    material.clearcoatRoughness= 0.25
    material.normalMap= _loader.load('textures/normal.jpg')
    material.normalScale= new THREE.Vector2(5, 5)
    material.thickness = 10
    
    loadManager.onLoad = () => {
      
      let Plane = new THREE.Mesh(new PlaneGeometry(400,400,1,1), materials[0])
      Plane.position.z = 174.5
      cube.add(Plane)
      
      Plane = new THREE.Mesh(new PlaneGeometry(400,400,1,1), materials[1])
      Plane.rotateY(Math.PI)
      Plane.position.z = -175
      cube.add(Plane)
      
      Plane = new THREE.Mesh(new PlaneGeometry(300,300,1,1), materials[2])
      Plane.rotateX(Math.PI/2)
      Plane.position.y = -175
      cube.add(Plane)
      
      Plane = new THREE.Mesh(new PlaneGeometry(300,300,1,1), materials[3])
      Plane.rotateX(Math.PI/2)
      Plane.rotateY(Math.PI)
      Plane.position.y = 175
      cube.add(Plane)
      
      Plane = new THREE.Mesh(new PlaneGeometry(400,400,1,1), materials[4])
      Plane.rotateY(Math.PI/2)
      // Plane.rotateY(Math.PI)
      Plane.position.x = 175
      cube.add(Plane)
      
      Plane = new THREE.Mesh(new PlaneGeometry(300,300,1,1), materials[5])
      Plane.rotateY(Math.PI/2)
      Plane.rotateY(Math.PI)
      Plane.position.x = -175
      cube.add(Plane)
      loader.load( 'models/cube.glb', function ( gltf ) {
        let geo
        gltf.scene.traverse( function( object ) {
          if ((object instanceof THREE.Mesh)) geo = object.geometry; 
        });
        const _cube = new THREE.Mesh(geo, material)
        _cube.scale.set(100,100,100)
        _cube.position.set(0, 0, 0)
        cube.add(_cube)
        scene.add(cube);
      }, undefined, function ( error ) {
        console.error( error );
      });
    };

    loadManager.onProgress = (urlOfLastItemLoaded, itemsLoaded, itemsTotal) => {
      const progress = itemsLoaded / itemsTotal;
      // progressBarElem.style.transform = `scaleX(${progress})`;
    };

    animate();
    function animate() {
      requestAnimationFrame( animate )
      if(cube ){
        const timer = 0.0002 * Date.now();        
        cube.rotation.y=timer
      }
      // composer.render()
      renderer.render( scene, camera )
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })

    window.addEventListener( 'resize', onWindowResize )
    function onWindowResize() {      
      container = document.getElementById('webGLRender')
      const viewport = {
        width : container.clientWidth, height : container.clientHeight,
        aspectRatio : container.clientWidth / container.clientHeight
      }
      
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      
      const viewSize = {
        distance : camera.position.z,
        vFov : (camera.fov * Math.PI) / 180,
        height : 2 * Math.tan((camera.fov * Math.PI) / 180 / 2) * camera.position.z,
        width : 2 * Math.tan((camera.fov * Math.PI) / 180 / 2) * camera.position.z * viewport.aspectRatio,
      }
      
      setViewPort(viewport)
      setViewSize(viewSize)
      renderer.setSize( container.clientWidth, container.clientHeight );
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

  const rotateCube = (value:number) => {
    // console.log(cube)
    if(cube){
      if(value===1){
        cube.rotation.x = 90
        // TweenMax.to(cube, 1, {rotateX:90, ease:'Power4.easeInOut'});
      }
      if(value===2){
        cube.rotation.x = 180        
      }
      if(value===3){        
        cube.rotation.x = 270
      }
      if(value===4){        
        cube.rotation.x = 360
      }
      if(value===5){        
        cube.rotation.z = 90
      }
      if(value===6){        
        cube.rotation.z = -90
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
        <div className='content-wrapper w-full h-full text-white'>
          <section id='main' className='main w-full h-full relative z-1 '  style={{background:'url(images/sea1.jpg)',backgroundSize:'cover'}}>
            <Header/>
            <div className='w-full h-full md:max-w-[1440px] mx-auto pointer-events-none pb-60'>                
              <div className='w-full h-full pt-12'>
                <div className='w-full flex flex-wrap justify-center items-center mt-2 mb-16 md:mt-20 md:mb-28'>
                  <ColorAnimationText/>
                </div>
      
                <div className='details grid grid-cols-1 md:grid-cols-2 w-full p-4 gap-8 text-[#ddd]'>
                  <div className='fade-up-hidden relative overflow-hidden rounded-xl p-4' 
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
                  <div className='fade-up-hidden relative overflow-hidden rounded-xl p-4' 
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

                <div className='logos w-full md:my-16' style={{backgroundImage: 'radial-gradient(#68cce9 30%, transparent 60%)'}}>
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
          <section id='companies' className='main w-full relative z-2 -mt-60 pb-40'
            style={{backgroundImage: 'linear-gradient(rgb(92 122 249 / 0%), #114 10%)'}}
          >
            <div className='w-full h-full max-w-[1440px] mx-auto'>
              <div className='w-full h-full pt-12 grid grid-cols-1 md:grid-cols-2 gap-8'>
                <div className='hidden md:block flex-none min-w-[380px]'>
                  <div className='flex items-end w-full h-full'>
                    <div className='' onMouseEnter={()=>followerCursorHidden()} onMouseLeave={()=>followerCursorShow()}>
                      <div className='company-item' onClick={()=>rotateCube(1)}>VFX Studio</div>
                      <div className='company-item' onClick={()=>rotateCube(2)}>SOUL Films</div>
                      <div className='company-item' onClick={()=>rotateCube(3)}>Antin TV</div>
                      <div className='company-item' onClick={()=>rotateCube(4)}>Acquaint Comm</div>
                      <div className='company-item' onClick={()=>rotateCube(5)}>Gabriel Branding</div>
                      <div className='company-item' onClick={()=>rotateCube(6)}>Brackets Technology</div>
                    </div>
                  </div>
                </div>
                <div className='w-full grow'>
                  <div className='md:hidden'>title</div>
                  <div className='h-full relative'>
                    <div id='webGLRender' className='h-[650px]'/>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      
      <div className='hidden md:block'>
        <Cursor/>
      </div>
    </div>
  )
}

export default Home