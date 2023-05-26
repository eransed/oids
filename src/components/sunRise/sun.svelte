<style>
  :root {
    --sunColor1: rgba(255, 219, 112, 0.8);
    --sunColor2: rgb(255, 204, 112, 0.9);
    --bottom: 5em;
  }

  .sun {
    box-sizing: border-box;
    position: absolute;
    display: block;
    filter: grayscale(40%);
    scale: 5;
    width: 24px;
    height: 24px;
    background: linear-gradient(to bottom, var(--sunColor2) 4px, transparent 0) no-repeat 5px -6px/2px 6px,
      linear-gradient(to bottom, var(--sunColor2) 4px, transparent 0) no-repeat 5px 14px/2px 6px,
      linear-gradient(to bottom, var(--sunColor2) 4px, transparent 0) no-repeat -8px 5px/6px 2px,
      linear-gradient(to bottom, var(--sunColor2) 4px, transparent 0) no-repeat 14px 5px/6px 2px;
    border-radius: 100px;
    box-shadow: inset 0 0 0 10px var(--sunColor2);
    border: 6px solid transparent;
    animation: spin 3s ease-out forwards, rotate 100s linear infinite;
  }
  .sun::after,
  .sun::before {
    content: "";
    display: block;
    box-sizing: border-box;
    position: absolute;
    width: 24px;
    height: 2px;
    border-right: 4px solid var(--sunColor1);
    border-left: 4px solid var(--sunColor1);
    left: -6px;
    top: 5px;
  }
  .sun::before {
    transform: rotate(-45deg);
  }
  .sun::after {
    transform: rotate(45deg);
  }

  @keyframes spin {
    0% {
      right: 0;
      bottom: -2em;
      scale: 1;
    }
    100% {
      bottom: 5em;
      right: 5em;
    }
  }

  @keyframes rotate {
    0% {
      transform: rotate(0);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>

<div class="sun" />
