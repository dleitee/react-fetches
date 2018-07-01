import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { render, wait, cleanup } from 'react-testing-library'
import nock from 'nock'
import { createClient } from 'fetches'

import { Provider } from '../src/provider'
import { connect } from '../src/connect'

const EXAMPLE_URI = 'http://example.com/api/v1/'

const client = createClient(EXAMPLE_URI)

const View = ({ children }) => <Provider client={client}>{children}</Provider>

View.propTypes = {
  children: PropTypes.node.isRequired,
}

describe('connect with mapRequestsToProps and Errors', () => {
  afterAll(() => {
    nock.cleanAll()
  })

  afterEach(cleanup)

  test('should return errors with the named key', async () => {
    nock(EXAMPLE_URI)
      .get('/name/')
      .delay(500)
      .replyWithError('something awful happened')
    const renderized = jest.fn()
    const SimpleComponent = props => {
      renderized(props)
      const { loading } = props
      return <Fragment>{loading ? <span>Loading</span> : <span>Loaded</span>}</Fragment>
    }

    SimpleComponent.propTypes = {
      loading: PropTypes.bool.isRequired,
    }

    const mapRequestsToProps = (http, parser) => ({
      name: parser(http.get('name'), item => item.body),
    })

    const ConnectedComponent = connect(mapRequestsToProps)(SimpleComponent)
    const { getByText } = render(
      <View>
        <ConnectedComponent prop1="prop1" />
      </View>
    )
    await wait(() => getByText('Loading'))
    await wait(() => getByText('Loaded'))
    expect(renderized).toHaveBeenCalledTimes(2)
    const { prop1, errors } = renderized.mock.calls[1][0]
    expect(prop1).toBe('prop1')
    expect(errors.name).not.toBeFalsy()
  })
  test('should return errors with the returned error into the named key', async () => {
    nock(EXAMPLE_URI)
      .get('/name/')
      .delay(500)
      .reply(400, () => ({
        name: 'Name is required',
      }))
    const renderized = jest.fn()
    const SimpleComponent = props => {
      renderized(props)
      const { loading } = props
      return <Fragment>{loading ? <span>Loading</span> : <span>Loaded</span>}</Fragment>
    }

    SimpleComponent.propTypes = {
      loading: PropTypes.bool.isRequired,
    }

    const mapRequestsToProps = (http, parser) => ({
      name: parser(http.get('name'), item => item.body),
    })

    const ConnectedComponent = connect(mapRequestsToProps)(SimpleComponent)
    const { getByText } = render(
      <View>
        <ConnectedComponent prop1="prop1" />
      </View>
    )
    await wait(() => getByText('Loading'))
    await wait(() => getByText('Loaded'))
    expect(renderized).toHaveBeenCalledTimes(2)
    const { prop1, errors } = renderized.mock.calls[1][0]
    expect(prop1).toBe('prop1')
    expect(errors.name).not.toBeFalsy()
    expect(errors.name.name).toBe('Name is required')
  })
})
