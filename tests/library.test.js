import { Provider, connect } from '../src/'

describe('Library exports', () => {
  test('should export Provider and connect', () => {
    expect(Provider).toBeDefined()
    expect(connect).toBeDefined()
  })
})
