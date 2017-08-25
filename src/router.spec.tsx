import {browserHistory} from 'dva/router';
import {shallow} from 'enzyme';
import * as React from 'react';
import IndexPage from './pages/index/IndexPage';
import Router from './router';

test('router: / => IndexPage', () => {
  const wrapper = shallow(<Router history={browserHistory} />);
  const route = wrapper;
  expect(route.find({component: IndexPage})).toEqual(route.find({path: '/'}));
});
