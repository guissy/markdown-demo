import dva from 'dva';
import { browserHistory } from 'dva/router';
import './index.less';
import alertsModel from './pages/alerts.model';
import langModel from './pages/lang.model';
import router from './router';

// 1. Initialize
const app = dva({ history: browserHistory });

// 2. Plugins
// app.use({});

// 3. Model
app.model(langModel);
app.model(alertsModel);

// 4. Router
app.router(router);

// 5. Start
app.start('#root');
