import * as React from 'react'

const Request = ({ children }) =>
  children({
    loading: true,
    error: null,
    data: null,
  })

export default Request
