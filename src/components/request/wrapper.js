import React from 'react'
import PropTypes from 'prop-types'
import { Client, getHTTPMethods } from 'fetches'

const cacheable = setCache => response => {
  setCache(response)
  return Promise.resolve(response)
}

const getClient = (client, cache, setCache) => {
  if (!cache) {
    return client
  }
  return client.appendAfterMiddleware(cacheable(setCache))
}

class RequestWrapper extends React.Component {
  controller = AbortController ? new AbortController() : {}

  timeout = null

  interval = null

  unmounted = false

  memoryAddress = null

  state = {
    loading: true,
    error: null,
    data: null,
  }

  constructor(props) {
    super(props)
    this.memoryAddress = JSON.stringify(props.uri)
  }

  componentDidMount() {
    const { client, delay, pollInterval, setCache, cache } = this.props
    const setCacheWithAddress = setCache.bind(null, this.memoryAddress)
    const configuredClient = getClient(client, cache, setCacheWithAddress)
    const http = getHTTPMethods(configuredClient)
    if (pollInterval) {
      this.delayRequest().then(() => {
        this.interval = setInterval(() => this.resolvePromise(http), pollInterval)
      })
      return
    }
    if (delay) {
      this.delayRequest().then(() => this.resolvePromise(http))
      return
    }
    this.resolvePromise(http)
  }

  componentWillUnmount() {
    this.unmounted = true
    if (this.controller.abort) {
      this.controller.abort()
    }
    clearTimeout(this.timeout)
    clearInterval(this.interval)
  }

  getRequest = (http, uri, props) => {
    const { method, data, config } = props
    const { signal } = this.controller

    return http[method.toLowerCase()](uri, data, Object.assign({}, config, { signal }))
  }

  getStateResponse = (error, data) => {
    if (this.unmounted) {
      return null
    }
    return this.setState({
      error,
      data,
      loading: false,
    })
  }

  delayRequest = () => {
    const { delay } = this.props
    return new Promise(resolve => {
      this.timeout = setTimeout(() => {
        resolve()
      }, delay)
    })
  }

  resolvePromise = http => {
    this.handlePromise(http, this.props)
      .then(data => {
        this.getStateResponse(null, data)
      })
      .catch(error => {
        this.getStateResponse(error, null)
      })
  }

  handlePromise = (http, props) => {
    const { uri, cache, getCache } = props

    const cacheResult = getCache(this.memoryAddress)
    if (cache && cacheResult) {
      return Promise.resolve(cacheResult)
    }

    if (Array.isArray(uri)) {
      return this.handleMultiplePromises(http, props)
    }
    return this.handleSinglePromise(http, props)
  }

  handleSinglePromise = (http, props) => {
    const { uri } = props
    return this.getRequest(http, uri, props)
  }

  handleMultiplePromises = (http, props) => {
    const { multipleMethod, uri } = props
    const promises = uri.map(item => this.getRequest(http, item, props))
    return Promise[multipleMethod](promises)
  }

  render() {
    const { children } = this.props
    const { loading, error, data } = this.state
    return children({
      loading,
      error,
      data,
    })
  }
}

RequestWrapper.propTypes = {
  client: PropTypes.instanceOf(Client).isRequired,
  children: PropTypes.func.isRequired,
  uri: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]).isRequired, // eslint-disable-line react/no-unused-prop-types
  method: PropTypes.oneOf(['get', 'post', 'patch', 'delete', 'put']).isRequired, // eslint-disable-line react/no-unused-prop-types
  multipleMethod: PropTypes.oneOf(['all', 'race']).isRequired, // eslint-disable-line react/no-unused-prop-types
  config: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types,react/no-unused-prop-types
  data: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types,react/no-unused-prop-types
  delay: PropTypes.number.isRequired,
  pollInterval: PropTypes.number.isRequired,
  cache: PropTypes.bool.isRequired,
}

export default RequestWrapper
