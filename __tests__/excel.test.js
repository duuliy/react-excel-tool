import React from 'react'
import { shallow } from 'enzyme'
import Excel from '../src/index'
import PropTypes from 'prop-types'

const options = {
  childContextTypes: { store: PropTypes.object.isRequired }
}
describe(' <Excel />', () => {
  let wrapper
  const getData = data => {
    console.log(data)
  }
  beforeEach(() => {
    wrapper = shallow(<Excel initCol={15} initRow={26} width={800} height={600} getData={getData} />)
  })
  it('snapshot', () => {
    const app = wrapper.debug()
    expect(app).toMatchSnapshot()
  })
  it('normal rendering', () => {
    expect(wrapper.find('.excel-tool')).toHaveLength(1)
  })
})
