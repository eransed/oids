<script lang="ts">
  //Components
  import Menu from "../../../../components/menu/Menu.svelte"
  import type { Game } from "../../../../lib/game"

  export let currentGame: Game

  //Button Config
  import { GameMenuButtons } from "./MenuConfig"
</script>

<Menu buttons={GameMenuButtons(currentGame)} menuOpen={false} menuHeader="In-game menu" />
