// @flow

import * as React from 'react';
import { BrowserRouter, Route, Link, Switch } from 'react-router-dom';
import { Layout, Menu, Icon } from 'antd';

import Sidebar from 'components/Sidebar';
import Page from 'components/Page';
import Summary from 'pages/Summary';
import PageViews from 'pages/PageViews';
import UserViews from 'pages/UserViews';
import Bandwidth from 'pages/Bandwidth';
import Request from 'pages/Request';
import Response from 'pages/Response';
import UserAgent from 'pages/UserAgent';
import Referrer from 'pages/Referrer';
import NotFound from 'pages/NotFound';

type Props = {
  match: Object,
}

type State = {
  collapsed: boolean,
}

class ReportLayout extends React.Component<Props, State> {
  state = {
    collapsed: false,
  };

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  };

  render() {
    const id = this.props.match.params.id;
    return (
      <BrowserRouter>
        <Layout>
          <Sidebar
            collapsed={this.state.collapsed}
            defaultSelectedKeys={[`/reports/${id}/summary`]}
          >
            <Menu.Item key={`/reports/${id}/summary`}>
              <Link to={`/reports/${id}/summary`}>
                <Icon type="home" />
                <span className="nav-text">Summary</span>
              </Link>
            </Menu.Item>
            <Menu.Item key={`/reports/${id}/page-views`}>
              <Link to={`/reports/${id}/page-views`}>
                <Icon type="file-text" />
                <span className="nav-text">Page Views</span>
              </Link>
            </Menu.Item>
            <Menu.Item key={`/reports/${id}/user-views`}>
              <Link to={`/reports/${id}/user-views`}>
                <Icon type="user" />
                <span className="nav-text">User Views</span>
              </Link>
            </Menu.Item>
            <Menu.Item key={`/reports/${id}/bandwidth`}>
              <Link to={`/reports/${id}/bandwidth`}>
                <Icon type="cloud-download-o" />
                <span className="nav-text">Bandwidth</span>
              </Link>
            </Menu.Item>
            <Menu.Item key={`/reports/${id}/request`}>
              <Link to={`/reports/${id}/request`}>
                <Icon type="link" />
                <span className="nav-text">Request</span>
              </Link>
            </Menu.Item>
            <Menu.Item key={`/reports/${id}/response`}>
              <Link to={`/reports/${id}/response`}>
                <Icon type="export" />
                <span className="nav-text">Response</span>
              </Link>
            </Menu.Item>
            <Menu.Item key={`/reports/${id}/user-agent`}>
              <Link to={`/reports/${id}/user-agent`}>
                <Icon type="compass" />
                <span className="nav-text">User Agent</span>
              </Link>
            </Menu.Item>
            <Menu.Item key={`/reports/${id}/referrer`}>
              <Link to={`/reports/${id}/referrer`}>
                <Icon type="swap" />
                <span className="nav-text">Referrer</span>
              </Link>
            </Menu.Item>
          </Sidebar>
          <Page collapsed={this.state.collapsed} toggle={this.toggle}>
            <Switch>
              <Route path="/reports/:id" exact component={Summary} />
              <Route path="/reports/:id/summary" component={Summary} />
              <Route path="/reports/:id/page-views" component={PageViews} />
              <Route path="/reports/:id/user-views" component={UserViews} />
              <Route path="/reports/:id/bandwidth" component={Bandwidth} />
              <Route path="/reports/:id/request" component={Request} />
              <Route path="/reports/:id/response" component={Response} />
              <Route path="/reports/:id/user-agent" component={UserAgent} />
              <Route path="/reports/:id/referrer" component={Referrer} />
              <Route component={NotFound} />
            </Switch>
          </Page>
        </Layout>
      </BrowserRouter>
    );
  }
}

export default ReportLayout;
