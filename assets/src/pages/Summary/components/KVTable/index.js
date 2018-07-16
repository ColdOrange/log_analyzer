// @flow

import * as React from 'react';
import { Table } from 'antd';

const columns = [
  {
    title: 'key',
    dataIndex: 'key',
    width: '50%',
  },
  {
    title: 'value',
    dataIndex: 'value',
    width: '50%',
  },
];

type Props = {
  data: {
    key: string,
    value: any,
  }[],
}

class KVTable extends React.Component<Props> {
  render() {
    return (
      <Table
        columns={columns}
        rowKey="key"
        dataSource={this.props.data}
        pagination={false}
        showHeader={false}
      />
    );
  }
}

export default KVTable;
