import React from 'react'
import PropTypes from 'prop-types'

import { FetchesContext } from '../../context'

import RequestWrapper from './wrapper'

const Request = props => (
  <FetchesContext.Consumer>
    {client => <RequestWrapper client={client} {...props} />}
  </FetchesContext.Consumer>
)

Request.propTypes = {
  children: PropTypes.func.isRequired,
  uri: PropTypes.string.isRequired,
}
export default Request
