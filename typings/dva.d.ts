import * as H from 'history';
import * as R from 'react-router';
import {FormComponentProps} from 'antd/es/form/Form';

declare global {
  namespace HistoryModule {
    export type History = H.History;
  }
  namespace ReactRouter {
    export type PlainRoute = any;
    export type RouteProps = R.RouteProps;
    export type RouterState = any;
    export type StringifyQuery = any;
    export type RedirectFunction = any;
    export type LeaveHook = any;
    export type EnterHook = any;
    export type RouteHook = any;
    export type RouterListener = any;
    export type RouterOnContext = any;
    export type RouteComponentProps<P, S> = R.RouteComponentProps<P>;
    export type HistoryBase = any;
    export type ParseQueryString = any;
  }
  export interface Action {
    type: any;
    payload?: any;
  }
  export interface ComponentDecorator<TOwnProps> {
    (component: React.ComponentClass<FormComponentProps & TOwnProps>): React.ComponentClass<FormComponentProps & TOwnProps>;
  }
  export interface ReduxProps {
    dispatch?: (action: Action) => void;
  }

}

export interface DvaAction extends Action {
  payload: any;
}