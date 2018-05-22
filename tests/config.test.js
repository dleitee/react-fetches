import nodeFetch from 'node-fetch'
import formData from 'form-data'

global.fetch = nodeFetch
global.FormData = formData
