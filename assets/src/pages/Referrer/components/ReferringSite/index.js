// @flow

import * as React from 'react';
import { Table } from 'antd';

import ContentCard from 'components/ContentCard';

const columns = [
  {
    title: 'Site',
    dataIndex: 'site',
    width: '60%',
  },
  {
    title: 'Page Views',
    dataIndex: 'pv',
    width: '20%',
    sorter: (a, b) => a.pv - b.pv,
  },
  {
    title: 'User Views',
    dataIndex: 'uv',
    width: '20%',
    sorter: (a, b) => a.uv - b.uv,
  }
];

type Props = {
  match: Object,
  errorHandler: () => void,
}

type State = {
  data: {
    site: string,
    pv: number,
    uv: number,
  }[],
  isLoaded: boolean,
}

class ReferringSite extends React.Component<Props, State> {
  state = {
    data: [],
    isLoaded: false,
  };

  loadData = () => {
    const id = this.props.match.params.id;
    fetch(`/api/reports/${id}/referrer/site`)
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
      <ContentCard title="Referring Site">
        <Table
          dataSource={this.state.data}
          columns={columns}
          loading={loading}
          rowKey="site"
        />
      </ContentCard>
    );
  }
}

export default ReferringSite;
