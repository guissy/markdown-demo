import { DvaAction } from '../../typings/dva';
export default {
  namespace: 'alerts',
  state: {
    type: '',
    message: '',
  },
  reducers: {
    show: (state: AlertsState, { payload }: DvaAction) => {
      return { ...state, ...payload };
    },
    reset: (state: AlertsState, { payload }: DvaAction) => {
      return { ...state, ...payload };
    },
  },
};

export interface AlertsState {
  type: 'success' | 'error';
  message: string;
}
