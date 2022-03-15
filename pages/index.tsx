import type { NextPage } from 'next'
import React, {  useEffect, useState } from 'react'
import Router from 'next/router'
import { isMobile } from 'react-device-detect'
import Head from 'next/head'
import { TweenMax, gsap } from 'gsap'
import * as THREE from "three"
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

import styles from '../styles/Home.module.scss'
// import Cursor from './components/Cursor'
import Loading2 from './components/Loading2'
import Header from './components/Header'
import {  Color,  FrontSide,  Matrix4,  Mesh,  PerspectiveCamera,  Plane,  ShaderMaterial,  UniformsLib,  UniformsUtils,  Vector3, Vector4, WebGLRenderTarget} from 'three';

// import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
// import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
// import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

class Water extends Mesh {

  constructor(geometry: any, options: any = {}) {

    super(geometry);

    const scope = this;

    const textureWidth = options.textureWidth !== undefined ? options.textureWidth : 512;
    const textureHeight = options.textureHeight !== undefined ? options.textureHeight : 512;

    const clipBias = options.clipBias !== undefined ? options.clipBias : 0.0;
    const alpha = options.alpha !== undefined ? options.alpha : 1.0;
    const time = options.time !== undefined ? options.time : 0.0;
    const normalSampler = options.waterNormals !== undefined ? options.waterNormals : null;
    const sunDirection = options.sunDirection !== undefined ? options.sunDirection : new Vector3(0.70707, 0.70707, 0.0);
    const sunColor = new Color(options.sunColor !== undefined ? options.sunColor : 0xffffff);
    const waterColor = new Color(options.waterColor !== undefined ? options.waterColor : 0x7F7F7F);
    const eye = options.eye !== undefined ? options.eye : new Vector3(0, 0, 0);
    const distortionScale = options.distortionScale !== undefined ? options.distortionScale : 20.0;
    const side = options.side !== undefined ? options.side : FrontSide;
    const fog = options.fog !== undefined ? options.fog : false;

    //

    const mirrorPlane = new Plane();
    const normal = new Vector3();
    const mirrorWorldPosition = new Vector3();
    const cameraWorldPosition = new Vector3();
    const rotationMatrix = new Matrix4();
    const lookAtPosition = new Vector3(0, 0, - 1);
    const clipPlane = new Vector4();

    const view = new Vector3();
    const target = new Vector3();
    const q = new Vector4();

    const textureMatrix = new Matrix4();

    const mirrorCamera = new PerspectiveCamera();

    const renderTarget = new WebGLRenderTarget(textureWidth, textureHeight);

    const mirrorShader = {

      uniforms: UniformsUtils.merge([
        UniformsLib['fog'],
        UniformsLib['lights'],
        {
          'normalSampler': { value: null },
          'mirrorSampler': { value: null },
          'alpha': { value: 1.0 },
          'time': { value: 0.0 },
          'size': { value: 20.0 },
          'distortionScale': { value: 20.0 },
          'textureMatrix': { value: new Matrix4() },
          'sunColor': { value: new Color(0x7F7F7F) },
          'sunDirection': { value: new Vector3(0.70707, 0.70707, 0) },
          'eye': { value: new Vector3() },
          'waterColor': { value: new Color(0x555555) }
        }
      ]),

      vertexShader: /* glsl */`
				uniform mat4 textureMatrix;
				uniform float time;

				varying vec4 mirrorCoord;
				varying vec4 worldPosition;

				#include <common>
				#include <fog_pars_vertex>
				#include <shadowmap_pars_vertex>
				#include <logdepthbuf_pars_vertex>

				void main() {
					mirrorCoord = modelMatrix * vec4( position, 1.0 );
					worldPosition = mirrorCoord.xyzw;
					mirrorCoord = textureMatrix * mirrorCoord;
					vec4 mvPosition =  modelViewMatrix * vec4( position, 1.0 );
					gl_Position = projectionMatrix * mvPosition;

				#include <beginnormal_vertex>
				#include <defaultnormal_vertex>
				#include <logdepthbuf_vertex>
				#include <fog_vertex>
				#include <shadowmap_vertex>
			}`,

      fragmentShader: /* glsl */`
				uniform sampler2D mirrorSampler;
				uniform float alpha;
				uniform float time;
				uniform float size;
				uniform float distortionScale;
				uniform sampler2D normalSampler;
				uniform vec3 sunColor;
				uniform vec3 sunDirection;
				uniform vec3 eye;
				uniform vec3 waterColor;

				varying vec4 mirrorCoord;
				varying vec4 worldPosition;

				vec4 getNoise( vec2 uv ) {
					vec2 uv0 = ( uv / 103.0 ) + vec2(time / 17.0, time / 29.0);
					vec2 uv1 = uv / 107.0-vec2( time / -19.0, time / 31.0 );
					vec2 uv2 = uv / vec2( 8907.0, 9803.0 ) + vec2( time / 101.0, time / 97.0 );
					vec2 uv3 = uv / vec2( 1091.0, 1027.0 ) - vec2( time / 109.0, time / -113.0 );
					vec4 noise = texture2D( normalSampler, uv0 ) +
						texture2D( normalSampler, uv1 ) +
						texture2D( normalSampler, uv2 ) +
						texture2D( normalSampler, uv3 );
					return noise * 0.5 - 1.0;
				}

				void sunLight( const vec3 surfaceNormal, const vec3 eyeDirection, float shiny, float spec, float diffuse, inout vec3 diffuseColor, inout vec3 specularColor ) {
					vec3 reflection = normalize( reflect( -sunDirection, surfaceNormal ) );
					float direction = max( 0.0, dot( eyeDirection, reflection ) );
					specularColor += pow( direction, shiny ) * sunColor * spec;
					diffuseColor += max( dot( sunDirection, surfaceNormal ), 0.0 ) * sunColor * diffuse;
				}

				#include <common>
				#include <packing>
				#include <bsdfs>
				#include <fog_pars_fragment>
				#include <logdepthbuf_pars_fragment>
				#include <lights_pars_begin>
				#include <shadowmap_pars_fragment>
				#include <shadowmask_pars_fragment>

				void main() {

					#include <logdepthbuf_fragment>
					vec4 noise = getNoise( worldPosition.xz * size );
					vec3 surfaceNormal = normalize( noise.xzy * vec3( 1.5, 1.0, 1.5 ) );

					vec3 diffuseLight = vec3(0.0);
					vec3 specularLight = vec3(0.0);

					vec3 worldToEye = eye-worldPosition.xyz;
					vec3 eyeDirection = normalize( worldToEye );
					sunLight( surfaceNormal, eyeDirection, 100.0, 2.0, 0.5, diffuseLight, specularLight );

					float distance = length(worldToEye);

					vec2 distortion = surfaceNormal.xz * ( 0.001 + 1.0 / distance ) * distortionScale;
					vec3 reflectionSample = vec3( texture2D( mirrorSampler, mirrorCoord.xy / mirrorCoord.w + distortion ) );

					float theta = max( dot( eyeDirection, surfaceNormal ), 0.0 );
					float rf0 = 0.3;
					float reflectance = rf0 + ( 1.0 - rf0 ) * pow( ( 1.0 - theta ), 5.0 );
					vec3 scatter = max( 0.0, dot( surfaceNormal, eyeDirection ) ) * waterColor;
					vec3 albedo = mix( ( sunColor * diffuseLight * 0.3 + scatter ) * getShadowMask(), ( vec3( 0.1 ) + reflectionSample * 0.9 + reflectionSample * specularLight ), reflectance);
					vec3 outgoingLight = albedo;
					gl_FragColor = vec4( outgoingLight, alpha );

					#include <tonemapping_fragment>
					#include <fog_fragment>
				}`

    };

    const material = new ShaderMaterial({
      fragmentShader: mirrorShader.fragmentShader,
      vertexShader: mirrorShader.vertexShader,
      uniforms: UniformsUtils.clone(mirrorShader.uniforms),
      lights: true,
      side: side,
      fog: fog
    });

    material.uniforms['mirrorSampler'].value = renderTarget.texture;
    material.uniforms['textureMatrix'].value = textureMatrix;
    material.uniforms['alpha'].value = alpha;
    material.uniforms['time'].value = time;
    material.uniforms['normalSampler'].value = normalSampler;
    material.uniforms['sunColor'].value = sunColor;
    material.uniforms['waterColor'].value = waterColor;
    material.uniforms['sunDirection'].value = sunDirection;
    material.uniforms['distortionScale'].value = distortionScale;

    material.uniforms['eye'].value = eye;

    scope.material = material;

    scope.onBeforeRender = function (renderer, scene, camera: any) {

      mirrorWorldPosition.setFromMatrixPosition(scope.matrixWorld);
      cameraWorldPosition.setFromMatrixPosition(camera.matrixWorld);

      rotationMatrix.extractRotation(scope.matrixWorld);

      normal.set(0, 0, 1);
      normal.applyMatrix4(rotationMatrix);

      view.subVectors(mirrorWorldPosition, cameraWorldPosition);

      // Avoid rendering when mirror is facing away

      if (view.dot(normal) > 0) return;

      view.reflect(normal).negate();
      view.add(mirrorWorldPosition);

      rotationMatrix.extractRotation(camera.matrixWorld);

      lookAtPosition.set(0, 0, - 1);
      lookAtPosition.applyMatrix4(rotationMatrix);
      lookAtPosition.add(cameraWorldPosition);

      target.subVectors(mirrorWorldPosition, lookAtPosition);
      target.reflect(normal).negate();
      target.add(mirrorWorldPosition);

      mirrorCamera.position.copy(view);
      mirrorCamera.up.set(0, 1, 0);
      mirrorCamera.up.applyMatrix4(rotationMatrix);
      mirrorCamera.up.reflect(normal);
      mirrorCamera.lookAt(target);

      mirrorCamera.far = camera.far; // Used in WebGLBackground

      mirrorCamera.updateMatrixWorld();
      mirrorCamera.projectionMatrix.copy(camera.projectionMatrix);

      // Update the texture matrix
      textureMatrix.set(
        0.5, 0.0, 0.0, 0.5,
        0.0, 0.5, 0.0, 0.5,
        0.0, 0.0, 0.5, 0.5,
        0.0, 0.0, 0.0, 1.0
      );
      textureMatrix.multiply(mirrorCamera.projectionMatrix);
      textureMatrix.multiply(mirrorCamera.matrixWorldInverse);

      // Now update projection matrix with new clip plane, implementing code from: http://www.terathon.com/code/oblique.html
      // Paper explaining this technique: http://www.terathon.com/lengyel/Lengyel-Oblique.pdf
      mirrorPlane.setFromNormalAndCoplanarPoint(normal, mirrorWorldPosition);
      mirrorPlane.applyMatrix4(mirrorCamera.matrixWorldInverse);

      clipPlane.set(mirrorPlane.normal.x, mirrorPlane.normal.y, mirrorPlane.normal.z, mirrorPlane.constant);

      const projectionMatrix = mirrorCamera.projectionMatrix;

      q.x = (Math.sign(clipPlane.x) + projectionMatrix.elements[8]) / projectionMatrix.elements[0];
      q.y = (Math.sign(clipPlane.y) + projectionMatrix.elements[9]) / projectionMatrix.elements[5];
      q.z = - 1.0;
      q.w = (1.0 + projectionMatrix.elements[10]) / projectionMatrix.elements[14];

      // Calculate the scaled plane vector
      clipPlane.multiplyScalar(2.0 / clipPlane.dot(q));

      // Replacing the third row of the projection matrix
      projectionMatrix.elements[2] = clipPlane.x;
      projectionMatrix.elements[6] = clipPlane.y;
      projectionMatrix.elements[10] = clipPlane.z + 1.0 - clipBias;
      projectionMatrix.elements[14] = clipPlane.w;

      eye.setFromMatrixPosition(camera.matrixWorld);

      // Render

      const currentRenderTarget = renderer.getRenderTarget();

      const currentXrEnabled = renderer.xr.enabled;
      const currentShadowAutoUpdate = renderer.shadowMap.autoUpdate;

      scope.visible = false;

      renderer.xr.enabled = false; // Avoid camera modification and recursion
      renderer.shadowMap.autoUpdate = false; // Avoid re-computing shadows

      renderer.setRenderTarget(renderTarget);

      renderer.state.buffers.depth.setMask(true); // make sure the depth buffer is writable so it can be properly cleared, see #18897

      if (renderer.autoClear === false) renderer.clear();
      renderer.render(scene, mirrorCamera);

      scope.visible = true;

      renderer.xr.enabled = currentXrEnabled;
      renderer.shadowMap.autoUpdate = currentShadowAutoUpdate;

      renderer.setRenderTarget(currentRenderTarget);

      // Restore viewport

      const viewport = camera.viewport;

      if (viewport !== undefined) {

        renderer.state.viewport(viewport);

      }

    };

  }

}

