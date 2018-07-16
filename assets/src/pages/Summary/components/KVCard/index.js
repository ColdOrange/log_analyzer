// @flow

import * as React from 'react';
import { Card, Spin } from 'antd';

import KVTable from '../KVTable';

type Props = {
  title: string,
  loading: boolean,
  data: {
    key: string,
    value: any,
  }[],
}

class KVCard extends React.Component<Props> {
  render() {
    return (
      <Card
        title={this.props.title}
        type="inner"
        bodyStyle={{padding: 0}}
        bordered={false}
      >
        <Spin spinning={this.props.loading}>
          {
            this.props.loading ? <KVTable data={[]} /> : <KVTable data={this.props.data} />
          }
        </Spin>
      </Card>
    );
  }
}

export default KVCard;
