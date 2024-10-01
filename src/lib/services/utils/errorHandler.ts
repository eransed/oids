import { AxiosError } from 'axios'
import { addAlert } from '../../../components/alert/alertHandler'

export function handleAxiosError(err: any): void {
  if (err instanceof AxiosError) {
    // Extract error message from the response or use a generic message
    addAlert('error', err.response?.data?.error?.message || 'An unexpected error occurred')
  } else {
    addAlert('error', 'An unexpected error occurred')
  }
  // Handle non-Axios errors
}
