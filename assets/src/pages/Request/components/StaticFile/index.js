// @flow

import * as React from 'react';
import { Table } from 'antd';

import ContentCard from 'components/ContentCard';
import { bandwidthFormatter } from 'utils/BandwidthFormatter';

const columns = [
  {
    title: 'File',
    dataIndex: 'file',
    width: '55%',
  },
  {
    title: 'Count',
    dataIndex: 'count',
    width: '15%',
    sorter: (a, b) => a.count - b.count,
  },
  {
    title: 'Size',
    dataIndex: 'size',
    width: '15%',
    render: value => bandwidthFormatter(value),
    sorter: (a, b) => a.size - b.size,
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
    file: string,
    count: number,
    size: number,
    bandwidth: number,
  }[],
  isLoaded: boolean,
}

class StaticFile extends React.Component<Props, State> {
  state = {
    data: [],
    isLoaded: false,
  };

  loadData = () => {
    const id = this.props.match.params.id;
    fetch(`/api/reports/${id}/static-file`)
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
      <ContentCard title="Static File">
        <Table
          dataSource={this.state.data}
          columns={columns}
          loading={loading}
          rowKey="file"
        />
      </ContentCard>
    );
  }
}

export default StaticFile;
