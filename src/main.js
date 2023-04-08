/* eslint-disable no-unused-vars */

import Lenis from '@studio-freight/lenis'
import { Curtains, Plane, Vec2 } from 'curtainsjs'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SplitType from 'split-type'

import fragment from './shaders/fragmentShader.glsl'
import vertex from './shaders/vertexShader.glsl'

gsap.registerPlugin(ScrollTrigger)

class App {
  curtains
  lenis
  planes = []
  scrollEffect = 0

  DOM = {
    h1: document.querySelector('h1'),
    planeElements: [...document.querySelectorAll('[data-animation="image"]')],
    heroImage: document.querySelector('.project_header_img'),
    heroWebGlPlane: null,
    paragraphs: [...document.querySelectorAll('[data-animation="paragraph"]')],
    wheel: document.querySelector('.wheel_icon'),
    wheelWrapper: document.querySelector('.wheel_wrapper'),
    pageWrap: document.querySelector('.page-wrapper'),
  }

  animationState = {}

  constructor() {
    this.init()
  }

  async init() {
    await this.createLoaderAnimation()
    this.createCurtains()
    this.setupCurtains()
    this.createLenis()
    this.createPlanes()
    this.createPageAnimations()
  }

  createLoaderAnimation() {
    const loaderDuration = 2
    return new Promise((resolve) => {
      this.animationState.pageLoaderTimeline = gsap.timeline()

      // page loading
      this.animationState.pageLoaderTimeline.set(this.DOM.wheelWrapper, {
        xPercent: -50,
        yPercent: -50,
        x: innerWidth / 2,
        y: innerHeight / 2,
        scale: 1.2,
      })

      this.animationState.pageLoaderTimeline.to(this.DOM.wheelWrapper, {
        autoAlpha: 1,
        rotation: 360 * 3,
        duration: loaderDuration,
      })

      this.animationState.pageLoaderTimeline.to(this.DOM.wheelWrapper, {
        xPercent: 0,
        yPercent: -100,
        x: 20,
        y: innerHeight - 20,
        scale: 0.75,
        duration: 1,
        onComplete: resolve,
      })
    })
  }

  createCurtains() {
    this.curtains = new Curtains({
      container: 'canvas',
      pixelRatio: Math.min(1.5, window.devicePixelRatio), // limit pixel ratio for performance
      watchScroll: false,
    })
  }

  setupCurtains() {
    this.curtains
      .onRender(() => {
        // update our planes deformation
        this.scrollEffect = this.curtains.lerp(this.scrollEffect, 0, 0.075)
      })
      .onScroll(() => {
        // get scroll deltas to apply the effect on scroll
        const delta = this.curtains.getScrollDeltas()

        // invert value for the effect
        delta.y = -delta.y

        // threshold
        if (delta.y > 60) {
          delta.y = 60
        } else if (delta.y < -60) {
          delta.y = -60
        }

        if (Math.abs(delta.y) > Math.abs(this.scrollEffect)) {
          this.scrollEffect = this.curtains.lerp(
            this.scrollEffect,
            delta.y,
            0.5
          )
        }
      })
      .onError(() => {
        // we will add a class to the document body to display original images
        document.body.classList.add('no-curtains', 'planes-loaded')
      })
      .onContextLost(() => {
        // on context lost, try to restore the context
        this.curtains.restoreContext()
      })
  }

  createLenis() {
    this.curtains.disableDrawing()

    this.lenis = new Lenis({
      duration: 2.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
      direction: 'vertical', // vertical, horizontal
      gestureDirection: 'vertical', // vertical, horizontal, both
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    })

    this.lenis.on('scroll', ({ scroll }) => {
      // update our scroll manager values
      this.curtains.updateScrollValues(0, scroll)
      // render scene
      this.curtains.needRender()
    })

    gsap.ticker.add((time) => {
      this.lenis.raf(time * 1000)
    })
  }

  createPlanes() {
    const params = {
      vertexShader: vertex,
      fragmentShader: fragment,
      widthSegments: 20,
      heightSegments: 20,
      uniforms: {
        scrollEffect: {
          name: 'uScrollEffect',
          type: '1f',
          value: 0.0,
        },
      },
    }

    // add our planes and handle them
    for (let i = 0; i < this.DOM.planeElements.length; i++) {
      const plane = new Plane(this.curtains, this.DOM.planeElements[i], params)

      this.planes.push(plane)

      this.handlePlanes(plane)
    }

    this.DOM.heroWebGlPlane = this.planes[0]
  }

  handlePlanes(plane) {
    plane.setRenderOrder(-10)
    plane
      .onReady(() => {
        // once everything is ready, display everything
        if (plane === this.planes[this.planes.length - 1]) {
          document.body.classList.add('planes-loaded')
        }
      })
      .onRender(() => {
        // update the uniform
        if (!this.animationState.pageIntroTimeline.isActive()) {
          plane.uniforms.scrollEffect.value = this.scrollEffect
        }
      })
  }

  createPageAnimations() {
    this.animationState.pageIntroTimeline = gsap.timeline({})

    this.animationState.pageIntroValues = {
      translationY: 1000,
      wiggle: 1500,
    }

    // Set h1 visibility back to visible
    this.animationState.pageIntroTimeline.set(this.DOM.h1, {
      autoAlpha: 1,
    })

    // hero plane intro
    this.animationState.pageIntroTimeline.to(
      this.animationState.pageIntroValues,
      {
        translationY: 0,
        duration: 1.5,
        onUpdate: () => {
          // plane translation
          this.DOM.heroWebGlPlane.relativeTranslation.y =
            this.animationState.pageIntroValues.translationY
          this.curtains.needRender()
        },
      },
      'start'
    )

    // hero plane intro
    this.animationState.pageIntroTimeline.to(
      this.animationState.pageIntroValues,
      {
        wiggle: 0,
        duration: 2,
        onUpdate: () => {
          // update uniform value
          this.DOM.heroWebGlPlane.uniforms.scrollEffect.value =
            this.scrollEffect + this.animationState.pageIntroValues.wiggle * 0.2

          this.curtains.needRender()
        },
      },
      'start'
    )

    // h1 intro
    const splitH1 = new SplitType(this.DOM.h1, {
      types: 'lines, words',
      lineClass: 'line-wrapper',
    })

    this.animationState.pageIntroTimeline.from(
      splitH1.words,
      {
        yPercent: 100,
        duration: 0.6,
        stagger: 0.075,
      },
      'start+=1.5'
    )

    // wheel rotation on scroll
    this.animationState.pageIntroTimeline.to(this.DOM.wheel, {
      rotate: 360 * 4,
      scrollTrigger: {
        trigger: this.DOM.pageWrap,
        scrub: 1,
        start: 'top top',
        end: '+=10000',
      },
    })

    // paragraphs
    this.DOM.paragraphs.forEach((paragraph) => {
      const parentSplitText = new SplitType(paragraph, {
        types: 'lines',
        lineClass: 'line-wrapper',
      })

      const splitText = new SplitType(parentSplitText.lines, {
        types: `lines`,
      })

      gsap.set(paragraph, {
        autoAlpha: 1,
      })

      gsap.from(splitText.lines, {
        autoAlpha: 0,
        yPercent: 150,
        stagger: 0.1,
        duration: 0.75,
        ease: 'power.out4',
        delay: 0.5,
        scrollTrigger: {
          trigger: paragraph,
          start: 'top 90%',
          once: true,
        },
      })
    })
  }
}

window.addEventListener('load', () => {
  const app = new App()
  console.log('Loaded')
})
