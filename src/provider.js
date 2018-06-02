import * as React from 'react'
import PropTypes from 'prop-types'
import { Client } from 'fetches'

import { FetchesContext } from './context'

const Provider = props => (
  <FetchesContext.Provider value={props.client}>
    {React.Children.only(props.children)}
  </FetchesContext.Provider>
)

Provider.propTypes = {
  client: PropTypes.instanceOf(Client).isRequired,
  children: PropTypes.element.isRequired,
}

export { Provider }
