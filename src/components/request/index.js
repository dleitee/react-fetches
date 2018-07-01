import React from 'react'
import PropTypes from 'prop-types'

import { FetchesContext } from '../../context'

import RequestWrapper from './wrapper'

const Request = props => {
  const { skip, children } = props
  if (skip) {
    return children({ data: null, error: null, loading: false })
  }
  return (
    <FetchesContext.Consumer>
      {client => <RequestWrapper client={client} {...props} />}
    </FetchesContext.Consumer>
  )
}

Request.propTypes = {
  children: PropTypes.func.isRequired,
  uri: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  method: PropTypes.oneOf(['get', 'post', 'patch', 'delete', 'put']),
  multipleMethod: PropTypes.oneOf(['all', 'race']),
  skip: PropTypes.bool,
  config: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  delay: PropTypes.number,
}

Request.defaultProps = {
  uri: '',
  method: 'get',
  multipleMethod: 'all',
  skip: false,
  config: {},
  data: {},
  delay: 0,
}
export default Request
