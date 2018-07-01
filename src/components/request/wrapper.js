import React from 'react'
import PropTypes from 'prop-types'
import { Client, getHTTPMethods } from 'fetches'
import AbortController from 'abort-controller'

class RequestWrapper extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      error: null,
      data: null,
    }
    this.controller = new AbortController()
    this.signal = this.controller.signal
    this.timeout = null
  }

  componentDidMount() {
    const { client, delay } = this.props
    const http = getHTTPMethods(client)
    if (delay) {
      this.delayRequest().then(() => this.resolvePromise(http))
      return
    }
    this.resolvePromise(http)
  }

  componentWillUnmount() {
    this.controller.abort()
    if (this.timeout) {
      clearTimeout(this.timeout)
    }
  }

  getRequest(http, uri, props) {
    const { method, data, config } = props
    return http[method.toLowerCase()](uri, data, Object.assign({}, config, { signal: this.signal }))
  }

  delayRequest() {
    const { delay } = this.props
    return new Promise(resolve => {
      this.timeout = setTimeout(() => {
        resolve()
      }, delay)
    })
  }

  resolvePromise(http) {
    this.handlePromise(http, this.props)
      .then(data => {
        this.setState({
          error: null,
          data,
          loading: false,
        })
      })
      .catch(error => {
        if (error.name !== 'AbortError') {
          this.setState({
            error,
            data: null,
            loading: false,
          })
        }
      })
  }

  handlePromise(http, props) {
    const { uri } = props
    if (Array.isArray(uri)) {
      return this.handleMultiplePromises(http, props)
    }
    return this.handleSinglePromise(http, props)
  }

  async handleSinglePromise(http, props) {
    const { uri } = props
    return this.getRequest(http, uri, props)
  }

  async handleMultiplePromises(http, props) {
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
}

export default RequestWrapper
