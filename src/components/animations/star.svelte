<script lang="ts">
  import { rndfVec2, rndi, type Vec2 } from 'mathil'
  import { onDestroy, onMount } from 'svelte'

  interface OrbitDirection {
    from: string
    to: string
  }

  /**
   * Number of mooons orbiting the star.
   * @type {number}
   *
   */
  export let nrOfMoons = 5

  /**
   * Direction of orbit of the star system.
   * Will effect star, moons and asteroids.
   * @type {boolean}
   */
  export let clockwiseOrbit = true

  /**
   * Star system will follow mouse
   * @type {boolean}
   */
  export let followMouse = false

  let orbitOffset = rndi(1, 1000) / 600
  let orbitStarSpeed = `${rndi(5, 100)}s`

  let orbitDirection: OrbitDirection = { from: clockwiseOrbit ? '0deg' : '360deg', to: clockwiseOrbit ? '360deg' : '0deg' }

  let orbitSpeed = 10
  let starArr: Star[] = []
  let galaxyBlur = '75%'

  interface Star {
    pos: Vec2
    size: number
    moons: Moon[]
  }

  interface Moon {
    size: number
    asteroids: Asteroid[]
  }

  interface Asteroid {
    size: number
  }

  function createAsteroids(nr: number): Asteroid[] {
    let asteroids: Asteroid[] = []

    const asteroidsAmount = rndi(1, 5)
    for (let a = 0; a < asteroidsAmount; a++) {
      asteroids.push({ size: rndi(2, 4) })
    }
    return asteroids
  }

  onMount(() => {
    let moons: Moon[] = []

    for (let y = nrOfMoons; y > 0; y--) {
      moons.push({ size: rndi(4, 12), asteroids: createAsteroids(rndi(1, 5)) })
    }

    const newStar: Star = {
      pos: rndfVec2(1, window.innerWidth * 1),
      size: rndi(24, 48),
      moons: moons,
    }

    moons = []

    starArr = [newStar, ...starArr]

    if (followMouse) {
      addEventListener('mousemove', (e: MouseEvent) => handleMouseMove(e))
    }
  })

  let timeOut: number

  function handleMouseMove(e: MouseEvent) {
    clearTimeout(timeOut)
    timeOut = setTimeout(() => {
      setStarPos({ x: e.x, y: e.y })
    }, 500)
  }

  function setStarPos(vec: Vec2) {
    let star = document.getElementById('star')
    if (star) {
      star?.style.setProperty('top', `${(vec.y - window.innerHeight / 2).toString()}px`)
      star?.style.setProperty('left', `${(vec.x - window.innerWidth / 2).toString()}px`)
    }
  }

  onDestroy(() => {
    if (followMouse) {
      removeEventListener('mousemove', handleMouseMove)
    }
  })
</script>

<div class="starsWrap">
  {#if starArr.length > 0}
    {#each starArr as star, y}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div
        id="star"
        class="star"
        style="--orbitStarSpeed: {orbitStarSpeed}; --orbitOffset: {orbitOffset}; --orbitFrom: {orbitDirection.from}; --orbitTo: {orbitDirection.to}; background-image: radial-gradient(circle at center, var(--main-accent-color) 5%, transparent {galaxyBlur});  width: {star.size}px; height: {star.size}px"
      >
        {#each star.moons as moon, i}
          <div
            class="moon"
            style="background-image: radial-gradient(circle at center, rgb({rndi(0, 150).toString()}, {rndi(0, 100).toString()}, {rndi(
              0,
              100
            ).toString()}) 25%, transparent {galaxyBlur}); top: {rndi(-25, 25)}px; left: {rndi(-25, 25)}px;  width: {star.size / 4}px; height: {star.size /
              4}px;  animation-duration: {i <= 0 ? rndi(10, 20) : i * orbitSpeed}s; "
          >
            {#each star.moons[i].asteroids as asteroid, x}
              <div
                class="asteroid"
                style="width: {star.size / 12}px; height: {star.size / 12}px; background-image: radial-gradient(circle at center, rgb({rndi(
                  0,
                  150
                ).toString()}, {rndi(0, 100).toString()}, {rndi(0, 100).toString()}) 25%, transparent {galaxyBlur}); animation-duration: {((x + 1.5) *
                  orbitSpeed) /
                  3}s; top: {rndi(-10, 10)}px; left: {rndi(-10, 10)}px;"
              />
            {/each}
          </div>
        {/each}
      </div>
    {/each}
  {/if}
</div>

<style>
  :scope {
    --scale: 1;
    --orbitFrom: 0;
    --orbitTo: 0;
    --orbitOffset: 0;
    --orbitStarSpeed: 0;
  }

  .starsWrap {
    height: 100vh;
    width: 2000vw;
    position: fixed;

    opacity: 1;
    zoom: 2.5;
  }

  .star {
    position: fixed;
    /* background: radial-gradient(circle at center, #f0e68c 10%, transparent 30%); */
    margin: auto;
    inset: 0;
    border-radius: 50%;
    animation: moveStar var(--orbitStarSpeed) linear infinite;
    transition: all 4s ease-in-out;
    /* transition-delay: 1s; */
  }

  .moon {
    position: absolute;
    /* background-image: radial-gradient(var(--main-accent-color), transparent 40%); */

    width: 10px;
    height: 10px;
    margin: auto;
    inset: 0;

    /* top: -14px;
    left: -14px; */
    border-radius: 50%;
    animation: rotateMoon 2s linear infinite;
  }

  .asteroid {
    position: absolute;
    /* background-color: var(--main-accent-color); */

    margin: auto;
    inset: 0;
    /* top: -14px;
    left: -14px; */
    border-radius: 50%;
    animation: rotateAsteroid 1s linear infinite;
  }

  @keyframes rotateAsteroid {
    from {
      transform: rotate(var(--orbitFrom)) translate(10px) rotate(var(--orbitFrom));
    }
    to {
      transform: rotate(var(--orbitTo)) translate(10px) rotate(var(--orbitTo));
    }
  }

  @keyframes rotateMoon {
    from {
      transform: rotate(var(--orbitFrom)) translate(50px) rotate(var(--orbitFrom));
    }
    to {
      transform: rotate(var(--orbitTo)) translate(50px) rotate(var(--orbitTo));
    }
  }

  @keyframes moveStar {
    0% {
      /* transform: translate(102vw, 0px); */
      transform: rotate(var(--orbitFrom)) translate(calc(var(--orbitOffset) * 4vw)) rotate(var(--orbitFrom));
    }
    100% {
      transform: rotate(var(--orbitTo)) translate(calc(var(--orbitOffset) * 4vw)) rotate(var(--orbitTo));
    }
  }
</style>
