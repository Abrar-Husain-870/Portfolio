import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { BloomEffect, EffectComposer, EffectPass, RenderPass, SMAAEffect, SMAAPreset } from 'postprocessing'

import './Hyperspeed.css'

type HyperspeedProps = {
  effectOptions?: any
  className?: string
}

export default function Hyperspeed({ effectOptions = {
  onSpeedUp: () => { },
  onSlowDown: () => { },
  distortion: 'turbulentDistortion',
  length: 400,
  roadWidth: 10,
  islandWidth: 2,
  lanesPerRoad: 4,
  fov: 90,
  fovSpeedUp: 150,
  speedUp: 2,
  carLightsFade: 0.4,
  totalSideLightSticks: 20,
  lightPairsPerRoadWay: 40,
  shoulderLinesWidthPercentage: 0.05,
  brokenLinesWidthPercentage: 0.1,
  brokenLinesLengthPercentage: 0.5,
  lightStickWidth: [0.12, 0.5],
  lightStickHeight: [1.3, 1.7],
  movingAwaySpeed: [60, 80],
  movingCloserSpeed: [-120, -160],
  carLightsLength: [400 * 0.03, 400 * 0.2],
  carLightsRadius: [0.05, 0.14],
  carWidthPercentage: [0.3, 0.5],
  carShiftX: [-0.8, 0.8],
  carFloorSeparation: [0, 5],
  colors: {
    roadColor: 0x080808,
    islandColor: 0x0a0a0a,
    background: 0x000000,
    shoulderLines: 0xFFFFFF,
    brokenLines: 0xFFFFFF,
    leftCars: [0xD856BF, 0x6750A2, 0xC247AC],
    rightCars: [0x03B3C3, 0x0E5EA5, 0x324555],
    sticks: 0x03B3C3,
  }
}, className = '' }: HyperspeedProps) {
  const appRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // Clean previous
    appRef.current?.dispose?.()
    if (containerRef.current) {
      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild)
      }
    }

    // Uniforms
    const mountainUniforms = {
      uFreq: { value: new THREE.Vector3(3, 6, 10) },
      uAmp: { value: new THREE.Vector3(30, 30, 20) }
    }
    const xyUniforms = {
      uFreq: { value: new THREE.Vector2(5, 2) },
      uAmp: { value: new THREE.Vector2(25, 15) }
    }
    const LongRaceUniforms = {
      uFreq: { value: new THREE.Vector2(2, 3) },
      uAmp: { value: new THREE.Vector2(35, 10) }
    }
    const turbulentUniforms = {
      uFreq: { value: new THREE.Vector4(4, 8, 8, 1) },
      uAmp: { value: new THREE.Vector4(25, 5, 10, 10) }
    }
    const deepUniforms = {
      uFreq: { value: new THREE.Vector2(4, 8) },
      uAmp: { value: new THREE.Vector2(10, 20) },
      uPowY: { value: new THREE.Vector2(20, 2) }
    }

    const nsin = (val: number) => Math.sin(val) * 0.5 + 0.5

    const distortions: any = {
      mountainDistortion: {
        uniforms: mountainUniforms,
        getDistortion: `
          uniform vec3 uAmp;
          uniform vec3 uFreq;
          #define PI 3.14159265358979
          float nsin(float val){
            return sin(val) * 0.5 + 0.5;
          }
          vec3 getDistortion(float progress){
            float movementProgressFix = 0.02;
            return vec3( 
              cos(progress * PI * uFreq.x + uTime) * uAmp.x - cos(movementProgressFix * PI * uFreq.x + uTime) * uAmp.x,
              nsin(progress * PI * uFreq.y + uTime) * uAmp.y - nsin(movementProgressFix * PI * uFreq.y + uTime) * uAmp.y,
              nsin(progress * PI * uFreq.z + uTime) * uAmp.z - nsin(movementProgressFix * PI * uFreq.z + uTime) * uAmp.z
            );
          }
        `,
        getJS: (progress: number, time: number) => {
          const movementProgressFix = 0.02
          const uFreq = mountainUniforms.uFreq.value
          const uAmp = mountainUniforms.uAmp.value
          const distortion = new THREE.Vector3(
            Math.cos(progress * Math.PI * uFreq.x + time) * uAmp.x -
            Math.cos(movementProgressFix * Math.PI * uFreq.x + time) * uAmp.x,
            nsin(progress * Math.PI * uFreq.y + time) * uAmp.y -
            nsin(movementProgressFix * Math.PI * uFreq.y + time) * uAmp.y,
            nsin(progress * Math.PI * uFreq.z + time) * uAmp.z -
            nsin(movementProgressFix * Math.PI * uFreq.z + time) * uAmp.z
          )
          const lookAtAmp = new THREE.Vector3(2, 2, 2)
          const lookAtOffset = new THREE.Vector3(0, 0, -5)
          return distortion.multiply(lookAtAmp).add(lookAtOffset)
        }
      },
      xyDistortion: {
        uniforms: xyUniforms,
        getDistortion: `
          uniform vec2 uFreq;
          uniform vec2 uAmp;
          #define PI 3.14159265358979
          vec3 getDistortion(float progress){
            float movementProgressFix = 0.02;
            return vec3( 
              cos(progress * PI * uFreq.x + uTime) * uAmp.x - cos(movementProgressFix * PI * uFreq.x + uTime) * uAmp.x,
              sin(progress * PI * uFreq.y + PI/2. + uTime) * uAmp.y - sin(movementProgressFix * PI * uFreq.y + PI/2. + uTime) * uAmp.y,
              0.
            );
          }
        `,
        getJS: (progress: number, time: number) => {
          const movementProgressFix = 0.02
          const uFreq = xyUniforms.uFreq.value
          const uAmp = xyUniforms.uAmp.value
          const distortion = new THREE.Vector3(
            Math.cos(progress * Math.PI * uFreq.x + time) * uAmp.x -
            Math.cos(movementProgressFix * Math.PI * uFreq.x + time) * uAmp.x,
            Math.sin(progress * Math.PI * uFreq.y + time + Math.PI / 2) * uAmp.y -
            Math.sin(movementProgressFix * Math.PI * uFreq.y + time + Math.PI / 2) * uAmp.y,
            0
          )
          const lookAtAmp = new THREE.Vector3(2, 0.4, 1)
          const lookAtOffset = new THREE.Vector3(0, 0, -3)
          return distortion.multiply(lookAtAmp).add(lookAtOffset)
        }
      },
      LongRaceDistortion: {
        uniforms: LongRaceUniforms,
        getDistortion: `
          uniform vec2 uFreq;
          uniform vec2 uAmp;
          #define PI 3.14159265358979
          vec3 getDistortion(float progress){
            float camProgress = 0.0125;
            return vec3( 
              sin(progress * PI * uFreq.x + uTime) * uAmp.x - sin(camProgress * PI * uFreq.x + uTime) * uAmp.x,
              sin(progress * PI * uFreq.y + uTime) * uAmp.y - sin(camProgress * PI * uFreq.y + uTime) * uAmp.y,
              0.
            );
          }
        `,
        getJS: (progress: number, time: number) => {
          const camProgress = 0.0125
          const uFreq = LongRaceUniforms.uFreq.value
          const uAmp = LongRaceUniforms.uAmp.value
          const distortion = new THREE.Vector3(
            Math.sin(progress * Math.PI * uFreq.x + time) * uAmp.x -
            Math.sin(camProgress * Math.PI * uFreq.x + time) * uAmp.x,
            Math.sin(progress * Math.PI * uFreq.y + time) * uAmp.y -
            Math.sin(camProgress * Math.PI * uFreq.y + time) * uAmp.y,
            0
          )
          const lookAtAmp = new THREE.Vector3(1, 1, 0)
          const lookAtOffset = new THREE.Vector3(0, 0, -5)
          return distortion.multiply(lookAtAmp).add(lookAtOffset)
        }
      },
      turbulentDistortion: {
        uniforms: turbulentUniforms,
        getDistortion: `
          uniform vec4 uFreq;
          uniform vec4 uAmp;
          float nsin(float val){
            return sin(val) * 0.5 + 0.5;
          }
          #define PI 3.14159265358979
          float getDistortionX(float progress){
            return (
              cos(PI * progress * uFreq.r + uTime) * uAmp.r +
              pow(cos(PI * progress * uFreq.g + uTime * (uFreq.g / uFreq.r)), 2. ) * uAmp.g
            );
          }
          float getDistortionY(float progress){
            return (
              -nsin(PI * progress * uFreq.b + uTime) * uAmp.b +
              -pow(nsin(PI * progress * uFreq.a + uTime / (uFreq.b / uFreq.a)), 5.) * uAmp.a
            );
          }
          vec3 getDistortion(float progress){
            return vec3(
              getDistortionX(progress) - getDistortionX(0.0125),
              getDistortionY(progress) - getDistortionY(0.0125),
              0.
            );
          }
        `,
        getJS: (progress: number, time: number) => {
          const uFreq = turbulentUniforms.uFreq.value
          const uAmp = turbulentUniforms.uAmp.value
          const getX = (p: number) =>
            Math.cos(Math.PI * p * uFreq.x + time) * uAmp.x +
            Math.pow(Math.cos(Math.PI * p * uFreq.y + time * (uFreq.y / uFreq.x)), 2) * uAmp.y
          const getY = (p: number) =>
            -nsin(Math.PI * p * uFreq.z + time) * uAmp.z -
            Math.pow(nsin(Math.PI * p * uFreq.w + time / (uFreq.z / uFreq.w)), 5) * uAmp.w
          const distortion = new THREE.Vector3(
            getX(progress) - getX(progress + 0.007),
            getY(progress) - getY(progress + 0.007),
            0
          )
          const lookAtAmp = new THREE.Vector3(-2, -5, 0)
          const lookAtOffset = new THREE.Vector3(0, 0, -10)
          return distortion.multiply(lookAtAmp).add(lookAtOffset)
        }
      },
      turbulentDistortionStill: {
        uniforms: turbulentUniforms,
        getDistortion: `
          uniform vec4 uFreq;
          uniform vec4 uAmp;
          float nsin(float val){
            return sin(val) * 0.5 + 0.5;
          }
          #define PI 3.14159265358979
          float getDistortionX(float progress){
            return (
              cos(PI * progress * uFreq.r) * uAmp.r +
              pow(cos(PI * progress * uFreq.g * (uFreq.g / uFreq.r)), 2. ) * uAmp.g
            );
          }
          float getDistortionY(float progress){
            return (
              -nsin(PI * progress * uFreq.b) * uAmp.b +
              -pow(nsin(PI * progress * uFreq.a / (uFreq.b / uFreq.a)), 5.) * uAmp.a
            );
          }
          vec3 getDistortion(float progress){
            return vec3(
              getDistortionX(progress) - getDistortionX(0.02),
              getDistortionY(progress) - getDistortionY(0.02),
              0.
            );
          }
        `
      },
      deepDistortionStill: {
        uniforms: deepUniforms,
        getDistortion: `
          uniform vec4 uFreq;
          uniform vec4 uAmp;
          uniform vec2 uPowY;
          float nsin(float val){
            return sin(val) * 0.5 + 0.5;
          }
          #define PI 3.14159265358979
          float getDistortionX(float progress){
            return (
              sin(progress * PI * uFreq.x) * uAmp.x * 2.
            );
          }
          float getDistortionY(float progress){
            return (
              pow(abs(progress * uPowY.x), uPowY.y) + sin(progress * PI * uFreq.y) * uAmp.y
            );
          }
          vec3 getDistortion(float progress){
            return vec3(
              getDistortionX(progress) - getDistortionX(0.02),
              getDistortionY(progress) - getDistortionY(0.05),
              0.
            );
          }
        `
      },
      deepDistortion: {
        uniforms: deepUniforms,
        getDistortion: `
          uniform vec4 uFreq;
          uniform vec4 uAmp;
          uniform vec2 uPowY;
          float nsin(float val){
            return sin(val) * 0.5 + 0.5;
          }
          #define PI 3.14159265358979
          float getDistortionX(float progress){
            return (
              sin(progress * PI * uFreq.x + uTime) * uAmp.x
            );
          }
          float getDistortionY(float progress){
            return (
              pow(abs(progress * uPowY.x), uPowY.y) + sin(progress * PI * uFreq.y + uTime) * uAmp.y
            );
          }
          vec3 getDistortion(float progress){
            return vec3(
              getDistortionX(progress) - getDistortionX(0.02),
              getDistortionY(progress) - getDistortionY(0.02),
              0.
            );
          }
        `,
        getJS: (progress: number, time: number) => {
          const uFreq = deepUniforms.uFreq.value
          const uAmp = deepUniforms.uAmp.value
          const uPowY = deepUniforms.uPowY.value
          const getX = (p: number) => Math.sin(p * Math.PI * uFreq.x + time) * uAmp.x
          const getY = (p: number) => Math.pow(p * uPowY.x, uPowY.y) + Math.sin(p * Math.PI * uFreq.y + time) * uAmp.y
          const distortion = new THREE.Vector3(
            getX(progress) - getX(progress + 0.01),
            getY(progress) - getY(progress + 0.01),
            0
          )
          const lookAtAmp = new THREE.Vector3(-2, -4, 0)
          const lookAtOffset = new THREE.Vector3(0, 0, -10)
          return distortion.multiply(lookAtAmp).add(lookAtOffset)
        }
      }
    }

    // Helpers
    const random = (base: number | [number, number]) => {
      if (Array.isArray(base)) return Math.random() * (base[1] - base[0]) + base[0]
      return Math.random() * base
    }
    const pickRandom = (arr: any) => {
      if (Array.isArray(arr)) return arr[Math.floor(Math.random() * arr.length)]
      return arr
    }
    function lerp(current: number, target: number, speed = 0.1, limit = 0.001) {
      let change = (target - current) * speed
      if (Math.abs(change) < limit) {
        change = target - current
      }
      return change
    }

    class CarLights {
      webgl: any; options: any; colors: any; speed: any; fade: any; mesh: any
      constructor(webgl: any, options: any, colors: any, speed: any, fade: any) {
        this.webgl = webgl
        this.options = options
        this.colors = colors
        this.speed = speed
        this.fade = fade
      }
      init() {
        const options = this.options
        const curve = new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1))
        const geometry = new THREE.TubeGeometry(curve, 40, 1, 8, false)
        const instanced = new THREE.InstancedBufferGeometry().copy(
          geometry as any
        )
        instanced.instanceCount = options.lightPairsPerRoadWay * 2
        const laneWidth = options.roadWidth / options.lanesPerRoad
        const aOffset: number[] = []
        const aMetrics: number[] = []
        const aColor: number[] = []
        let colors = this.colors
        if (Array.isArray(colors)) colors = colors.map((c: any) => new THREE.Color(c))
        else colors = new THREE.Color(colors)
        for (let i = 0; i < options.lightPairsPerRoadWay; i++) {
          const radius = random(options.carLightsRadius)
          const length = random(options.carLightsLength)
          const speed = random(this.speed)
          const carLane = i % options.lanesPerRoad
          let laneX = carLane * laneWidth - options.roadWidth / 2 + laneWidth / 2
          const carWidth = random(options.carWidthPercentage) * laneWidth
          const carShiftX = random(options.carShiftX) * laneWidth
          laneX += carShiftX
          const offsetY = random(options.carFloorSeparation) + (radius as number) * 1.3
          const offsetZ = -random(options.length)
          aOffset.push(laneX - (carWidth as number) / 2, offsetY as number, offsetZ as number)
          aOffset.push(laneX + (carWidth as number) / 2, offsetY as number, offsetZ as number)
          aMetrics.push(radius as number, length as number, speed as number)
          aMetrics.push(radius as number, length as number, speed as number)
          const color = pickRandom(colors)
          aColor.push(color.r, color.g, color.b)
          aColor.push(color.r, color.g, color.b)
        }
        instanced.setAttribute('aOffset', new THREE.InstancedBufferAttribute(new Float32Array(aOffset), 3, false))
        instanced.setAttribute('aMetrics', new THREE.InstancedBufferAttribute(new Float32Array(aMetrics), 3, false))
        instanced.setAttribute('aColor', new THREE.InstancedBufferAttribute(new Float32Array(aColor), 3, false))
        const material = new THREE.ShaderMaterial({
          fragmentShader: carLightsFragment,
          vertexShader: carLightsVertex,
          transparent: true,
          uniforms: Object.assign({ uTime: { value: 0 }, uTravelLength: { value: options.length }, uFade: { value: this.fade } }, (this as any).webgl.fogUniforms, options.distortion.uniforms)
        })
        material.onBeforeCompile = (shader: any) => {
          shader.vertexShader = shader.vertexShader.replace('#include <getDistortion_vertex>', options.distortion.getDistortion)
        }
        const mesh = new THREE.Mesh(instanced, material)
        mesh.frustumCulled = false
        ;(this as any).webgl.scene.add(mesh)
        this.mesh = mesh
      }
      update(time: number) { this.mesh.material.uniforms.uTime.value = time }
    }

    const carLightsFragment = `
      #define USE_FOG;
      ${THREE.ShaderChunk['fog_pars_fragment']}
      varying vec3 vColor;
      varying vec2 vUv; 
      uniform vec2 uFade;
      void main() {
        vec3 color = vec3(vColor);
        float alpha = smoothstep(uFade.x, uFade.y, vUv.x);
        gl_FragColor = vec4(color, alpha);
        if (gl_FragColor.a < 0.0001) discard;
        ${THREE.ShaderChunk['fog_fragment']}
      }
    `

    const carLightsVertex = `
      #define USE_FOG;
      ${THREE.ShaderChunk['fog_pars_vertex']}
      attribute vec3 aOffset;
      attribute vec3 aMetrics;
      attribute vec3 aColor;
      uniform float uTravelLength;
      uniform float uTime;
      varying vec2 vUv; 
      varying vec3 vColor; 
      #include <getDistortion_vertex>
      void main() {
        vec3 transformed = position.xyz;
        float radius = aMetrics.r;
        float myLength = aMetrics.g;
        float speed = aMetrics.b;
        transformed.xy *= radius;
        transformed.z *= myLength;
        transformed.z += myLength - mod(uTime * speed + aOffset.z, uTravelLength);
        transformed.xy += aOffset.xy;
        float progress = abs(transformed.z / uTravelLength);
        transformed.xyz += getDistortion(progress);
        vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.);
        gl_Position = projectionMatrix * mvPosition;
        vUv = uv;
        vColor = aColor;
        ${THREE.ShaderChunk['fog_vertex']}
      }
    `

    class LightsSticks {
      webgl: any; options: any; mesh: any
      constructor(webgl: any, options: any) { this.webgl = webgl; this.options = options }
      init() {
        const options = this.options
        const geometry = new THREE.PlaneGeometry(1, 1)
        const instanced = new THREE.InstancedBufferGeometry().copy(
          geometry as any
        )
        const totalSticks = options.totalSideLightSticks
        instanced.instanceCount = totalSticks
        const stickoffset = options.length / (totalSticks - 1)
        const aOffset: number[] = []
        const aColor: number[] = []
        const aMetrics: number[] = []
        let colors = options.colors.sticks
        if (Array.isArray(colors)) colors = colors.map((c: any) => new THREE.Color(c))
        else colors = new THREE.Color(colors)
        for (let i = 0; i < totalSticks; i++) {
          const width = random(options.lightStickWidth)
          const height = random(options.lightStickHeight)
          aOffset.push((i - 1) * stickoffset * 2 + stickoffset * Math.random())
          const color = pickRandom(colors)
          aColor.push(color.r, color.g, color.b)
          aMetrics.push(width as number, height as number)
        }
        instanced.setAttribute('aOffset', new THREE.InstancedBufferAttribute(new Float32Array(aOffset), 1, false))
        instanced.setAttribute('aColor', new THREE.InstancedBufferAttribute(new Float32Array(aColor), 3, false))
        instanced.setAttribute('aMetrics', new THREE.InstancedBufferAttribute(new Float32Array(aMetrics), 2, false))
        const material = new THREE.ShaderMaterial({
          fragmentShader: sideSticksFragment,
          vertexShader: sideSticksVertex,
          side: THREE.DoubleSide,
          uniforms: Object.assign({ uTravelLength: { value: options.length }, uTime: { value: 0 } }, (this as any).webgl.fogUniforms, options.distortion.uniforms)
        })
        material.onBeforeCompile = (shader: any) => {
          shader.vertexShader = shader.vertexShader.replace('#include <getDistortion_vertex>', options.distortion.getDistortion)
        }
        const mesh = new THREE.Mesh(instanced, material)
        mesh.frustumCulled = false
        ;(this as any).webgl.scene.add(mesh)
        this.mesh = mesh
      }
      update(time: number) { this.mesh.material.uniforms.uTime.value = time }
    }

    const sideSticksVertex = `
      #define USE_FOG;
      ${THREE.ShaderChunk['fog_pars_vertex']}
      attribute float aOffset;
      attribute vec3 aColor;
      attribute vec2 aMetrics;
      uniform float uTravelLength;
      uniform float uTime;
      varying vec3 vColor;
      mat4 rotationY( in float angle ) {
        return mat4(\tcos(angle),\t\t0,\t\tsin(angle),\t0,
                     0,\t\t1.0,\t\t\t\t 0,\t0,
                -sin(angle),\t0,\t\tcos(angle),\t0,
                0, \t\t0,\t\t\t\t\t0,\t1);
      }
      #include <getDistortion_vertex>
      void main(){
        vec3 transformed = position.xyz;
        float width = aMetrics.x;
        float height = aMetrics.y;
        transformed.xy *= vec2(width, height);
        float time = mod(uTime * 60. * 2. + aOffset, uTravelLength);
        transformed = (rotationY(3.14/2.) * vec4(transformed,1.)).xyz;
        transformed.z += - uTravelLength + time;
        float progress = abs(transformed.z / uTravelLength);
        transformed.xyz += getDistortion(progress);
        transformed.y += height / 2.;
        transformed.x += -width / 2.;
        vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.);
        gl_Position = projectionMatrix * mvPosition;
        vColor = aColor;
        ${THREE.ShaderChunk['fog_vertex']}
      }
    `

    const sideSticksFragment = `
      #define USE_FOG;
      ${THREE.ShaderChunk['fog_pars_fragment']}
      varying vec3 vColor;
      void main(){
        vec3 color = vec3(vColor);
        gl_FragColor = vec4(color,1.);
        ${THREE.ShaderChunk['fog_fragment']}
      }
    `

    class Road {
      webgl: any; options: any; uTime: any; leftRoadWay: any; rightRoadWay: any; island: any
      constructor(webgl: any, options: any) { this.webgl = webgl; this.options = options; this.uTime = { value: 0 } }
      createPlane(side: number, _width: number, isRoad: boolean) {
        const options = this.options
        const segments = 100
        const geometry = new THREE.PlaneGeometry(isRoad ? options.roadWidth : options.islandWidth, options.length, 20, segments)
        let uniforms: any = { uTravelLength: { value: options.length }, uColor: { value: new THREE.Color(isRoad ? options.colors.roadColor : options.colors.islandColor) }, uTime: this.uTime }
        if (isRoad) {
          uniforms = Object.assign(uniforms, {
            uLanes: { value: options.lanesPerRoad },
            uBrokenLinesColor: { value: new THREE.Color(options.colors.brokenLines) },
            uShoulderLinesColor: { value: new THREE.Color(options.colors.shoulderLines) },
            uShoulderLinesWidthPercentage: { value: options.shoulderLinesWidthPercentage },
            uBrokenLinesLengthPercentage: { value: options.brokenLinesLengthPercentage },
            uBrokenLinesWidthPercentage: { value: options.brokenLinesWidthPercentage }
          })
        }
        const material = new THREE.ShaderMaterial({
          fragmentShader: isRoad ? roadFragment : islandFragment,
          vertexShader: roadVertex,
          side: THREE.DoubleSide,
          uniforms: Object.assign(uniforms, (this as any).webgl.fogUniforms, options.distortion.uniforms)
        })
        material.onBeforeCompile = (shader: any) => {
          shader.vertexShader = shader.vertexShader.replace('#include <getDistortion_vertex>', options.distortion.getDistortion)
        }
        const mesh = new THREE.Mesh(geometry, material)
        mesh.rotation.x = -Math.PI / 2
        mesh.position.z = -options.length / 2
        mesh.position.x += (this.options.islandWidth / 2 + options.roadWidth / 2) * side
        ;(this as any).webgl.scene.add(mesh)
        return mesh
      }
      init() {
        this.leftRoadWay = this.createPlane(-1, this.options.roadWidth, true)
        this.rightRoadWay = this.createPlane(1, this.options.roadWidth, true)
        this.island = this.createPlane(0, this.options.islandWidth, false)
      }
      update(time: number) { this.uTime.value = time }
    }

    const roadBaseFragment = `
      #define USE_FOG;
      varying vec2 vUv; 
      uniform vec3 uColor;
      uniform float uTime;
      #include <roadMarkings_vars>
      ${THREE.ShaderChunk['fog_pars_fragment']}
      void main() {
        vec2 uv = vUv;
        vec3 color = vec3(uColor);
        #include <roadMarkings_fragment>
        gl_FragColor = vec4(color, 1.);
        ${THREE.ShaderChunk['fog_fragment']}
      }
    `
    const islandFragment = roadBaseFragment.replace('#include <roadMarkings_fragment>', '').replace('#include <roadMarkings_vars>', '')
    const roadMarkings_vars = `
      uniform vec3 uBrokenLinesColor;
      uniform vec3 uShoulderLinesColor;
      uniform float uBrokenLinesWidthPercentage;
      uniform float uShoulderLinesWidthPercentage;
      uniform float uBrokenLinesLengthPercentage;
      uniform float uLanes; 
    `
    const roadMarkings_fragment = `
      float brokenLinesSection = 2.;
      float brokenLinesSectionTravelled = mod(uTime * 60., brokenLinesSection);
      float brokenLinesLineWidth = 0.4 * uBrokenLinesWidthPercentage;
      float brokenLinesLineLength = 0.5 * uBrokenLinesLengthPercentage;
      float shoulderLinesLineWidth = 0.6 * uShoulderLinesWidthPercentage;
      float brokenLinesMiddle = mix(0.68, 1.2, sin(uTime) * 0.5 + 0.5);
      // Shoulder lines
      color = mix(color, uShoulderLinesColor, smoothstep(-1., 1., uv.x - 1. + shoulderLinesLineWidth) - smoothstep(-1., 1., uv.x - 1.));
      color = mix(color, uShoulderLinesColor, smoothstep(-1., 1., uv.x + 1.) - smoothstep(-1., 1., uv.x + 1. + shoulderLinesLineWidth));
      // Broken lines across lanes
      for(float i = 1.; i < 4.; i += 1.){
        if(i > uLanes) break;
        color = mix(color, uBrokenLinesColor,
          (smoothstep(-1., 1., uv.x + i / uLanes - brokenLinesLineWidth / 2.) - smoothstep(-1., 1., uv.x + i / uLanes + brokenLinesLineWidth / 2.))
          *
          (1. - smoothstep(0., 0.15, abs(mod(uv.y + brokenLinesSectionTravelled, brokenLinesSection) - brokenLinesMiddle) - brokenLinesLineLength / 2.))
        );
      }
    `
    const roadFragment = roadBaseFragment.replace('#include <roadMarkings_fragment>', roadMarkings_fragment).replace('#include <roadMarkings_vars>', roadMarkings_vars)
    const roadVertex = `
      #define USE_FOG;
      ${THREE.ShaderChunk['fog_pars_vertex']}
      varying vec2 vUv; 
      #include <getDistortion_vertex>
      uniform float uTravelLength;
      uniform float uTime; 
      void main() {
        vec3 transformed = position.xyz;
        vUv = uv;
        transformed.y += 1.;
        transformed.y += -pow(abs(transformed.x), 2.) * 0.04;
        float progress = abs(transformed.z / uTravelLength);
        transformed.xyz += getDistortion(progress);
        vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.);
        gl_Position = projectionMatrix * mvPosition;
        ${THREE.ShaderChunk['fog_vertex']}
      }
    `

    class App {
      container: HTMLDivElement; options: any; renderer: any; composer: any; camera: any; scene: any; fogUniforms: any; clock: any; assets: any; disposed: boolean; road: any; leftCarLights: any; rightCarLights: any; leftSticks: any; fovTarget: number; speedUpTarget: number; speedUp: number; timeOffset: number; renderPass: any; bloomPass: any
      constructor(container: HTMLDivElement, options: any = {}) {
        this.options = Object.assign({}, { distortion: distortions[options.distortion] || distortions.turbulentDistortion }, options)
        if (this.options.distortion == null) {
          this.options.distortion = { uniforms: { }, getDistortion: 'vec3 getDistortion(float progress){ return vec3(0.); }' }
        }
        this.container = container
        this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true })
        this.renderer.setSize(container.offsetWidth, container.offsetHeight, false)
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.composer = new EffectComposer(this.renderer)
        container.append(this.renderer.domElement)
        this.camera = new THREE.PerspectiveCamera(options.fov, container.offsetWidth / container.offsetHeight, 0.1, 10000)
        this.camera.position.z = -5
        this.camera.position.y = 8
        this.camera.position.x = 0
        this.scene = new THREE.Scene()
        this.scene.background = null
        const fog = new THREE.Fog(options.colors.background, options.length * 0.2, options.length * 500)
        this.scene.fog = fog
        this.fogUniforms = { fogColor: { value: fog.color }, fogNear: { value: fog.near }, fogFar: { value: fog.far } }
        this.clock = new THREE.Clock()
        this.assets = {}
        this.disposed = false
        this.road = new Road(this, options)
        this.leftCarLights = new CarLights(this, options, options.colors.leftCars, options.movingAwaySpeed, new THREE.Vector2(0, 1 - options.carLightsFade))
        this.rightCarLights = new CarLights(this, options, options.colors.rightCars, options.movingCloserSpeed, new THREE.Vector2(1, 0 + options.carLightsFade))
        this.leftSticks = new LightsSticks(this, options)
        this.fovTarget = options.fov
        this.speedUpTarget = 0
        this.speedUp = 0
        this.timeOffset = 0
        this.tick = this.tick.bind(this)
        this.init = this.init.bind(this)
        this.setSize = this.setSize.bind(this)
        this.onMouseDown = this.onMouseDown.bind(this)
        this.onMouseUp = this.onMouseUp.bind(this)
        this.onTouchStart = this.onTouchStart.bind(this)
        this.onTouchEnd = this.onTouchEnd.bind(this)
        this.onContextMenu = this.onContextMenu.bind(this)
        window.addEventListener('resize', this.onWindowResize.bind(this))
      }
      init() {
        // Initialize scene contents
        this.road.init()
        this.leftCarLights.init()
        this.rightCarLights.init()
        this.leftSticks.init()
        // Position meshes based on options
        this.leftCarLights.mesh.position.setX(-(this.options.roadWidth / 2) - (this.options.islandWidth / 2))
        this.rightCarLights.mesh.position.setX((this.options.roadWidth / 2) + (this.options.islandWidth / 2))
        this.leftSticks.mesh.position.setX(-(this.options.roadWidth + this.options.islandWidth / 2))
        // Postprocessing passes
        this.initPasses()
        // Events
        this.container.addEventListener('mousedown', this.onMouseDown)
        this.container.addEventListener('mouseup', this.onMouseUp)
        this.container.addEventListener('mouseout', this.onMouseUp)
        this.container.addEventListener('touchstart', this.onTouchStart, { passive: true } as any)
        this.container.addEventListener('touchend', this.onTouchEnd, { passive: true } as any)
        this.container.addEventListener('touchcancel', this.onTouchEnd, { passive: true } as any)
        this.container.addEventListener('contextmenu', this.onContextMenu)
        // Start loop
        this.tick()
      }
      onWindowResize() {
        const width = this.container.offsetWidth
        const height = this.container.offsetHeight
        this.renderer.setSize(width, height)
        this.camera.aspect = width / height
        this.camera.updateProjectionMatrix()
        this.composer.setSize(width, height)
      }
      initPasses() {
        this.renderPass = new RenderPass(this.scene, this.camera)
        this.bloomPass = new EffectPass(this.camera, new BloomEffect({ luminanceThreshold: 0.2, luminanceSmoothing: 0, resolutionScale: 1 }))
        const smaa = new SMAAEffect({ preset: SMAAPreset.MEDIUM })
        const smaaPass = new EffectPass(this.camera, smaa)
        this.renderPass.renderToScreen = false
        this.bloomPass.renderToScreen = false
        smaaPass.renderToScreen = true
        // Add passes to composer
        this.composer.addPass(this.renderPass)
        this.composer.addPass(this.bloomPass)
        this.composer.addPass(smaaPass)
      }
      onMouseDown(ev: any) { this.options.onSpeedUp?.(ev); this.fovTarget = this.options.fovSpeedUp; this.speedUpTarget = this.options.speedUp }
      onMouseUp(ev: any) { this.options.onSlowDown?.(ev); this.fovTarget = this.options.fov; this.speedUpTarget = 0 }
      onTouchStart(ev: any) { this.options.onSpeedUp?.(ev); this.fovTarget = this.options.fovSpeedUp; this.speedUpTarget = this.options.speedUp }
      onTouchEnd(ev: any) { this.options.onSlowDown?.(ev); this.fovTarget = this.options.fov; this.speedUpTarget = 0 }
      onContextMenu(ev: any) { ev.preventDefault() }
      update(delta: number) {
        const lerpPercentage = Math.exp(-(-60 * Math.log2(1 - 0.1)) * delta)
        this.speedUp += lerp(this.speedUp, this.speedUpTarget, lerpPercentage, 0.00001)
        this.timeOffset += this.speedUp * delta
        const time = this.clock.elapsedTime + this.timeOffset
        this.rightCarLights.update(time)
        this.leftCarLights.update(time)
        this.leftSticks.update(time)
        this.road.update(time)
        let updateCamera = false
        const fovChange = lerp(this.camera.fov, this.fovTarget, lerpPercentage)
        if (fovChange !== 0) { this.camera.fov += fovChange * delta * 6; updateCamera = true }
        if (this.options.distortion.getJS) {
          const distortion = this.options.distortion.getJS(0.025, time)
          this.camera.lookAt(new THREE.Vector3(this.camera.position.x + distortion.x, this.camera.position.y + distortion.y, this.camera.position.z + distortion.z))
          updateCamera = true
        }
        if (updateCamera) this.camera.updateProjectionMatrix()
      }
      render(delta: number) { this.composer.render(delta) }
      dispose() {
        this.disposed = true
        this.renderer?.dispose?.()
        this.composer?.dispose?.()
        this.scene?.clear?.()
        window.removeEventListener('resize', this.onWindowResize.bind(this))
        if (this.container) {
          this.container.removeEventListener('mousedown', this.onMouseDown)
          this.container.removeEventListener('mouseup', this.onMouseUp)
          this.container.removeEventListener('mouseout', this.onMouseUp)
          this.container.removeEventListener('touchstart', this.onTouchStart as any)
          this.container.removeEventListener('touchend', this.onTouchEnd as any)
          this.container.removeEventListener('touchcancel', this.onTouchEnd as any)
          this.container.removeEventListener('contextmenu', this.onContextMenu)
        }
      }
      setSize(width: number, height: number, updateStyles?: boolean) { this.composer.setSize(width, height, updateStyles as any) }
      tick() {
        if (this.disposed || !this) return
        if (resizeRendererToDisplaySize(this.renderer, this.setSize)) {
          const canvas = this.renderer.domElement
          this.camera.aspect = canvas.clientWidth / canvas.clientHeight
          this.camera.updateProjectionMatrix()
        }
        const delta = this.clock.getDelta()
        this.render(delta)
        this.update(delta)
        requestAnimationFrame(this.tick)
      }
    }

    const distortion_uniforms = { uDistortionX: { value: new THREE.Vector2(80, 3) }, uDistortionY: { value: new THREE.Vector2(-40, 2.5) } }

    function resizeRendererToDisplaySize(renderer: any, setSize: (w: number, h: number, u?: boolean) => void) {
      const canvas = renderer.domElement
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      const needResize = canvas.width !== width || canvas.height !== height
      if (needResize) setSize(width, height, false)
      return needResize
    }

    // Create app
    if (containerRef.current) {
      const options = Object.assign({ distortion: distortions[effectOptions?.distortion] || distortions.turbulentDistortion }, effectOptions, { distortion: distortions[effectOptions?.distortion] || distortions.turbulentDistortion })
      // attach distortion uniforms
      options.distortion.uniforms = Object.assign({}, distortion_uniforms, options.distortion.uniforms || {})
      appRef.current = new App(containerRef.current, options)
      appRef.current.init()
    }

    return () => {
      appRef.current?.dispose?.()
    }
  }, [JSON.stringify(effectOptions)])

  return (
    <div className={`absolute inset-0 ${className}`}>
      <div id="lights" ref={containerRef} className="hyperspeed-container" />
    </div>
  )
}
