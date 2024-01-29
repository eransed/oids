<script lang="ts">
  import { navigate } from 'svelte-routing'
  import type { Tokens } from '../../lib/interface'

  import queryString from 'query-string'
  import getProfile from '../../lib/services/user/profile'
  import Page from '../../components/page/page.svelte'
  import CircularSpinner from '../../components/loaders/circularSpinner.svelte'

  const parsed = queryString.parse(location.search)

  if (parsed.accessToken && parsed.refreshToken) {
    const tokens: Tokens = {
      accessToken: parsed.accessToken.toString(),
      refreshToken: parsed.refreshToken.toString(),
    }

    localStorage.setItem('accessToken', tokens.accessToken)
    localStorage.setItem('refreshToken', tokens.refreshToken)
  }

  getProfile().then(() => {
    navigate('/profile')
  })
</script>

<Page>
  <CircularSpinner ship />
</Page>
