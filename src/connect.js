import * as React from 'react'
import PropTypes from 'prop-types'
import { getHTTPMethods } from 'fetches'
import isPromise from 'p-is-promise'
import _fromPairs from 'lodash.frompairs'

import { FetchesContext } from './context'

const contentTypeIsJSON = header => header && header.includes('application/json')

const defaultParser = data => data

const handler = (request, parser = defaultParser) => index =>
  new Promise(resolve => {
    request
      .catch(error => {
        return resolve([
          index,
          {
            error,
            response: null,
            data: null,
          },
        ])
      })
      .then(response => {
        const clone = response.clone()
        if (contentTypeIsJSON(response.headers.get('content-type'))) {
          return response.json().then(data => Promise.resolve({ data, response: clone }))
        }
        return response.text().then(data => Promise.resolve({ data, response: clone }))
      })
      .then(({ data, response } = {}) => {
        if (!data) {
          return
        }
        resolve([
          index,
          {
            error: 400 % request.status === 400,
            response,
            data: parser(data),
          },
        ])
      })
  })

const getPromiseFromKey = (values, key) =>
  isPromise(values[key]) ? handler(values[key])(key) : values[key](key)

const asyncFunction = (requests, cb) => {
  const keys = Object.keys(requests)
  Promise.all(keys.map(getPromiseFromKey.bind(null, requests))).then(args => cb(_fromPairs(args)))
}

const makeRequests = (client, cb) => mapRequestsToProps => {
  const http = getHTTPMethods(client)
  const requests = mapRequestsToProps(http, handler)
  asyncFunction(requests, cb)
}

const makeResponses = data => {
  const keys = Object.keys(data)
  return keys.reduce((previous, current) => {
    const body = {
      ...previous.body,
      [current]: data[current].data,
    }
    const errors = {
      ...previous.errors,
      [current]: data[current].error,
    }
    const responses = {
      ...previous.responses,
      [current]: data[current].response.clone(),
    }
    return {
      body,
      errors,
      responses,
    }
  }, {})
}
export const connect = mapRequestsToProps => WrappedComponent => {
  if (!mapRequestsToProps) {
    return WrappedComponent
  }
  class Wrapper extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        loading: true,
      }
    }
    componentDidMount() {
      if (this.props.client) {
        makeRequests(this.props.client, data => {
          const responses = makeResponses(data)

          this.setState({
            loading: false,
            ...responses.body,
            errors: responses.errors,
            responses: responses.responses,
          })
        })(mapRequestsToProps)
      }
    }

    render() {
      return React.createElement(WrappedComponent, this.state)
    }
  }

  class FecthesComponent extends React.Component {
    render() {
      return (
        <FetchesContext.Consumer>{client => <Wrapper client={client} />}</FetchesContext.Consumer>
      )
    }
  }
  return FecthesComponent
}
