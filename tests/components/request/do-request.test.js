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

const View = ({ children }) => <Provider client={client}>{children}</Provider>

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

  test("The Request's component should cancel the fetch request when its has been unmounted", async () => {
    // TODO: Implement this test
    // We already implemented this feature, but we can't test it yet
    // node-fetch doesn't support the signal for aborting fetch calls
    // there is an issue created there to fix it
    // https://github.com/bitinn/node-fetch/issues/95
    const response = {
      data: [{ name: 'Joaquim', age: 2 }, { name: 'Daniel', age: 29 }],
    }
    nock(EXAMPLE_URI)
      .get('/friends/')
      .delay(1000)
      .reply(200, () => response)
    const renderized = jest.fn().mockReturnValue(null)
    const { unmount, getByText } = render(
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
    unmount()
  })

  test("The Request's component should also receive URI as an array", async () => {
    const responseFriends = {
      data: [{ name: 'Joaquim', age: 2 }, { name: 'Daniel', age: 29 }],
    }
    const responseChannels = {
      data: ['random', 'app', 'social'],
    }

    nock(EXAMPLE_URI)
      .get('/channels/')
      .reply(200, () => responseChannels)
    nock(EXAMPLE_URI)
      .get('/friends/')
      .reply(200, () => responseFriends)
    const renderized = jest.fn().mockReturnValue(null)
    const { getByText } = render(
      <View>
        <Request uri={['friends', 'channels']}>
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
    expect(renderized.mock.calls[1][1]).toEqual([responseFriends, responseChannels])
  })

  test("The Request's component should be skipped with the prop skip", async () => {
    const renderized = jest.fn().mockReturnValue(null)

    const { getByText } = render(
      <View>
        <Request uri="friends" skip>
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
    await wait(() => getByText('Loaded'))
    expect(renderized).toHaveBeenCalledTimes(1)
    expect(renderized.mock.calls[0][0]).toBeFalsy()
    expect(renderized.mock.calls[0][1]).toBeNull()
  })

  test("The fetch request of Request's component should be configured with the prop config", async () => {
    const response = {
      data: [{ name: 'Joaquim', age: 2 }, { name: 'Daniel', age: 28 }],
    }

    const headerFn = jest.fn()
    nock(EXAMPLE_URI)
      .get('/friends/')
      .reply(200, function reply() {
        headerFn(this.req.headers)
        return response
      })

    const renderized = jest.fn().mockReturnValue(null)

    const { getByText } = render(
      <View>
        <Request uri="friends" config={{ headers: { Authorization: 'Token c' } }}>
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
    await wait(() => getByText('Loading'))
    await wait(() => getByText('Loaded'))
    expect(headerFn.mock.calls[0][0].authorization[0]).toBe('Token c')
  })

  test("The fetch request of Request's component should hit into an URL with parameters.", async () => {
    const response = {
      data: [{ name: 'Joaquim', age: 2 }, { name: 'Daniel', age: 28 }],
    }

    const fn = jest.fn()
    nock(EXAMPLE_URI)
      .get('/friends?order=1')
      .reply(200, () => {
        fn()
        return response
      })

    const { getByText } = render(
      <View>
        <Request uri="friends" data={{ order: 1 }}>
          {({ loading }) => {
            if (loading) {
              return 'Loading'
            }
            return 'Loaded'
          }}
        </Request>
      </View>
    )
    await wait(() => getByText('Loading'))
    await wait(() => getByText('Loaded'))
    expect(fn).toBeCalled()
  })

  test("The Request's component should delay the request.", async () => {
    const response = {
      data: [{ name: 'Joaquim', age: 2 }, { name: 'Daniel', age: 28 }],
    }

    const fn = jest.fn()
    nock(EXAMPLE_URI)
      .get('/friends?order=1')
      .reply(200, () => {
        fn()
        return response
      })

    const { getByText } = render(
      <View>
        <Request uri="friends" data={{ order: 1 }} delay={500}>
          {({ loading }) => {
            if (loading) {
              return 'Loading'
            }
            return 'Loaded'
          }}
        </Request>
      </View>
    )
    await wait(() => getByText('Loading'))
    await wait(() => getByText('Loaded'))
    expect(fn).toBeCalled()
  })
})
