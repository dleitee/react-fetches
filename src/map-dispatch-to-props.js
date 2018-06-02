import { getHTTPMethods } from 'fetches'

import handler from './handler'

const dispatchHandler = (request, config) => (data = {}, parser) => {
  const completeRequest = request.bind(null, data, config)
  return handler(completeRequest(), parser)('default').then(args => args[1])
}

const makeDispatches = client => mapDispatchToProps => {
  const http = getHTTPMethods(client)
  const keys = Object.keys(http)

  const httpMethods = keys.reduce(
    (previous, current) => ({
      ...previous,
      [current]: uri => http[current].bind(null, uri),
    }),
    {}
  )

  return mapDispatchToProps(httpMethods, dispatchHandler)
}

export { makeDispatches }
