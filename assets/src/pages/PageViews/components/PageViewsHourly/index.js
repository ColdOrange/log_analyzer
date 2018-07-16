// @flow

import * as React from 'react';
import { Select } from 'antd';

import ContentCard from 'components/ContentCard';
import CustomLineChart from 'components/CustomLineChart';
import styles from './index.css';

type Props = {
  match: Object,
  errorHandler: () => void,
}

type State = {
  days: string[],
  data: {
    time: string,
    pv: number,
  }[],
  isLoaded: boolean,
}

class PageViewsHourly extends React.Component<Props, State> {
  state = {
    days: [],
    data: [],
    isLoaded: false,
  };

  loadData = (date: string) => {
    const id = this.props.match.params.id;
    fetch(`/api/reports/${id}/page-views/hourly?date=${date}`)
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
    fetch(`/api/reports/${id}/page-views/daily`)  // TODO: only fetch once?
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
        lineKey="pv"
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
            lineKey="pv"
            color="#8884d8"
          />
        </div>
      </ContentCard>
    );
  }
}

export default PageViewsHourly;
