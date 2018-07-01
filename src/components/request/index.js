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
  uri: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]), // eslint-disable-line react/no-unused-prop-types
  method: PropTypes.oneOf(['get', 'post', 'patch', 'delete', 'put']), // eslint-disable-line react/no-unused-prop-types
  multipleMethod: PropTypes.oneOf(['all', 'race']), // eslint-disable-line react/no-unused-prop-types
  skip: PropTypes.bool,
}

Request.defaultProps = {
  uri: '',
  method: 'get',
  multipleMethod: 'all',
  skip: false,
}
export default Request
