// @flow

import * as React from 'react';
import { Card, Spin } from 'antd';

import styles from './index.css';

type Props = {
  title: string | React.Node,
  loading?: boolean,
  placeholder?: React.Node, // TODO: better way to render loading indicator?
  children?: React.Node,
}

class ContentCard extends React.Component<Props> {
  render() {
    const title = typeof this.props.title === 'string' ? (
      <h4 className={styles.title}>{this.props.title}</h4>
    ) : (
      this.props.title
    );
    const { loading = false } = this.props;
    return (
      <Card
        title={title}
        className={styles.card}
        bordered={false}
      >
        <Spin spinning={loading}>
          {
            loading ? this.props.placeholder : this.props.children
          }
        </Spin>
      </Card>
    );
  }
}

export default ContentCard;
