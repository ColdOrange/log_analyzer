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
    uv: number,
  }[],
  isLoaded: boolean,
}

class UserViewsDaily extends React.Component<Props, State> {
  state = {
    data: [],
    isLoaded: false,
  };

  loadData = () => {
    const id = this.props.match.params.id;
    fetch(`/api/reports/${id}/user-views/daily`)
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
        lineKey="uv"
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
            lineKey="uv"
            color="#82ca9d"
          />
        </div>
      </ContentCard>
    );
  }
}

export default UserViewsDaily;
