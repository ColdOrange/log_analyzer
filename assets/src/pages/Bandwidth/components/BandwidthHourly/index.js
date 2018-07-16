// @flow

import * as React from 'react';
import { Select } from 'antd';

import ContentCard from 'components/ContentCard';
import CustomLineChart from 'components/CustomLineChart';
import { bandwidthFormatter } from 'utils/BandwidthFormatter';
import styles from './index.css';

type Props = {
  match: Object,
  errorHandler: () => void,
}

type State = {
  days: string[],
  data: {
    time: string,
    bandwidth: number,
  }[],
  isLoaded: boolean,
}

class BandwidthHourly extends React.Component<Props, State> {
  state = {
    days: [],
    data: [],
    isLoaded: false,
  };

  loadData = (date: string) => {
    const id = this.props.match.params.id;
    fetch(`/api/reports/${id}/bandwidth/hourly?date=${date}`)
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
    const id = this.props.match.params.id;
    fetch(`/api/reports/${id}/bandwidth/daily`) // TODO: only fetch once?
      .then(response => response.json())
      .then(
        data => {
          if (data.status === 'failed') { // Server API error
            this.props.errorHandler();
            console.log('Server API error');
          }
          else {
            this.setState({
              days: data.map(item => item.time)
            });
            this.loadData(this.state.days[0]);
          }
        },
        error => { // Fetch error
          this.props.errorHandler();
          console.log(error);
        }
      );
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
        title="Hourly"
        loading={loading}
        placeholder={placeholder}
      >
        <Select
          defaultValue={this.state.days[0]}
          className={styles.select}
          onChange={this.loadData}
        >
          {
            this.state.days.map(date =>
              <Select.Option key={date} value={date}>
                {date}
              </Select.Option>
            )
          }
        </Select>
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

export default BandwidthHourly;
