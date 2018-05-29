import React, { Fragment } from 'react'
import PropTypes from 'prop-types'

import { connect } from '../src/connect'

describe('Connect function', () => {
  test('should return only ConnectedComponent', () => {
    const SimpleComponent = props => (
      <Fragment>{props.loading ? <span>Loading</span> : <span>Loaded</span>}</Fragment>
    )

    SimpleComponent.propTypes = {
      loading: PropTypes.bool.isRequired,
    }

    const ConnectedComponent = connect()(SimpleComponent)
    expect(ConnectedComponent).toBe(SimpleComponent)
  })
})
