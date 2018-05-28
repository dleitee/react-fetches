import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { render, wait } from 'react-testing-library'
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

describe('connect with mapRequestsToProps', () => {
  beforeEach(() => {
    nock(EXAMPLE_URI)
      .get('/name/')
      .delay(1000)
      .reply(200, () => ({ body: 'success' }))
  })
  afterAll(() => {
    nock.cleanAll()
  })
  test('must add a prop called loading with the request status', async () => {
    const SimpleComponent = props => (
      <Fragment>{props.loading ? <span>Loading</span> : <span>Loaded</span>}</Fragment>
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
  test('should return a map with { body: "success" }', async () => {
    const SimpleComponent = props => {
      if (!props.loading) {
        expect(props.name).toEqual({ body: 'success' })
      }

      return <Fragment>{props.loading ? <span>Loading</span> : <span>Loaded</span>}</Fragment>
    }

    SimpleComponent.propTypes = {
      loading: PropTypes.bool.isRequired,
      name: PropTypes.shape({
        body: PropTypes.string,
      }),
    }

    SimpleComponent.defaultProps = {
      name: {},
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
})
