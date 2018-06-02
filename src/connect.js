import * as React from 'react'
import PropTypes from 'prop-types'
import { Client } from 'fetches'

import { FetchesContext } from './context'
import { makeDispatches } from './map-dispatch-to-props'
import { makeResponses, makeRequests } from './map-request-to-props'

const connect = (mapRequestsToProps, mapDispatchToProps) => WrappedComponent => {
  if (!mapRequestsToProps && !mapDispatchToProps) {
    return WrappedComponent
  }
  class Wrapper extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        loading: !!mapRequestsToProps,
        dispatching: false,
        ...this.getDispatchAsProps(),
      }
    }
    componentDidMount() {
      if (!this.props.client) {
        return
      }
      this.getResponseAsProps()
    }

    getDispatchAsProps() {
      if (mapDispatchToProps) {
        return makeDispatches(this.props.client)(mapDispatchToProps)
      }
      return {}
    }

    getResponseAsProps() {
      if (mapRequestsToProps) {
        makeRequests(this.props.client, props => {
          const responses = makeResponses(props)

          this.setState(() => ({
            loading: false,
            ...responses.body,
            errors: responses.errors,
            responses: responses.responses,
          }))
        })(mapRequestsToProps)
      }
    }

    render() {
      return React.createElement(WrappedComponent, Object.assign({}, this.props, this.state))
    }
  }

  Wrapper.propTypes = {
    client: PropTypes.instanceOf(Client).isRequired,
  }

  const FecthesComponent = props => (
    <FetchesContext.Consumer>
      {client => <Wrapper client={client} {...props} />}
    </FetchesContext.Consumer>
  )
  return FecthesComponent
}

export { connect }
