import React from 'react'
import PropTypes from 'prop-types'
import { render } from 'react-testing-library'
import nock from 'nock'
import { createClient } from 'fetches'

import { Provider } from '../src/provider'
import { connect } from '../src/connect'

const EXAMPLE_URI = 'http://example.com/api/v1/'

const client = createClient(EXAMPLE_URI)

const View = props => <Provider client={client}>{props.children}</Provider>

View.propTypes = {
  children: PropTypes.node.isRequired,
}

describe('connect with mapDispatchToProps', () => {
  let renderized
  let SimpleComponent
  beforeEach(() => {
    renderized = jest.fn()
    SimpleComponent = props => {
      renderized(props)
      return <div>Hello</div>
    }

    const mapDispatchToProps = (http, dispatch) => ({
      save: dispatch(http.get('name')),
    })

    const ConnectedComponent = connect(null, mapDispatchToProps)(SimpleComponent)
    render(
      <View>
        <ConnectedComponent />
      </View>
    )
  })

  afterAll(() => {
    nock.cleanAll()
  })

  test('the render function should be called only one time', () => {
    expect(renderized).toHaveBeenCalledTimes(1)
  })

  test('the render function should receive the props declared below', () => {
    expect(renderized).toBeCalledWith(
      expect.objectContaining({
        save: expect.any(Function),
        dispatching: expect.any(Boolean),
      })
    )
  })

  test('the function should return a promise', async () => {
    nock(EXAMPLE_URI)
      .get('/name/')
      .delay(500)
      .reply(200, () => ({ body: 'success' }))
    const props = renderized.mock.calls[0][0]
    const response = await props.save()
    expect(response.error).toBeFalsy()
    expect(response.data.body).toBe('success')
  })

  test('the function should be able to receive params', async () => {
    nock(EXAMPLE_URI)
      .get('/name?first=a')
      .delay(500)
      .reply(200, () => ({ body: 'success' }))
    const props = renderized.mock.calls[0][0]
    const response = await props.save({ first: 'a' })
    expect(response.error).toBeFalsy()
    expect(response.data.body).toBe('success')
  })

  test('the function should be able to map the response', async () => {
    nock(EXAMPLE_URI)
      .get('/name?first=a')
      .delay(500)
      .reply(200, () => ({ body: 'success' }))
    const props = renderized.mock.calls[0][0]
    const response = await props.save({ first: 'a' }, value => value.body)
    expect(response.error).toBeFalsy()
    expect(response.data).toBe('success')
  })
})
