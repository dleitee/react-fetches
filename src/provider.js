import React from 'react'
import PropTypes from 'prop-types'
import { Client } from 'fetches'

import { FetchesContext } from './context'

class Provider extends React.Component {
  state = {
    data: {},
  }

  shouldComponentUpdate() {
    return false
  }

  setCache = (url, data) => {
    this.setState(prevState => ({
      data: {
        ...prevState.data,
        [url]: data,
      },
    }))
  }

  getCache = url => {
    const { data } = this.state
    return data[url]
  }

  render() {
    const { client, children } = this.props
    return (
      <FetchesContext.Provider value={{ client, setCache: this.setCache, getCache: this.getCache }}>
        {React.Children.only(children)}
      </FetchesContext.Provider>
    )
  }
}

Provider.propTypes = {
  client: PropTypes.instanceOf(Client).isRequired,
  children: PropTypes.element.isRequired,
}

export { Provider }
