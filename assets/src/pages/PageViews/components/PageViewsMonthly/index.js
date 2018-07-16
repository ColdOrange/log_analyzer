// @flow

import * as React from 'react';

import ContentCard from 'components/ContentCard';
import CustomLineChart from 'components/CustomLineChart';
import styles from './index.css';

type Props = {
  match: Object,
  errorHandler: () => void,
}

type State = {
  data: {
    time: string,
    pv: number,
  }[],
  isLoaded: boolean,
}

class PageViewsMonthly extends React.Component<Props, State> {
  state = {
    data: [],
    isLoaded: false,
  };

  loadData = () => {
    const id = this.props.match.params.id;
    fetch(`/api/reports/${id}/page-views/monthly`)
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
        lineKey="pv"
      />;

    return (
      <ContentCard
        title="Monthly"
        loading={loading}
        placeholder={placeholder}
      >
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

export default PageViewsMonthly;
