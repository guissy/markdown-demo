import * as React from 'react';
import configureStore from 'redux-mock-store';
import Login, { LoginProps } from './Login';
import {shallow, mount} from 'enzyme';

test('\u2665 Login: props', () => {
  const store = configureStore()({ login: {loading: true} });
  const wrapper = shallow(<Login {...store} />, {context: {store}});
  expect(wrapper.props().login).toEqual({loading: true});
});

test('\u2665 Login: ui', () => {
  const store = configureStore()({ login: {loading: true} });
  const wrapper = mount(<Login {...store} />, {context: {store}});
  expect(wrapper.find('div').getDOMNode()).toBeTruthy();
});
