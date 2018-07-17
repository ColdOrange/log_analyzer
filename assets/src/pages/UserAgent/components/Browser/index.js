// @flow

import * as React from 'react';
import { Table } from 'antd';

import ContentCard from 'components/ContentCard';

const columns = [
  {
    title: 'Browser',
    dataIndex: 'browser',
    width: '60%',
    filters: [
      {
        text: 'Human',
        value: 'Human',
      },
      {
        text: 'Bot',
        value: 'Bot',
      },
    ],
    onFilter: (value, record) => {
      switch (value) {
      case 'Human':
        return !record.browser.match(/bot/i) && !record.browser.match(/spider/i);
      case 'Bot':
        return record.browser.match(/bot/i) || record.browser.match(/spider/i);
      }
    },
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
    browser: string,
    pv: number,
    uv: number,
  }[],
  isLoaded: boolean,
}

class Browser extends React.Component<Props, State> {
  state = {
    data: [],
    isLoaded: false,
  };

  loadData = () => {
    const id = this.props.match.params.id;
    fetch(`/api/reports/${id}/user-agent/browser`)
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
      <ContentCard title="Browser">
        <Table
          dataSource={this.state.data}
          columns={columns}
          loading={loading}
          pagination={false}
          rowKey="browser"
        />
      </ContentCard>
    );
  }
}

export default Browser;
