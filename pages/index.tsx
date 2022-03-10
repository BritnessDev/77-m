import type { NextPage } from 'next'
import React, {useEffect, useState} from 'react'
import Head from 'next/head'
import {TweenLite, gsap} from 'gsap'
import * as THREE from "three"

import styles from '../styles/Home.module.scss'
import Loading1 from './components/Loading1'
import SmoothScroll from './components/SmoothScroll'
import Cursor from './components/Cursor'
// import Header from './components/Header'

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
  const scene = new THREE.Scene()
  setTimeout(() => setLoading(false), 3000);
  const webGLRender = () => {
    container = document.getElementById('webGLRender')
    const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true });
    container.appendChild( renderer.domElement )
    let group = new Array();

    const viewport = {
      width : container.clientWidth,
      height : container.clientHeight,
      aspectRatio : container.clientWidth / container.clientHeight
    }
    
    camera = new THREE.PerspectiveCamera( 40, viewport.aspectRatio, 0.1, 100 )
    camera.position.set(0, 0, 3)
    
    const viewSize = {
      distance : camera.position.z,
      vFov : (camera.fov * Math.PI) / 180,
      height : 2 * Math.tan((camera.fov * Math.PI) / 180 / 2) * camera.position.z,
      width : 2 * Math.tan((camera.fov * Math.PI) / 180 / 2) * camera.position.z * viewport.aspectRatio,
    }
    const ambientLight = new THREE.AmbientLight( 0xaaaaff);
    scene.add( ambientLight );

    const light1 = new THREE.PointLight( 0xaaaaff, 1, 0 );
    light1.position.set( 0, 0, 10 );
    scene.add( light1 );

    setViewPort(viewport)
    setViewSize(viewSize)
    renderer.setClearColor('#000000', 0)
    renderer.setSize(viewport.width, viewport.height)
    renderer.setPixelRatio(window.devicePixelRatio)

    const Geo = new THREE.SphereGeometry( 0.01, 32, 16 );
    const GeoMaterial = new THREE.MeshStandardMaterial( { color: 0xddddff, metalness:0.7, roughness:0, emissive:0xaaaaee, opacity:0, transparent:true } );
    const Mesh = new THREE.Mesh(Geo, GeoMaterial)
    scene.add(Mesh)

    animate();
    function animate() {
      requestAnimationFrame( animate );
      renderer.render( scene, camera );    
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
    window.addEventListener( 'resize', onWindowResize );
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
    const newPos = new THREE.Vector3(x, y,0)
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
        <title>My Web</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/logo.png" />
      </Head>

      <main className={styles.main}>        
        <div className='Loading-wrapper fixed top-0 left-0 w-full h-[100vh]' style={{background:'radial-gradient(circle,  #555555 1%, #111111)', zIndex:'10000', display:loading?'block':'none'}}>
          <Loading1/>
        </div>
        <SmoothScroll>
          <div className='content-wrapper mx-auto' style={{ color:foreColor}}>            
            <section id='part-here' className='part-here w-full h-[100vh]' style={{background:'url(assets/img/back4.jpg)',backgroundSize:'cover'}}>
              <div className='w-full h-[100vh]' style={{backgroundImage:'linear-gradient(0deg, rgba(0, 0, 0, 0.95) 10.0%, rgba(10, 10, 40, 0.65) 50.00%, rgba(20, 30, 90, 0.95) 90.0%)'}}>
                <div className='w-full h-full  flex items-center justify-center pt-12'>
                  {/* <ColorAnimationText show={followerCursorShow} hidden={followerCursorHidden} avatarshow={avatarshow} avatarhide={avatarhide}/> */}
                </div>
              </div>
            </section>
          </div>
        </SmoothScroll>        
      </main>
      {/* <Header/> */}
      <div className='hidden md:block'>
        <Cursor/>
      </div>
      <div id='contact_bg' className='w-full h-[100vh] fixed top-0 left-0 opacity-0 pointer-events-none' style={{background:'url(assets/img/contact_bg.png)',backgroundSize:'cover', zIndex:0}}/>
      <div id='webGLRender' className='fixed w-full h-full border border-green border-dotted top-0 left-0 pointer-events-none'></div>
    </div>
  )
}

export default Home