// @flow

import * as React from 'react';
import { BrowserRouter, Route, Link, Switch } from 'react-router-dom';
import { Layout, Menu, Icon } from 'antd';

import Sidebar from 'components/Sidebar';
import Page from 'components/Page';
import Home from 'pages/Home';
import Database from 'pages/Config/Database';
import LogFormat from 'pages/Config/LogFormat';
import Reports from 'pages/Reports';
import NotFound from 'pages/NotFound';

type State = {
  collapsed: boolean,
}

class ConfigLayout extends React.Component<{}, State> {
  state = {
    collapsed: false,
  };

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  };

  render() {
    return (
      <BrowserRouter>
        <Layout>
          <Sidebar
            collapsed={this.state.collapsed}
            defaultOpenKeys={['/config']}
            defaultSelectedKeys={['/']}
          >
            <Menu.Item key="/">
              <Link to="/">
                <Icon type="home" />
                <span className="nav-text">Home</span>
              </Link>
            </Menu.Item>
            <Menu.SubMenu key="/config" title={<span><Icon type="setting" /><span>Config</span></span>}>
              <Menu.Item key="/config/database">
                <Link to="/config/database">
                  <span className="nav-text">Database</span>
                </Link>
              </Menu.Item>
              <Menu.Item key="/config/log-format">
                <Link to="/config/log-format">
                  <span className="nav-text">Log Format</span>
                </Link>
              </Menu.Item>
            </Menu.SubMenu>
            <Menu.Item key="/reports">
              <Link to="/reports">
                <Icon type="copy" />
                <span className="nav-text">Reports</span>
              </Link>
            </Menu.Item>
          </Sidebar>
          <Page collapsed={this.state.collapsed} toggle={this.toggle}>
            <Switch>
              <Route path="/" exact component={Home} />
              <Route path="/config/database" component={Database} />
              <Route path="/config/log-format" component={LogFormat} />
              <Route path="/reports" component={Reports} />
              <Route component={NotFound} />
            </Switch>
          </Page>
        </Layout>
      </BrowserRouter>
    );
  }
}

export default ConfigLayout;
