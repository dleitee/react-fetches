# react-fetches

[![Greenkeeper badge](https://badges.greenkeeper.io/dleitee/react-fetches.svg?token=02c8adf78705fea22a73f5fb6ebb60e58cb82cd203254efc1dc5f141eb9bd461&ts=1528216010503)](https://greenkeeper.io/)
[![codecov](https://codecov.io/gh/dleitee/react-fetches/branch/master/graph/badge.svg?token=HGzOPgq5AL)](https://codecov.io/gh/dleitee/react-fetches)
[![CircleCI](https://circleci.com/gh/dleitee/react-fetches/tree/master.svg?style=svg&circle-token=317c7e90c40a084e9de799bfa3fd963a85c1acb7)](https://circleci.com/gh/dleitee/react-fetches/tree/master)

React Fetches is a simple and efficient way to make requests into your REST API's.

## Table of Contents

- [Motivation](#motivation)
- [Install](#install)
- [Basic Example](#basic-example)
- [API Reference](#api-reference)
   - [connect](#connectmaprequesttoprops-mapdispatchtopropscomponent)
   - [mapRequestToProps](#maprequesttoprops--http-map--object)
   - [mapDispatchToProps](#mapdispatchtoprops--http-dispatch--object)
- [Inspirations](#inspirations)
- [Support](#support)
- [How to Contribute](#how-to-contribute)
- [License](#license)

## Motivation

Me and my friends were tired to use a lot of boilerplate code to do our requests.

We used to build our projects with a set of libraries as listed below:

- [Redux](https://github.com/reduxjs/redux)
- [React Redux](https://github.com/reduxjs/react-redux)
- [ImmutableJS](https://github.com/facebook/immutable-js)
- [Normalizr](https://github.com/paularmstrong/normalizr)
- [Reselect](https://github.com/reduxjs/reselect)
- [redux-promise-middleware](https://github.com/pburtchaell/redux-promise-middleware)
- [redux-thunk](https://github.com/reduxjs/redux-thunk)

We needed to make a request, normalize the response, put it into a reducer, listen to the reducer, unnormalize the data came from reducer, show it on the view.

OMG!!!

So I created the `react-fetches`.

**PS: Thank you for all of these libraries that helped us until now to build awesome projects.**

## Install

```sh
npm install --save fetches react-fetches
```

## Basic Example

**app.js**
```es6
import React from 'react'
import { render } from 'react-dom'
import { createClient } from 'fetches'
import { Provider } from 'react-fetches'

import View from './view'

const client = createClient('https://your-api.com/api/v1/')

const Root = () => (
  <Provider client={client}>
    <View />
  </Provider>
)

render(<Root />, document.getElementById('root'))
```

**view.js**
```es6
import React, { Component, Fragment } from 'react'
import { connect } from 'react-fetches'

const mapRequestsToProps = (http, map) => ({
  userID: map(http.get('user'), (user) => user.id),
  groups: http.get('groups'),
})

const mapDispatchToProps = (http, dispatch) => ({
  addGroup: dispatch(http.post('group'))
})

class View extends Component {

  constructor(props) {
    super(props)
    this.state = {
      addedGroups: [],
    }
  }
  
  addGroup() {
    this.props.addGroup({ name: 'Name of Group' }).then(({data}) => {
      this.setState((prevState) => ({
        addedGroups: [...prevState.addedGroupd, data]
      }))
    })
  }

  render() {
    if (this.props.loading) {
      return 'Loading...'
    }
    
    const groups = [...this.props.groups, ...this.state.addedGroups]
    
    return (
      <Fragment>
        <ul>
          {groups.map((group) => (
            <li key={group.id}>{group.name}</li>
           ))}
        </ul>
        <button onClick={this.addGroup}>Add group</button>
      </Fragment>
    )
  }

}

export default connect(mapRequestsToProps, mapDispatchToProps)(View)
```

## API Reference

### connect(mapRequestToProps, mapDispatchToProps)(Component)

Adds some props, came from mapRequestToProps and mapDispatchToProps, into your component.

 - **mapRequestToProps** props
    - **loading** - Boolean - *default: false* - identifies if a request is performing.
    - **errors** - Object - *default: undefined* - identifies if occurred some error in requests.
    - **responses** - Object - *default: undefined* - Response object from each one request.
    - **\<request-name\>** - Object - *default: undefined* - the response body of request.
    
      **Example:**
```es6
const props = {
  loading: false,
  errors: {
    exampleRequest: {
      name: 'name is not defined',
    },
  }
  responses: {
    exampleRequest: Response,
  },
  exampleRequest: null,
}
```

- **mapDispatchToProps** props
    - **\<dispatch-name\>** - Function - the function to make your request, this function returns for you a promise.
      - This function can be called with two parameters **data** and **map**
    
      **Example:**
```es6
const props = {
  exampleFunction: Function => Promise,
}

const data = { name: 'param name' }
exampleFunction(data, (response) => response.id)
```

### mapRequestToProps = (http, map) => Object

Should be a function that receive two arguments **http** and **map**, and should return an object with the props.

```es6
const mapRequestsToProps = (http, map) => ({
  groups: http.get('groups'),
  userID: map(http.get('user'), (user) => user.id),
})
```

 - **http** - an object with the HTTP methods as a function.
     - **get(uri, [params, [options]])**
       - **uri** - String, Array\<String\> - the complement of your main URI. 
       - **params** - Object - *optional* - URL query params.
       - **options** - Object - *optional* - The same custom settings accepted by [fetch](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Syntax)

     - **post(uri, [params, [options]])**
     - **put(uri, [params, [options]])**
     - **patch(uri, [params, [options]])**
     - **delete(uri, [params, [options]])**
       - **uri** - String, Array\<String\> - the complement of your main URI. 
       - **data** - Object - *optional* - The body of request.
       - **options** - Object - *optional* - The same custom settings accepted by [fetch](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Syntax)

  - **map(request, (response) => mappedObject)** - a function that permits you to map your responses as well as you want.


### mapDispatchToProps = (http, dispatch) => Object

Should be a function that receive two arguments **http** and **dispatch**, and should return an object with the props. 

**NOTE:** Here the **http** is a bit different of the **mapRequestToProps http**.

```es6
const mapDispatchToProps = (http, dispatch) => ({
  addGroup: dispatch(http.post('group'))
})
```

 - **http** - an object with the HTTP methods as a function.
     - **get(uri)**
     - **post(uri)**
     - **put(uri)**
     - **patch(uri)**
     - **delete(uri)**
       - **uri** - String, Array\<String\> - the complement of your main URI. 
       
  - **dispatch(request, config)** - in mapDispatchToProps, each item always must call the dispatch function.
     - **request** - the **http** request
     - **config** - Object - *optional* - The same custom settings accepted by [fetch](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Syntax)
     
**NOTE:** The function returned as a prop can receive two parameters **data** and **map**
 - **data** - Object - *optional* - The query params for the get method and body of the request for the others.
 - **map = (response) => mappedObject** - a function that permits you to map your responses as well as you want.

## Inspirations

- [React Apollo](https://github.com/apollographql/react-apollo) - to make the responses and dispatches as props.
- [React Redux](https://github.com/reduxjs/react-redux) - to name our functions.


## Support

React 16+

Fetches is based on [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API), which the most of modern browsers already are compatible, but if you need to be compatible with an older browser, you may use this [polyfill](https://github.com/github/fetch)

## How to Contribute

1. Fork it!
1. Create your feature branch: `git checkout -b my-new-feature`
1. Commit your changes: `git commit -m 'Add some feature'`
1. Push to the branch: `git push origin my-new-feature`
1. Submit a pull request :)

## License

MIT License

Copyright (c) 2018 Daniel Leite de Oliveira

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

