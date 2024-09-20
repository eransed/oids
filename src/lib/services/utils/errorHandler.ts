import { AxiosError } from 'axios'
import { alertStore } from '../../../stores/stores'

export function handleAxiosError(err: any): string {
  if (err instanceof AxiosError) {
    // Extract error message from the response or use a generic message
    alertStore.set({ severity: 'error', text: err.response?.data?.error?.message || 'An unexpected error occurred' })

    return err.response?.data?.error?.message || 'An unexpected error occurred'
  }
  // Handle non-Axios errors
  return 'An unexpected error occurred'
}
