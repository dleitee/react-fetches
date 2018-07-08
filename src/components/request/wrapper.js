import React from 'react'
import PropTypes from 'prop-types'
import { Client, getHTTPMethods } from 'fetches'

class RequestWrapper extends React.Component {
  controller = AbortController ? new AbortController() : {}

  timeout = null

  interval = null

  unmounted = false

  state = {
    loading: true,
    error: null,
    data: null,
  }

  componentDidMount() {
    const { client, delay, pollInterval } = this.props
    const http = getHTTPMethods(client)
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
    const { uri } = props
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
}

export default RequestWrapper
