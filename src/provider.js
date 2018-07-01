import React from 'react'
import PropTypes from 'prop-types'
import { Client } from 'fetches'

import { FetchesContext } from './context'

const Provider = ({ client, children }) => (
  <FetchesContext.Provider value={client}>{React.Children.only(children)}</FetchesContext.Provider>
)

Provider.propTypes = {
  client: PropTypes.instanceOf(Client).isRequired,
  children: PropTypes.element.isRequired,
}

export { Provider }
