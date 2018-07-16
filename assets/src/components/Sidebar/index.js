// @flow

import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { Layout, Menu } from 'antd';

import Logo from './components/Logo/index';
import styles from './index.css';

type Props = {
  collapsed: boolean,
  location: Object,
  defaultOpenKeys?: string[],
  defaultSelectedKeys?: string[],
  children?: React.Node,
}

class Sidebar extends React.Component<Props> {
  render() {
    return (
      <Layout.Sider
        trigger={null}
        collapsible
        collapsed={this.props.collapsed}
        className={styles.sider}
      >
        <Logo collapsed={this.props.collapsed} />
        <Menu
          defaultOpenKeys={this.props.defaultOpenKeys}
          defaultSelectedKeys={this.props.defaultSelectedKeys}
          selectedKeys={[this.props.location.pathname]}
          className={styles.menu}
          theme="light"
          mode="inline"
        >
          {
            this.props.children
          }
        </Menu>
      </Layout.Sider>
    );
  }
}

export default withRouter(Sidebar);
