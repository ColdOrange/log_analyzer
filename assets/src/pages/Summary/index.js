// @flow

import * as React from 'react';

import ContentCard from 'components/ContentCard';
import KVCard from './components/KVCard';
import { error as modalError, fetchError } from 'utils/Modal';
import { bandwidthFormatter } from 'utils/BandwidthFormatter';

type Props = {
  match: Object,
}

type State = {
  logFile: { [string]: any },
  timeRange: { [string]: any },
  pageViews: { [string]: any },
  userViews: { [string]: any },
  bandwidth: { [string]: any },
  isLoaded: boolean,
}

class Summary extends React.Component<Props, State> {
  state = {
    logFile: {},
    timeRange: {},
    pageViews: {},
    userViews: {},
    bandwidth: {},
    isLoaded: false,
  };

  processData = (data: Object) => {
    // Log File
    const logFile = {
      'File Name': data.fileName,
      'File Size': bandwidthFormatter(data.fileSize),
    };
    // Time Range
    const timeRange = {
      'Start Time': data.startTime,
      'End Time': data.endTime,
    };
    // Page Views
    const durationMs = new Date(data.endTime.replace(' ', 'T')) - new Date(data.startTime.replace(' ', 'T')); // replace... is workaround for safari
    const durationDay = durationMs / 1000 / 3600 / 24;
    const pageViews = {
      'Total Page Views': data.pageViews,
      'Average Page Views per Day': Math.round(data.pageViews / durationDay),
      'Average Page Views per User': Math.round(data.pageViews / data.userViews),
    };
    // User Views
    const userViews = {
      'Total User Views': data.userViews,
      'Average User Views per Day': Math.round(data.userViews / durationDay),
    };
    // Bandwidth
    const bandwidth = {
      'Total Bandwidth': bandwidthFormatter(data.bandwidth),
      'Average Bandwidth per Day': bandwidthFormatter(data.bandwidth / durationDay),
      'Average Bandwidth per User': bandwidthFormatter(data.bandwidth / data.userViews),
    };
    this.setState({
      logFile: logFile,
      timeRange: timeRange,
      pageViews: pageViews,
      userViews: userViews,
      bandwidth: bandwidth,
      isLoaded: true,
    });
  };

  loadData = () => {
    const id = this.props.match.params.id;
    fetch(`/api/reports/${id}/summary`)
      .then(response => response.json())
      .then(
        data => {
          if (data.status === 'failed') { // Server API error
            const errorMessage = data.errors != null ? 'Error message: ' + data.errors.join(': ') : '';
            modalError({
              title: 'Error',
              content: <div><p>View summary failed.</p>{errorMessage}</div>,
            });
            console.log('Server API error');
          }
          else {
            this.processData(data);
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
      <ContentCard title="Summary">
        <KVCard
          title="Log File"
          loading={loading}
          data={mapToKVArray(this.state.logFile)}
        />
        <KVCard
          title="Time Range"
          loading={loading}
          data={mapToKVArray(this.state.timeRange)}
        />
        <KVCard
          title="Page Views"
          loading={loading}
          data={mapToKVArray(this.state.pageViews)}
        />
        <KVCard
          title="User Views"
          loading={loading}
          data={mapToKVArray(this.state.userViews)}
        />
        <KVCard
          title="Bandwidth"
          loading={loading}
          data={mapToKVArray(this.state.bandwidth)}
        />
      </ContentCard>
    );
  }
}

// Map an object to a {key,value} object array
const mapToKVArray = (o: Object): Object[] => {
  return o == null ? [] : Object.entries(o).map(
    ([k, v]) => ({
      key: k,
      value: v,
    })
  );
};

export default Summary;
