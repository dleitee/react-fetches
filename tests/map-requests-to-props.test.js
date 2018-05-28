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
  beforeAll(() => {})
  afterAll(() => {
    nock.cleanAll()
  })
  test('must add a prop called loading with the request status', async () => {
    nock(EXAMPLE_URI)
      .get('/name/')
      .delay(1000)
      .reply(200, () => ({ body: 'success' }))

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
})
