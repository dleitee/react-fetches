import isPromise from 'p-is-promise'
import { getHTTPMethods } from 'fetches'
import _fromPairs from 'lodash.frompairs'

import handler from './handler'

const getPromiseFromKey = (values, key) =>
  isPromise(values[key]) ? handler(values[key])(key) : values[key](key)

const asyncFunction = (requests, cb) => {
  const keys = Object.keys(requests)
  Promise.all(keys.map(getPromiseFromKey.bind(null, requests))).then(args => cb(_fromPairs(args)))
}

const makeRequests = (client, cb) => (mapRequestsToProps, currentProps) => {
  const http = getHTTPMethods(client)
  const requests = mapRequestsToProps(http, handler, currentProps)
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
      [current]: data[current].response && data[current].response.clone(),
    }
    return {
      body,
      errors,
      responses,
    }
  }, {})
}

export { makeResponses, makeRequests }
