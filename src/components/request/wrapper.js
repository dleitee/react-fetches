import React from 'react'
import PropTypes from 'prop-types'
import { Client, getHTTPMethods } from 'fetches'

class RequestWrapper extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      error: null,
      data: null,
    }
  }

  async componentDidMount() {
    const { client, method, uri } = this.props
    const http = getHTTPMethods(client)
    try {
      const data = await http[method.toLowerCase()](uri)
      this.setState({
        error: null,
        data,
        loading: false,
      })
    } catch (error) {
      this.setState({
        error,
        data: null,
        loading: false,
      })
    }
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
