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

describe('connect with mapRequestsToProps', () => {
  beforeEach(() => {
    nock(EXAMPLE_URI)
      .get('/name/')
      .delay(500)
      .reply(200, () => ({ body: 'success' }))
  })
  afterEach(cleanup)
  afterAll(() => {
    nock.cleanAll()
  })
  test('must add a prop called loading with the request status', async () => {
    const SimpleComponent = ({ loading }) => (
      <Fragment>{loading ? <span>Loading</span> : <span>Loaded</span>}</Fragment>
    )

    SimpleComponent.propTypes = {
      loading: PropTypes.bool.isRequired,
    }

    const mapRequestsToProps = http => ({
      name: http.get('name'),
    })

    const ConnectedComponent = connect(mapRequestsToProps)(SimpleComponent)
    const { getByText } = render(
      <View>
        <ConnectedComponent />
      </View>
    )
    await wait(() => getByText('Loading'))
    await wait(() => getByText('Loaded'))
  })
  test('should return a map with { name, errors, responses}', async () => {
    const renderized = jest.fn()
    const SimpleComponent = props => {
      renderized(props)
      const { loading } = props
      return <Fragment>{loading ? <span>Loading</span> : <span>Loaded</span>}</Fragment>
    }

    SimpleComponent.propTypes = {
      loading: PropTypes.bool.isRequired,
    }

    SimpleComponent.defaultProps = {
      name: {},
      errors: {},
      responses: {},
    }

    const mapRequestsToProps = http => ({
      name: http.get('name'),
    })

    const ConnectedComponent = connect(mapRequestsToProps)(SimpleComponent)
    const { getByText } = render(
      <View>
        <ConnectedComponent />
      </View>
    )
    await wait(() => getByText('Loading'))
    await wait(() => getByText('Loaded'))

    expect(renderized).toHaveBeenCalledTimes(2)
    expect(renderized).toBeCalledWith(
      expect.objectContaining({
        loading: expect.any(Boolean),
        name: expect.any(Object),
        errors: expect.any(Object),
        responses: expect.any(Object),
      })
    )
  })
  test('should return the parsed string', async () => {
    const SimpleComponent = ({ loading, name }) => {
      if (!loading) {
        expect(name).toBe('success')
      }

      return <Fragment>{loading ? <span>Loading</span> : <span>Loaded</span>}</Fragment>
    }

    SimpleComponent.propTypes = {
      loading: PropTypes.bool.isRequired,
      name: PropTypes.string,
    }

    SimpleComponent.defaultProps = {
      name: undefined,
    }

    const mapRequestsToProps = (http, parser) => ({
      name: parser(http.get('name'), item => item.body),
    })

    const ConnectedComponent = connect(mapRequestsToProps)(SimpleComponent)
    const { getByText } = render(
      <View>
        <ConnectedComponent />
      </View>
    )
    await wait(() => getByText('Loading'))
    await wait(() => getByText('Loaded'))
  })
  test('should call the render function only twice', async () => {
    const renderized = jest.fn()
    const SimpleComponent = ({ loading }) => {
      renderized()
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
        <ConnectedComponent />
      </View>
    )
    await wait(() => getByText('Loading'))
    await wait(() => getByText('Loaded'))
    expect(renderized).toHaveBeenCalledTimes(2)
  })
  test('should be able to return two or more props', async () => {
    nock(EXAMPLE_URI)
      .get('/first-name/')
      .delay(500)
      .reply(200, () => ({ body: 'success' }))
    nock(EXAMPLE_URI)
      .get('/last-name/')
      .delay(500)
      .reply(200, () => ({ body: 'success' }))
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
      lastName: parser(http.get('last-name'), item => item.body),
      firstName: parser(http.get('first-name'), item => item.body),
    })

    const ConnectedComponent = connect(mapRequestsToProps)(SimpleComponent)
    const { getByText } = render(
      <View>
        <ConnectedComponent />
      </View>
    )
    await wait(() => getByText('Loading'))
    await wait(() => getByText('Loaded'))
    expect(renderized).toHaveBeenCalledTimes(2)
    const { name, lastName, firstName } = renderized.mock.calls[1][0]
    expect(name).toBe('success')
    expect(lastName).toBe('success')
    expect(firstName).toBe('success')
  })
  test('should maintain the component props', async () => {
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
    const { prop1, name } = renderized.mock.calls[1][0]
    expect(prop1).toBe('prop1')
    expect(name).toBe('success')
  })
})
