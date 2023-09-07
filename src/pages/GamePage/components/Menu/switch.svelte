<script lang="ts">
  import { settings } from "../../../../stores/stores"

  export function switchTheme () {
    $settings.darkMode = !$settings.darkMode
  }

</script>