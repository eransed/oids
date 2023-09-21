<script lang="ts">
  import { navigate } from 'svelte-routing'

  //Components
  import Menu from '../../../../components/menu/Menu.svelte'
  import type { Button90Config } from '../../../../interfaces/menu'
  import { stopGame } from '../Game/Utils/gameUtils'
  import type { Game } from '../../../../lib/game'
  import { settings } from '../../../../stores/stores'
  import { toggleAndGetTheme } from '../../../../style/defaultColors'

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
    clickCallback() {},
    selected: false,
  }

  const exit: Button90Config = {
    buttonText: 'Exit game',
    clickCallback() {
      stopGame(currentGame)
      navigate('/play')
    },
    selected: false,
  }

  const buttons = [theme, continueGame, exit]
</script>

<Menu {buttons} menuOpen={false} menuHeader="In-game menu" />
