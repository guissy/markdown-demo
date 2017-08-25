import { message } from 'antd';
import { parse } from 'qs';
import { loginAjax } from './Login.service';

export default {
  namespace: 'login',
  state: {
    loading: false,
  },

  effects: {
    *login({ payload }, { call, put }) {
      yield put({ type: 'changeLoading', payload: { loading: true } });
      const result = yield call(loginAjax, { ...payload });
      if (result && result.state === 0) {
        yield put({ type: 'querySuccess', payload: { loading: false } });
      } else {
        yield put({ type: 'queryError', payload: { loading: false } });
      }
    },
  },

  reducers: {
    changeLoading(state, action) {
      return { ...state, ...action.payload };
    },
    querySuccess(state, action) {
      return { ...state, ...action.payload };
    },
  },
};

export interface LoginState {
  loading: boolean;
}
