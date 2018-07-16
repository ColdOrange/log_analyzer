// @flow

import * as React from 'react';
import { Link } from 'react-router-dom';
import { Table } from 'antd';

import ContentCard from 'components/ContentCard';
import { confirm, success, error as modalError, fetchError } from 'utils/Modal';
import styles from './index.css';

type State = {
  data: {
    id: number,
    file: string,
  }[],
  isLoaded: boolean,
}

class Reports extends React.Component<{}, State> { // TODO: multi-select to delete
  state = {
    data: [],
    isLoaded: false,
  };

  columns = [
    {
      title: 'Id',
      dataIndex: 'id',
      width: '10%',
    },
    {
      title: 'Log File',
      dataIndex: 'file',
      width: '60%',
    },
    {
      title: 'Action',
      width: '15%',
      render: (text: any, record: Object) => (<Link to={`/reports/${record.id}`} target="_blank">View</Link>)
    },
    {
      title: '',
      width: '15%',
      render: (text: any, record: Object) => (<a href="#" onClick={() => this.deleteReport(record.id)}>Delete</a>)
    }
  ];

  deleteReport = (id: number) => {
    confirm({
      title: 'Are you sure to delete this report ?',
      content: 'The generated report and related data will be removed permanently. You can\'t undo this action.',
      onOk: () => {
        fetch(`/api/reports/${id}`, {
          method: 'DELETE',
        })
          .then(response => response.json())
          .then(
            data => {
              if (data.status === 'successful') {
                success({
                  title: 'Success',
                  content: 'Delete report successfully!',
                });
                const removed = this.state.data.filter((e) => {
                  return e.id !== id;
                });
                this.setState({ data: removed });
              }
              else {
                const errorMessage = data.errors != null ? 'Error message: ' + data.errors.join(': ') : '';
                modalError({
                  title: 'Error',
                  content: <div><p>Delete report failed.</p>{errorMessage}</div>,
                });
                console.log('Server API error');
              }
            },
            error => { // Fetch error
              modalError({
                title: 'Error',
                content: 'Delete report failed, please again try later.',
              });
              console.log(error);
            }
          );
      },
    });
  };

  loadData = () => {
    fetch('/api/reports')
      .then(response => response.json())
      .then(
        data => {
          if (data != null && data.status === 'failed') { // Server API error
            const errorMessage = data.errors != null ? 'Error message: ' + data.errors.join(': ') : '';
            modalError({
              title: 'Error',
              content: <div><p>View reports failed.</p>{errorMessage}</div>,
            });
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
          fetchError();
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
      <ContentCard title="Reports">
        <Table
          dataSource={this.state.data}
          columns={this.columns}
          loading={loading}
          rowKey="id"
          className={styles.table}
        />
      </ContentCard>
    );
  }
}

export default Reports;
