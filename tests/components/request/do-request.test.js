import React from 'react'
import PropTypes from 'prop-types'
import nock from 'nock'
import { render, cleanup, wait } from 'react-testing-library'
import { createClient } from 'fetches'

import Request from '../../../src/components/request'
import { Provider } from '../../../src/provider'

const EXAMPLE_URI = 'http://example.com/api/v1/'

const responseMiddleware = response => response.json()

const client = createClient(EXAMPLE_URI, {
  after: [responseMiddleware],
})

const View = props => <Provider client={client}>{props.children}</Provider>

View.propTypes = {
  children: PropTypes.node.isRequired,
}

describe('Request Component: Do a request', () => {
  afterEach(cleanup)

  afterAll(() => {
    nock.cleanAll()
  })

  test("The Request's component should do a basic request and update its params", async () => {
    const response = {
      data: [{ name: 'Joaquim', age: 2 }, { name: 'Daniel', age: 29 }],
    }
    nock(EXAMPLE_URI)
      .get('/friends/')
      .reply(200, () => response)
    const renderized = jest.fn().mockReturnValue(null)
    const { getByText } = render(
      <View>
        <Request uri="friends">
          {({ loading, data }) => {
            renderized(loading, data)
            if (loading) {
              return 'Loading'
            }
            return 'Loaded'
          }}
        </Request>
      </View>
    )
    expect(renderized).toBeCalled()
    await wait(() => getByText('Loading'))
    await wait(() => getByText('Loaded'))
    expect(renderized).toHaveBeenCalledTimes(2)
    expect(renderized.mock.calls[0][0]).toBeTruthy()
    expect(renderized.mock.calls[1][0]).toBeFalsy()
    expect(renderized.mock.calls[0][1]).toBeNull()
    expect(renderized.mock.calls[1][1]).toEqual(response)
  })
})
