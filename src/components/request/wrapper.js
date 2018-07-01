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
    const { client, method, uri } = this.props
    const http = getHTTPMethods(client)
    try {
      const data = await http[method.toLowerCase()](uri, {}, { signal: this.signal })
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
  uri: PropTypes.string.isRequired,
  method: PropTypes.oneOf(['get', 'post', 'patch', 'delete', 'put']),
}

RequestWrapper.defaultProps = {
  method: 'get',
}

export default RequestWrapper
