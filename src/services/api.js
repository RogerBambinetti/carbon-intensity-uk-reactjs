import axios from 'axios'

const api = axios.create({ baseURL: 'https://api.carbonintensity.org.uk/' })

export default api
