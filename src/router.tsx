import * as React from 'react';
import { Router, Route } from 'dva/router';
import IndexPage from './pages/index/IndexPage';
import Login from './pages/login/Login';
import Markdown from './pages/markdown/Markdown';

function RouterConfig({ history }) {
  return (
    <Router history={history}>
      <Route path="/" component={Markdown} />
      <Route path="/md" component={Markdown} />
    </Router>
  );
}

export default RouterConfig;
