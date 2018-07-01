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
  }

  async componentDidMount() {
    const { client } = this.props
    const http = getHTTPMethods(client)
    try {
      const data = await this.handlePromise(http, this.props)
      this.setState({
        error: null,
        data,
        loading: false,
      })
    } catch (error) {
      if (error.name !== 'AbortError') {
        this.setState({
          error,
          data: null,
          loading: false,
        })
      }
    }
  }

  componentWillUnmount() {
    this.controller.abort()
  }

  getRequest(http, uri, props) {
    const { method } = props
    return http[method.toLowerCase()](uri, {}, { signal: this.signal })
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
  uri: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf('string')]).isRequired, // eslint-disable-line react/no-unused-prop-types
  method: PropTypes.oneOf(['get', 'post', 'patch', 'delete', 'put']).isRequired, // eslint-disable-line react/no-unused-prop-types
  multipleMethod: PropTypes.oneOf(['all', 'race']).isRequired, // eslint-disable-line react/no-unused-prop-types
}

export default RequestWrapper
