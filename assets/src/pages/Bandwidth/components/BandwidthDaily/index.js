// @flow

import * as React from 'react';

import ContentCard from 'components/ContentCard';
import CustomLineChart from 'components/CustomLineChart';
import { bandwidthFormatter } from 'utils/BandwidthFormatter';
import styles from './index.css';

type Props = {
  match: Object,
  errorHandler: () => void,
}

type State = {
  data: {
    time: string,
    bandwidth: number,
  }[],
  isLoaded: boolean,
}

class BandwidthDaily extends React.Component<Props, State> {
  state = {
    data: [],
    isLoaded: false,
  };

  loadData = () => {
    const id = this.props.match.params.id;
    fetch(`/api/reports/${id}/bandwidth/daily`)
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
    const placeholder = // placeholder for rendering while loading
      <CustomLineChart
        data={[]}
        xAxisKey="time"
        lineKey="bandwidth"
      />;

    return (
      <ContentCard
        title="Daily"
        loading={loading}
        placeholder={placeholder}
      >
        <div className={styles.container}>
          <CustomLineChart
            data={this.state.data}
            xAxisKey="time"
            lineKey="bandwidth"
            color="#77aaff"
            yAxisFormatter={(value: number) => bandwidthFormatter(value, 0)}
            tooltipFormatter={(value: number) => bandwidthFormatter(value)}
          />
        </div>
      </ContentCard>
    );
  }
}

export default BandwidthDaily;
