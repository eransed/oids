<script lang="ts">
  import { navigate } from 'svelte-routing'
  import { menuOpen } from '../../../../components/menu/MenuStore'

  //Components
  import Menu from '../../../../components/menu/Menu.svelte'
  import type { Button90Config } from '../../../../interfaces/menu'
  import { stopGame } from '../Game/Utils/gameUtils'
  import type { Game } from '../../../../lib/game'
  import { settings } from '../../../../stores/stores'
  import { toggleAndGetTheme } from '../../../../style/defaultColors'
  import { initKeyControllers, initTouchControls } from '../../../../lib/input'

  export let currentGame: Game

  const theme: Button90Config = {
    buttonText: 'Theme',
    clickCallback() {
      $settings = toggleAndGetTheme()
    },
    selected: false,
  }

  const continueGame: Button90Config = {
    buttonText: 'Continue',
    clickCallback() {
      $menuOpen = false

      initKeyControllers()
      initTouchControls()
    },
    selected: false,
  }

  const exit: Button90Config = {
    buttonText: 'Exit game',
    clickCallback() {
      $menuOpen = false
      stopGame(currentGame)
      navigate('/play')
    },
    selected: false,
  }

  const buttons = [theme, continueGame, exit]
</script>

<Menu {buttons} menuHeader="In-game menu" />
