// @flow

import * as React from 'react';
import { Layout, Icon } from 'antd';

import styles from './index.css';

const { Header, Content, Footer } = Layout;

type Props = {
  collapsed: boolean,
  toggle: Function,
  children?: React.Node,
}

class Page extends React.Component<Props> {
  render() {
    return (
      <Layout className={styles.page}>
        <Header className={styles.header}>
          <Icon
            className={styles.trigger}
            type={this.props.collapsed ? 'menu-unfold' : 'menu-fold'}
            onClick={this.props.toggle}
          />
        </Header>
        <Content className={styles.content}>
          {
            this.props.children
          }
        </Content>
        <Footer className={styles.footer}>Log Analyzer © 2018 Wenju Xu</Footer>
      </Layout>
    );
  }
}

export default Page;
