<script lang="ts">
  import { rndf, rndfVec2, rndi, type Vec2 } from 'mathil'
  import { onMount } from 'svelte'

  export let stars = 1
  export let nrOfMoons = 5

  let orbitSpeed = 10
  let scale = 5

  let starArr: Star[] = []

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
    for (let i = stars; i > 0; i--) {
      let moons: Moon[] = []
      let asteroids: Asteroid[] = []

      for (let y = nrOfMoons; y > 0; y--) {
        moons.push({ size: rndi(4, 12), asteroids: createAsteroids(rndi(1, 5)) })
      }

      const newStar: Star = {
        pos: rndfVec2(1, window.innerWidth * 1),
        size: rndi(12, 48),
        moons: moons,
      }

      moons = []

      starArr = [newStar, ...starArr]
    }
  })
</script>

<div class="starsWrap">
  {#if starArr.length > 0}
    {#each starArr as star, y}
      <div class="star" style="  width: {star.size}px; height: {star.size}px">
        {#each star.moons as moon, i}
          {#if i > 0}
            <div
              class="moon"
              style="background-color: rgba({rndi(0, 150).toString()}, {rndi(0, 100).toString()}, {rndi(0, 100).toString()}); top: {rndi(
                -25,
                25
              )}px; left: {rndi(-25, 25)}px;  width: {moon.size}px; height: {moon.size}px;  animation-duration: {i * orbitSpeed}s; "
            >
              {#each star.moons[i].asteroids as asteroid, x}
                <div
                  class="asteroid"
                  style="background-color: rgba({rndi(150, 255).toString()}, {rndi(150, 255).toString()}, {rndi(
                    150,
                    255
                  ).toString()}); animation-duration: {((x + 1.5) * orbitSpeed) / 3}s; top: {rndi(-5, 5)}px; left: {rndi(-5, 5)}px;"
                />
              {/each}
            </div>
          {/if}
        {/each}
      </div>
    {/each}
  {/if}
</div>

<style>
  :scope {
    --scale: 1;
  }

  .starsWrap {
    height: 100vh;
    width: 2000vw;
    position: fixed;
    z-index: -1;
    opacity: 1;
    zoom: 2.5;
  }

  .star {
    z-index: -1;
    position: fixed;
    background-image: radial-gradient(circle, var(--main-accent-color) 5%, #4e0000 100%);
    margin: auto;
    inset: 0;
    border-radius: 50%;
    animation: moveStar 100s linear infinite;
  }

  .moon {
    position: absolute;
    background-color: var(--main-accent-color);
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
    background-color: var(--main-accent-color);
    width: 2px;
    height: 2px;
    margin: auto;
    inset: 0;
    /* top: -14px;
    left: -14px; */
    border-radius: 50%;
    animation: rotateAsteroid 1s linear infinite;
  }

  @keyframes rotateAsteroid {
    from {
      transform: rotate(0deg) translate(10px) rotate(0deg);
    }
    to {
      transform: rotate(360deg) translate(10px) rotate(-360deg);
    }
  }

  @keyframes rotateMoon {
    from {
      transform: rotate(0deg) translate(50px) rotate(0deg);
    }
    to {
      transform: rotate(360deg) translate(50px) rotate(-360deg);
    }
  }

  @keyframes moveStar {
    0% {
      /* transform: translate(102vw, 0px); */
      transform: rotate(0deg) translate(8vw) rotate(0deg);
    }
    100% {
      transform: rotate(360deg) translate(8vw) rotate(-360deg);
    }
  }
</style>
