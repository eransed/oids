<script lang="ts">
  import Menu90 from "./shared/menu/Menu90.svelte";

  import type { Button90Config, User } from "./interface";

  import { onMount } from "svelte";

  import { createSpaceObject } from "../lib/factory";
  import { menu, showLoginPage, showMenu, isLoggedIn } from "../lib/stores";
  import { getMenu } from "../lib/menu";
  import { Game } from "../lib/game";
  import { removeKeyControllers } from "../lib/input";

  import Modal from "./shared/Modal.svelte";
  import login from "../lib/services/auth/login";
  import getProfile from "../lib/services/user/profile";

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const response = await login(formData);
    if (response.status === 200) {
      errorText = "";
      isLoggedIn.set(true);
      const profile = await getProfile();
      user = profile.data;
    } else errorText = "Wrong email or password, try again!";
  };

  let menuOpen = true;
  let logInPage = false;
  let loggedIn = false;
  let errorText: any = "";
  let user: User | undefined;

  showMenu.set(menuOpen);
  showLoginPage.set(logInPage);
  isLoggedIn.set(loggedIn);

  isLoggedIn.subscribe((value) => {
    loggedIn = value;
  });

  showLoginPage.subscribe((value) => {
    logInPage = value;
  });
  showMenu.subscribe((value) => {
    menuOpen = value;
  });

  $: display = menuOpen ? "flex" : "none";

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") menuOpen = !menuOpen;
  });

  export function getCanvas(): HTMLCanvasElement {
    return <HTMLCanvasElement>document.getElementById("game_canvas");
  }

  let game: Game;

  // let localPlayer: SpaceObject

  // Variables to subscribe on menu store
  let chosenMenu: Button90Config[];

  onMount(() => {
    console.log("mount...");
    const localPlayer = createSpaceObject("LocalPlayer");
    game = new Game(getCanvas(), localPlayer, showDeadMenu);

    // Setting welcome menu
    menu.set(getMenu(game));
    showLoginPage.set(false);
    // Subscribing on store
    menu.subscribe((value) => {
      chosenMenu = value;
    });
    game.startWelcomeScreen();
  });

  const showDeadMenu = (): void => {
    removeKeyControllers();
    menu.set(getMenu(game));
    showMenu.set(true);
  };
</script>

<style>
  #game_menu {
    color: #fff;
    justify-content: center;
    align-content: center;
  }

  #game_canvas {
    max-width: 4000px;
    max-height: 3000px;
    width: 100vw;
    height: 100vh;
    position: absolute;
    /* cursor: none; */
  }

  #menuWrapper {
    height: 35vh;
    display: flex;
    flex-flow: wrap;
    justify-content: center;
    align-content: center;
  }

  @media only screen and (min-width: 800px) {
    #menuWrapper {
      height: 50vh;
      display: flex;
      flex-flow: wrap;
      justify-content: center;
      align-content: center;
    }
  }
</style>

<canvas id="game_canvas" />

{#if logInPage}
  <Modal title="Log in">
    {#if !loggedIn}
      <form on:submit={handleSubmit} on:formdata>
        <label>
          Email
          <input name="email" type="email" autocomplete="email" />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            autocomplete="current-password"
          />
        </label>
        <button>Log in</button>
      </form>
    {/if}
    {#if loggedIn}
      Login success!
      <p>Welcome</p>
      {user?.email}
    {/if}

    {errorText}
  </Modal>
{/if}

{#if game}
  <div id="menuWrapper">
    <div id="game_menu" style:display>
      <Menu90 {menuOpen} buttons={chosenMenu} />
    </div>
  </div>
{/if}
