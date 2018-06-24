import React from 'react'
import { render, cleanup } from 'react-testing-library'

import Request from '../../../src/components/request'

describe('Request Component: Children as a Function', () => {
  afterEach(cleanup)
  test(`Requests' children should be a function`, () => {
    const renderized = jest.fn().mockReturnValue(null)
    render(<Request>{renderized}</Request>)
    expect(renderized).toBeCalled()
  })
  test(`Requests' children must receive these listed params`, () => {
    const params = ['loading', 'error', 'data']
    const renderized = jest.fn().mockReturnValue(null)
    render(<Request>{renderized}</Request>)
    expect(Object.keys(renderized.mock.calls[0][0])).toEqual(params)
  })
})
