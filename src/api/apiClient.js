import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api', // Change if needed for production
  headers: {
    'Content-Type': 'application/json'
  }
})

export default apiClient