// @flow

import * as React from 'react';
import { Table } from 'antd';

import ContentCard from 'components/ContentCard';
import { bandwidthFormatter } from 'utils/BandwidthFormatter';

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
    title: 'UV',
    dataIndex: 'uv',
    width: '15%',
    sorter: (a, b) => a.uv - b.uv,
  },
  {
    title: 'Bandwidth',
    dataIndex: 'bandwidth',
    width: '15%',
    render: value => bandwidthFormatter(value),
    sorter: (a, b) => a.bandwidth - b.bandwidth,
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

class RequestURL extends React.Component<Props, State> {
  state = {
    data: [],
    isLoaded: false,
  };

  loadData = () => {
    const id = this.props.match.params.id;
    fetch(`/api/reports/${id}/request-url`)
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
      <ContentCard title="Request URL">
        <Table
          dataSource={this.state.data}
          columns={columns}
          loading={loading}
          rowKey="url"
        />
      </ContentCard>
    );
  }
}

export default RequestURL;