const Home: NextPage = () => {
  const [loading, setLoading] = useState(false)

  let camera: any
  let container: any
  const scene = new THREE.Scene()

  const webGLRender = () => {

    container = document.getElementById('webglContainer')
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    container.appendChild(renderer.domElement)
    var viewport = { width: container.clientWidth, height: container.clientHeight, aspectRatio: container.clientWidth / container.clientHeight }
    camera = new THREE.PerspectiveCamera(45, viewport.aspectRatio, 0.1, 10000)

    var viewSize = { distance: camera.position.z, vFov: (camera.fov * Math.PI) / 180, height: 2 * Math.tan((camera.fov * Math.PI) / 180 / 2) * camera.position.z, width: 2 * Math.tan((camera.fov * Math.PI) / 180 / 2) * camera.position.z * viewport.aspectRatio, }

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
    const waterGeometry = new THREE.PlaneGeometry(10000, 10000);

    let water = new Water(
      waterGeometry,
      {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: new THREE.TextureLoader().load('textures/waternormals.jpg', function (texture) {texture.wrapS = texture.wrapT = THREE.RepeatWrapping;}),
        sunDirection: new THREE.Vector3(),
        sunColor: 0xffffff,
        waterColor: 0x001e0f,
        distortionScale: 3.7,
        fog: scene.fog !== undefined
      });

    water.rotation.x = - Math.PI / 2;
    water.position.y = -1
    scene.add(water);

    const bgTexture = loaderTexture.load('textures/background1.png')

    var myCube = new THREE.Object3D

    loaderGLTF.load('models/cube.glb', function (gltf) {
      let geo
      const _material = new THREE.MeshStandardMaterial( {color: 0x666666, emissive:0x111111, side:THREE.DoubleSide, map:loaderTexture.load('textures/textur3.jpg'),
        roughness:0.8, metalness:0.1, opacity:0.99, transparent:true, 
        bumpMap:loaderTexture.load('textures/floor_mask.jpg'), bumpScale:0.01,
        // displacementMap:loaderTexture.load('textures/floor_mask.jpg'), displacementScale : 0.5
       })
      gltf.scene.traverse( function( object ) {
        if ((object instanceof THREE.Mesh)) geo = object.geometry; 
      });
      myCube = new THREE.Mesh(geo, _material)
      const _scale = isMobile?2:0.4
      myCube.scale.set(_scale, _scale, _scale)
      myCube.position.set(0, -4, 0)
      scene.add(myCube);
    }, undefined, function (error) {
      console.error(error);
    });

    loadManager.onProgress = (urlOfLastItemLoaded, itemsLoaded, itemsTotal) => {
      scene.background = bgTexture
      const progress = itemsLoaded / itemsTotal;
      if (progress == 1.0) initContent()
    };

    var bgMaterial = new THREE.MeshLambertMaterial({ map: bgTexture });
    const bg = new THREE.Mesh(new THREE.PlaneBufferGeometry(11000, 5500, 10, 1), bgMaterial)
    bg.position.set(0, 750, -5000)
    scene.add(bg)
    {
      // const logo = new THREE.Object3D
      // scene.add(logo)
      // var logoMaterial1 = new THREE.MeshLambertMaterial({ map: loaderTexture.load('textures/logos/Acquaint.png'), alphaTest: 0.01, alphaMap: loaderTexture.load('textures/logos/AcquaintMask.png') });
      // var logoMaterial2 = new THREE.MeshLambertMaterial({ map: loaderTexture.load('textures/logos/Antin.png'), alphaTest: 0.01, alphaMap: loaderTexture.load('textures/logos/AntinMask.png') });
      // var logoMaterial3 = new THREE.MeshLambertMaterial({ map: loaderTexture.load('textures/logos/Brackets.png'), alphaTest: 0.01, alphaMap: loaderTexture.load('textures/logos/BracketsMask.png') });
      // var logoMaterial4 = new THREE.MeshLambertMaterial({ map: loaderTexture.load('textures/logos/77WideLogo.png'), alphaTest: 0.01, alphaMap: loaderTexture.load('textures/logos/77WideLogo.png') });
      // var logoMaterial5 = new THREE.MeshLambertMaterial({ map: loaderTexture.load('textures/logos/Gabriel.png'), alphaTest: 0.01, alphaMap: loaderTexture.load('textures/logos/GabrielMask.png') });
      // var logoMaterial6 = new THREE.MeshLambertMaterial({ map: loaderTexture.load('textures/logos/Soul.png'), alphaTest: 0.01, alphaMap: loaderTexture.load('textures/logos/SoulMask.png') });
      // var logoMaterial7 = new THREE.MeshLambertMaterial({ map: loaderTexture.load('textures/logos/VFXStudio.png'), alphaTest: 0.01, alphaMap: loaderTexture.load('textures/logos/VFXStudioMask.png') });

      // const logo1 = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 1.2, 1, 1), logoMaterial1)
      // logo1.position.set(0, 0, 0)
      // logo.add(logo1)

      // const logo2 = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 1.2, 1, 1), logoMaterial2)
      // logo1.position.set(0, 0, 0)
      // logo.add(logo2)

      // const logo3 = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 1.2, 1, 1), logoMaterial3)
      // logo1.position.set(0, 0, 0)
      // logo.add(logo3)

      // const logo4 = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 1.2, 1, 1), logoMaterial6)
      // logo1.position.set(0, 0, 0)
      // logo.add(logo4)

      // const logo5 = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 1.2, 1, 1), logoMaterial5)
      // logo1.position.set(0, 0, 0)
      // logo.add(logo5)

      // const logo6 = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 1.2, 1, 1), logoMaterial7)
      // logo1.position.set(0, 0, 0)
      // logo.add(logo6)
    }

    var order = -1, orderBefore = 0
    const cameraDeltaZ = isMobile?100:12, cameraDeltaY = isMobile?5:2
    var touchvalue: number
    var flag = true
    var details = new Array
    var temp
    var cameraFollow = false

    temp = document.querySelector('.main-part > div > div:nth-child(1)'); details.push(temp);

    temp = document.querySelector('.main-part > div > div.logo-title:nth-child(2)'); details.push(temp);

    temp = document.querySelector('.main-part > div > div:nth-child(3) > div > div.details'); details.push(temp)
    temp = document.querySelector('.main-part > div > div:nth-child(4) > div > div.details'); details.push(temp)
    temp = document.querySelector('.main-part > div > div:nth-child(5) > div > div.details'); details.push(temp)

    temp = document.querySelector('.main-part > div > div:nth-child(1)'); details.push(temp);
    temp = document.querySelector('.main-part > div > div:nth-child(1)'); details.push(temp);

    // animate();

    function animate() {
      const time = performance.now() * 0.001;

      if(cameraFollow){
        myCube.position.y = Math.sin(time) * 0.4 - 0.6;
        myCube.rotation.x = time * 0.5;
        myCube.rotation.z = time * 0.53;
        // TweenMax.to(camera.position, 0.05, { x: myCube.position.x, ease: 'Power0.easeInOut',})
        TweenMax.to(camera.position, 0.05, { y: myCube.position.y+cameraDeltaY, ease: 'Power0.easeInOut',})
        TweenMax.to(camera.position, 0.05, { z: myCube.position.z+cameraDeltaZ, ease: 'Power0.easeInOut',})

      }
      let waterMaterial: any = water.material;
      waterMaterial.uniforms['time'].value += 1.0 / 60.0;
      requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }

    function initContent() {
      animate()
      setLoading(true)
      flag = false;
      const temp = myCube.position
      lightPoint.position.set(temp.x - 10, temp.y + 20, temp.z)   
      camera.position.set(0, 0.5, 1000)
      myCube.position.y = isMobile?-5:-2
      setTimeout(() => { order++; updateContent() }, 1000)
    }

    function updateContent() {
      console.log(order)
      const offsetValueX = isMobile?10:4
      const offsetValueZ = isMobile?20:8
      const cubeY = myCube.position.y
      const cubeZ = myCube.position.z
      if (order === 0){
        TweenMax.to(myCube.position, 0.9, { x: 0, ease: 'Power0.easeInOut', delay: 0.1 })
        TweenMax.to(camera.position, 5, { z: cameraDeltaZ, y:myCube.position.y + cameraDeltaY, ease: 'expo.inOut', delay: 0 })
      }else if (order === 1){
        TweenMax.to(myCube.position, 2.0, { y: -0.5, ease: 'elastic.out(2.5, 0.6)'})
        setTimeout(() => { cameraFollow = true }, 200)
      }else if (order === 5){
        cameraFollow = false
        TweenMax.to(myCube.position, 1, { x: 0, y:cameraDeltaY-0.2, ease: 'Power4.easeOut'})
        TweenMax.to(myCube.rotation, 1, { x: 0, y:0, z:0, ease: 'Power4.easeOut'})
        TweenMax.to(camera.position, 3, { z:myCube.position.z+1 , delay:2})
        setTimeout(() => { Router.push('/company') }, 4500)
      }else{
        TweenMax.to(myCube.position, 0.9, { 
          x: order < 2 ? 0 : (order % 2 == 0) ? offsetValueX : -offsetValueX, 
          z: order>orderBefore? cubeZ - offsetValueZ : cubeZ + offsetValueZ,
          ease: 'Power0.easeOut', delay: 0.1 
        })
      }

      if(order === 2){
        temp = document.querySelector('.scroll-gif')
        gsap.to(temp, 0.2, {opacity:1})
      }else{        
        temp = document.querySelector('.scroll-gif')
        gsap.to(temp, 0.1, {opacity:0})
      }
        
      const alphaX = myCube.rotation.x

      if (order == 1) {
        TweenMax.to(details[order], 0.7, { opacity: 1, scale: isMobile ? 2 : 3, ease: 'Power0.easeInOut', delay: 0.7 })
      } else {
        TweenMax.to(details[order], 0.7, { opacity: 1, scale: 1.3, ease: 'Power0.easeInOut', delay: 0.7 })
        if (orderBefore == 1)
          TweenMax.to(details[orderBefore], 0.7, { opacity: 0, scale: isMobile ? 3 : 5, ease: 'Power0.easeInOut' })
        else
          TweenMax.to(details[orderBefore], 0.7, { opacity: 0, scale: order > orderBefore ? 1.6 : 1, ease: 'Power0.easeInOut' })
      }

      orderBefore = order
      if (order > 1)
        setTimeout(() => { flag = true }, 2000)
      else
        setTimeout(() => { flag = false; order++; updateContent() }, 5000)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })

    window.addEventListener('resize', () => {
      container = document.getElementById('webglContainer')
      viewport.width = container.clientWidth
      viewport.height = container.clientHeight
      viewport.aspectRatio = viewport.width / viewport.height
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      const viewSize = {
        distance: camera.position.z,
        vFov: (camera.fov * Math.PI) / 180,
        height: 2 * Math.tan((camera.fov * Math.PI) / 180 / 2) * camera.position.z,
        width: 2 * Math.tan((camera.fov * Math.PI) / 180 / 2) * camera.position.z * viewport.aspectRatio,
      }
      renderer.setSize(container.clientWidth, container.clientHeight)
    })
    window.addEventListener("wheel", function (event: { deltaY: number }) {
      if (flag) {
        flag = false
        if (event.deltaY > 0)
          order++
        else
          order--

        if (order < 2) {
          order = 2
          setTimeout(() => { flag = true }, 1000)
          return
        }

        if (order > 5) {
          order = 5
          setTimeout(() => { flag = true }, 1000)
          return
        }
        updateContent()
      }
    })
    window.addEventListener("touchstart", function (touchEvent) {
      if (flag)
        touchvalue = touchEvent.changedTouches[0].pageY
    }, false);
    window.addEventListener("touchend", function (touchEvent) {
      if (flag) {
        flag = false
        if (touchvalue < touchEvent.changedTouches[0].pageY)
          order++
        else
          order--

        if (order < 2) {
          order = 2
          setTimeout(() => { flag = true }, 1000)
          return
        }

        if (order > 5) {
          order = 5
          setTimeout(() => { flag = true }, 1000)
          return
        }
        updateContent()
      }
    }, false);
  }

  useEffect(() => {
    if (typeof document !== "undefined") {
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
              <div className='text-[50px] md:text-[90px]'>77</div>
              <div className='ml-2'>
                <div className='text-right text-[30px] leading-[25px] md:text-[55px] md:leading-[50px]'>Media</div>
                <div className='text-right text-[15px] leading-[15px] md:text-[25px] md:leading-[25px]'>Holding</div>
              </div>
            </div>

            <div className='absolute w-full h-full '>
              <div className='flex w-full h-full items-center justify-center'>
                <div className='details relative w-[70vw] h-[60vh] flex justify-start items-end'>
                  <div className='w-full'>
                    <div className='title text-[15px] md:text-[30px] font-semibold uppercase pb-10'>Making a Positive Difference with Integrity</div>                    
                  </div>
                </div>
              </div>
            </div>

            <div className='absolute w-full h-full '>
              <div className='flex w-full h-full items-center justify-center'>
                <div className='details relative w-[70vw] h-[60vh] flex justify-end items-end'>
                  <div className='w-full md:w-[40%]'>
                    <div className='title text-[15px] md:text-[30px] font-semibold mb-2 md:mb-4 uppercase'>Humble Past</div>
                    <div className='description text-[10px] leading-[10px] md:text-[25px] md:leading-[25px] text-justify'>
                      Established Feb 22, 2010 with very limited capital, 77 Media started as a 1 man multimedia production house.<br /><br />
                      Today through the grace of God, 77 Media has become a holding company with 7 subsidiaries in the fields of communication, entertainment, and technology.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='absolute w-full h-full '>
              <div className='flex w-full h-full items-center justify-center'>
                <div className='details relative w-[70vw] h-[60vh] flex justify-start items-end'>
                  <div className='w-full md:w-[40%]'>
                    <div className='title text-[15px] md:text-[30px] font-semibold mb-2 md:mb-4 uppercase'>Exciting Future</div>
                    <div className='description text-[10px] leading-[10px] md:text-[25px] md:leading-[25px] text-justify'>
                      Our vision is clear, and our ambitions are great. We are always looking for the next revolutionizing investment opportunity.<br /><br />
                      Whether it is through organic growth of our current businesses or through a drastic pivot, we are eager and ready for any challenge.
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
        <div className='absolute top-0 left-0 w-full'>
          <Header />
        </div>
      </main>
      <div id='webglContainer' className='fixed top-0 left-0 w-full h-full'></div>
      <div className='absolute w-full h-full top-0 left-0 z-10 bg-black' style={{ display: loading ? 'none' : 'block' }} >
        <Loading2 />
      </div>
      <div className='w-full absolute bottom-5 scroll-gif opacity-0'>
        <img src='./images/_scroll.gif' className="w-[150px] mx-auto"/>
        <div className='text-center text-10 -mt-10 text-white'>SCROLL TO EXPLORE</div>
      </div>
      {/* <div className='hidden md:block'>
        <Cursor/>
      </div> */}
    </div>
  )
}

export default Home