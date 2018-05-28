import { connect } from '../src'

const SimpleComponent = props => <div>{props.name}</div>

SimpleComponent.defaultProps = {
  name: 'test',
}

describe('Connect function', () => {
  test('should return only ConnectedComponent', () => {})
})
