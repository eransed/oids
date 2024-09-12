import getProfile from '../lib/services/user/profile'

export async function loginHandler(accessToken: string, refreshtoken: string) {
  localStorage.setItem('accessToken', accessToken)
  localStorage.setItem('refreshToken', refreshtoken)
  try {
    await getProfile()
  } catch (e) {
    console.error(e)
  }
}
