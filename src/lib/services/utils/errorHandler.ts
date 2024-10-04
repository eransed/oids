import { AxiosError } from 'axios'
import { addAlert } from '../../../components/alert/alertHandler'

export function handleAxiosError(err: any): void {
  if (err instanceof AxiosError) {
    switch (err.code) {
      case 'ECONNREFUSED':
      case 'ERR_NETWORK':
        addAlert('error', 'Network error: Planet network unreachable.')
        break
      case 'ECONNABORTED':
        addAlert('error', 'Request timeout. Please try again.')
        break
      default:
        // Extract the error message from the axios response, or fallback to generic
        addAlert('error', err.response?.data?.error?.message || 'An unexpected error occurred')
        break
    }
  } else {
    // Handle non-Axios errors
    addAlert('error', 'An unexpected error occurred')
  }
}
