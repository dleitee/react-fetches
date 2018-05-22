import * as React from 'react'
import PropTypes from 'prop-types'

import { FetchesContext } from './context'

class Provider extends React.Component {
  render() {
    return (
      <FetchesContext.Provider value={this.props.client}>
        {React.Children.only(this.props.children)}
      </FetchesContext.Provider>
    )
  }
}

Provider.propTypes = {
  client: PropTypes.object.isRequired,
  children: PropTypes.element.isRequired,
}

export { Provider }
