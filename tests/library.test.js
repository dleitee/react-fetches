// eslint-disable-next-line import/extensions, import/no-unresolved
import { Provider, connect } from '../'

describe('Library exports', () => {
  test('should export Provider and connect', () => {
    expect(Provider).toBeDefined()
    expect(connect).toBeDefined()
  })
})
