// @flow

import * as React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import 'antd/dist/antd.css';

import HomeLayout from './layouts/HomeLayout';
import ReportLayout from './layouts/ReportLayout';
import NotFound from './pages/NotFound';

class App extends React.Component<{}> {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route path="/" exact component={HomeLayout} />
          <Route path="/config" component={HomeLayout} />
          <Route path="/reports" exact component={HomeLayout} />
          <Route path="/reports/:id" component={ReportLayout} />
          <Route component={NotFound} />
        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;
