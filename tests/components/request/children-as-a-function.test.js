import React from 'react'
import { render, cleanup } from 'react-testing-library'
import PropTypes from 'prop-types'
import { createClient } from 'fetches'

import { Provider } from '../../../src/provider'
import Request from '../../../src/components/request'

const EXAMPLE_URI = 'http://example.com/api/v1/'

const responseMiddleware = response => response.json()

const client = createClient(EXAMPLE_URI, {
  after: [responseMiddleware],
})

const View = ({ children }) => <Provider client={client}>{children}</Provider>

View.propTypes = {
  children: PropTypes.node.isRequired,
}

describe('Request Component: Children as a Function', () => {
  afterEach(cleanup)
  test(`Requests' children should be a function`, () => {
    const renderized = jest.fn().mockReturnValue(null)
    render(
      <View>
        <Request>{renderized}</Request>
      </View>
    )
    expect(renderized).toBeCalled()
  })
  test(`Requests' children must receive these listed params`, () => {
    const params = ['loading', 'error', 'data']
    const renderized = jest.fn().mockReturnValue(null)
    render(
      <View>
        <Request>{renderized}</Request>
      </View>
    )
    expect(Object.keys(renderized.mock.calls[0][0])).toEqual(params)
  })
})
