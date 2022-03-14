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
import Loading2 from './components/Loading2'
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
    camera.position.z = 10
    
    var viewSize = { distance : camera.position.z, vFov : (camera.fov * Math.PI) / 180, height : 2 * Math.tan((camera.fov * Math.PI) / 180 / 2) * camera.position.z, width : 2 * Math.tan((camera.fov * Math.PI) / 180 / 2) * camera.position.z * viewport.aspectRatio, }
    
    // const controls = new OrbitControls( camera, renderer.domElement );
    // controls.enableRotate = true;
    // controls.update();

    renderer.setClearColor('#111111', 0)
    renderer.setSize(viewport.width, viewport.height)
    renderer.setPixelRatio(viewport.aspectRatio)

    scene.add(new THREE.AmbientLight(0xdddddd, 1))

    const lightPoint = new THREE.PointLight(0xffffff, 1, 200)    
    scene.add(lightPoint)

    const loadManager = new THREE.LoadingManager();
    const loaderTexture = new THREE.TextureLoader(loadManager)
    const loaderGLTF = new GLTFLoader(loadManager);
    
    const bgTexture = loaderTexture.load('textures/bg1.jpg')

    var myCube= new THREE.Object3D
    loaderGLTF.load( 'models/tesseract_cube/scene.gltf', function ( gltf ) {
      myCube = gltf.scene.children[0]
      myCube.scale.set(0.005, 0.005, 0.005)
      myCube.position.set(0,-4, 0)
      scene.add(myCube);
    }, undefined, function ( error ) {
      console.error( error );
    });
    
    loadManager.onProgress = (urlOfLastItemLoaded, itemsLoaded, itemsTotal) => {
      scene.background = bgTexture
      const progress = itemsLoaded / itemsTotal;
      console.log(progress, urlOfLastItemLoaded)
      if (progress == 1.0) initContent()
    };

    var bgMaterial = new THREE.MeshLambertMaterial({map: loaderTexture.load('textures/background.png'), alphaTest:0.01, alphaMap:loaderTexture.load('textures/bkmask.png')});
    const bg = new THREE.Mesh(new THREE.PlaneBufferGeometry(1000, 150, 10, 1), bgMaterial)

    var logoMaterial1 = new THREE.MeshLambertMaterial({map: loaderTexture.load('textures/logos/Acquaint.png'), alphaTest:0.01, alphaMap:loaderTexture.load('textures/logos/AcquaintMask.png')});
    var logoMaterial2 = new THREE.MeshLambertMaterial({map: loaderTexture.load('textures/logos/Antin.png'), alphaTest:0.01, alphaMap:loaderTexture.load('textures/logos/AntinMask.png')});
    var logoMaterial3 = new THREE.MeshLambertMaterial({map: loaderTexture.load('textures/logos/Brackets.png'), alphaTest:0.01, alphaMap:loaderTexture.load('textures/logos/BracketsMask.png')});
    var logoMaterial4 = new THREE.MeshLambertMaterial({map: loaderTexture.load('textures/logos/77WideLogo.png'), alphaTest:0.01, alphaMap:loaderTexture.load('textures/logos/77WideLogo.png')});
    var logoMaterial5 = new THREE.MeshLambertMaterial({map: loaderTexture.load('textures/logos/Gabriel.png'), alphaTest:0.01, alphaMap:loaderTexture.load('textures/logos/GabrielMask.png')});
    var logoMaterial6 = new THREE.MeshLambertMaterial({map: loaderTexture.load('textures/logos/Soul.png'), alphaTest:0.01, alphaMap:loaderTexture.load('textures/logos/SoulMask.png')});
    var logoMaterial7 = new THREE.MeshLambertMaterial({map: loaderTexture.load('textures/logos/VFXStudio.png'), alphaTest:0.01, alphaMap:loaderTexture.load('textures/logos/VFXStudioMask.png')});
    const logo1 = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 1.2, 1, 1), logoMaterial1)
    logo1.position.set(0, 1, 0)
    // scene.add(logo1)

    const surface = new THREE.Mesh(new THREE.PlaneGeometry(100, 100, 10, 10), new THREE.MeshBasicMaterial({color:0x222233, side:THREE.DoubleSide, }))
    scene.add(surface)
    surface.rotateX(Math.PI/2)
    surface.position.set(0,-1,0)

    var order= 0, orderBefore = 0
    const _3D_Y_Offset = 5, _3d_X_Offset = 4
    var touchvalue:number
    var flag = true
    var details = new Array
    var temp
    temp = document.querySelector('.main-part > div > div:nth-child(1)'); details.push(temp); 

    temp = document.querySelector('.main-part > div > div.logo-title:nth-child(2)'); details.push(temp); 
    
    temp = document.querySelector('.main-part > div > div:nth-child(3) > div > div.details'); details.push(temp)
    temp = document.querySelector('.main-part > div > div:nth-child(4) > div > div.details'); details.push(temp)
    temp = document.querySelector('.main-part > div > div:nth-child(5) > div > div.details'); details.push(temp)
    
    temp = document.querySelector('.main-part > div > div:nth-child(1)'); details.push(temp); 
    temp = document.querySelector('.main-part > div > div:nth-child(1)'); details.push(temp); 
    console.log(details)
    animate();

    function animate() {

      requestAnimationFrame( animate )
      renderer.render( scene, camera )
    }

    function initContent(){
      setLoading(false)
      flag = false;
      const temp = myCube.position
      lightPoint.position.set(temp.x-10, temp.y+20, temp.z)
      myCube.position.y=-5
      TweenMax.to(myCube.position, 3, {y:-0.5, ease:"elastic.out(1, 0.3)", delay:0.1})
      setTimeout(() => { order++; updateContent()}, 3000)
    }

    function updateContent(){
      console.log(order)

      const alphaX = myCube.rotation.x
      if (order === 0)
        TweenMax.to(myCube.position, 1, { x: 0 ,  ease: 'Power0.easeInOut', delay:0.5})
      else      
        TweenMax.to(myCube.position, 1, { x: order<2?0:(order % 2 ==0)?2:-2 ,  ease: 'Power0.easeInOut', delay:0.5})

      if(order>orderBefore){
        TweenMax.to(myCube.rotation, 1, { x: alphaX - Math.PI/2 ,  ease: 'Power0.easeInOut', delay:0.5})
      }
      else{
        TweenMax.to(myCube.rotation, 1, { x: alphaX + Math.PI/2 ,  ease: 'Power0.easeInOut', delay:0.5})
      }

      
      TweenMax.to(details[order], 0.7, {opacity:1, scale:1.3, ease:'Power0.easeInOut', delay:0.7})
      TweenMax.to(details[orderBefore], 0.7, {opacity:0, scale:order>orderBefore?1.6:1, ease:'Power0.easeInOut'})
      
      orderBefore = order
      if (order>1)
        setTimeout(() => {flag = true}, 1000)
      else
        setTimeout(() => {flag = false; order++; updateContent()}, 4000)
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
      if (flag){        
        flag=false
        if(event.deltaY>0){
          order++         
        }
        else{
          order--      
        }
        
        if (order<2) {
          order = 2
          setTimeout(() => {flag = true}, 1000)
          return
        }

        if (order>5) {
          order = 5
          setTimeout(() => {flag = true}, 1000)
          return
        }
        updateContent()
      }
    })
    window.addEventListener("touchstart", function(touchEvent) {      
      touchvalue = touchEvent.changedTouches[0].pageY      
    }, false);
    window.addEventListener("touchend", function(touchEvent) {
      const alphaX = myCube.rotation.x
      if (touchvalue < touchEvent.changedTouches[0].pageY){        
        TweenMax.to(myCube.rotation, 0.5, { x: alphaX + Math.PI/2 ,  ease: 'Power0.easeInOut'})
        order++
      } else{
        TweenMax.to(myCube.rotation, 0.5, { x: alphaX - Math.PI/2 ,  ease: 'Power0.easeInOut'})
        order--
      }
      updateContent()
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
        <div className='main-part absolute w-full h-full z-10'>          
          <div className='w-full h-full flex justify-center items-center relative overflow-hidden text-white'>
            <div></div>
            <div className='logo-title flex items-center uppercase'>
              <div className='text-[90px]'>77</div>
              <div className='ml-2'>
                <div className='text-right text-[55px] leading-[50px]'>Media</div>
                <div className='text-right text-[25px] leading-[25px]'>Holding</div>
              </div>
            </div>
            
            <div className='absolute w-full h-full '>
              <div className='flex w-full h-full items-center justify-center'>
                <div className='details relative w-[70vw] h-[60vh] flex justify-start items-end'>
                  <div className='w-full'>
                    <div className='title text-[30px] font-semibold uppercase pb-10'>Making a Positive Difference with Integrity</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className='absolute w-full h-full '>
              <div className='flex w-full h-full items-center justify-center'>
                <div className='details relative w-[70vw] h-[60vh] flex justify-end items-end'>
                  <div className='w-[40%]'>
                    <div className='title text-[30px] font-semibold mb-4 uppercase'>Humble Past</div>
                    <div className='description text-[25px] leading-[25px] text-justify'>
                      Established Feb 22, 2010 with very limited capital, 77 Media started as a 1 man multimedia production house.<br/><br/>
                      Today through the grace of God, 77 Media has become a holding company with 7 subsidiaries in the fields of communication, entertainment, and technology.
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className='absolute w-full h-full '>
              <div className='flex w-full h-full items-center justify-center'>
                <div className='details relative w-[70vw] h-[60vh] flex justify-start items-end'>
                  <div className='w-[40%]'>
                    <div className='title text-[30px] font-semibold mb-4 uppercase'>Exciting Future</div>
                    <div className='description text-[25px] leading-[25px] text-justify'>
                      Our vision is clear, and our ambitions are great. We are always looking for the next revolutionizing investment opportunity.<br/><br/>
                      Whether it is through organic growth of our current businesses or through a drastic pivot, we are eager and ready for any challenge.
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </main>
      <div id='webglContainer' className='fixed top-0 left-0 w-full h-full'></div>
      <div className='absolute w-full h-full top-0 left-0 z-10 bg-black' style={{display:loading?'block':'none'}} >
        <Loading2/>
      </div>
      <div className='hidden md:block'>
        <Cursor/>
      </div>
    </div>
  )
}

export default Home