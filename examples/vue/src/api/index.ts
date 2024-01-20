import axios from 'axios'

const baseUrl = import.meta.env.VITE_API_BASE_URL as string | '/api'

export const api = axios.create({
  baseURL: baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

export function postImage(params: {
  image: Blob
  prompt?: string
  num_iterations?: number
}) {
  const formData = new FormData()
  formData.append('image', params.image)
  formData.append('prompt', params.prompt || '')
  formData.append('num_iterations', params.num_iterations?.toString() || '2')
  return api.post('/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    responseType: 'blob',
  })
}
