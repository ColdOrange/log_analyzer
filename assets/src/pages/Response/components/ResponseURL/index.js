// @flow

import * as React from 'react';
import { Table } from 'antd';

import ContentCard from 'components/ContentCard';

const columns = [
  {
    title: 'URL',
    dataIndex: 'url',
    width: '55%',
  },
  {
    title: 'PV',
    dataIndex: 'pv',
    width: '15%',
    sorter: (a, b) => a.pv - b.pv,
  },
  {
    title: 'Response Time',
    children: [
      {
        title: 'Avg',
        dataIndex: 'avg',
        width: '15%',
        render: value => value + ' ms',
        sorter: (a, b) => a.avg - b.avg,
      },
      {
        title: 'Std Dev',
        dataIndex: 'stdDev',
        width: '15%',
        render: value => value + ' ms',
        sorter: (a, b) => a.stdDev - b.stdDev,
      }
    ]
  }
];

type Props = {
  match: Object,
  errorHandler: () => void,
}

type State = {
  data: {
    url: string,
    pv: number,
    uv: number,
    bandwidth: number,
  }[],
  isLoaded: boolean,
}

class ResponseURL extends React.Component<Props, State> {
  state = {
    data: [],
    isLoaded: false,
  };

  loadData = () => {
    const id = this.props.match.params.id;
    fetch(`/api/reports/${id}/response-url`)
      .then(response => response.json())
      .then(
        data => {
          if (data.status === 'failed') { // Server API error
            this.props.errorHandler();
            console.log('Server API error');
          }
          else {
            this.setState({
              data: data,
              isLoaded: true,
            });
          }
        },
        error => { // Fetch error
          this.props.errorHandler();
          console.log(error);
        }
      );
  };

  componentDidMount() {
    this.loadData();
  }

  render() {
    const loading = !this.state.isLoaded;

    return (
      <ContentCard title="Response URL">
        <Table
          dataSource={this.state.data}
          columns={columns}
          loading={loading}
          bordered={true}
          rowKey="url"
        />
      </ContentCard>
    );
  }
}

export default ResponseURL;
