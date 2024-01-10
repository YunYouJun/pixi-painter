import axios from 'axios'

const baseUrl = '/'

export const api = axios.create({
  baseURL: baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

export function postImage(params: {
  image: Blob
  prompt?: string
  num_iterations?: string
}) {
  const formData = new FormData()
  formData.append('image', params.image)
  formData.append('prompt', params.prompt || '')
  formData.append('num_iterations', params.num_iterations || '2')
  return api.post('/api', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    responseType: 'blob',
  })
}