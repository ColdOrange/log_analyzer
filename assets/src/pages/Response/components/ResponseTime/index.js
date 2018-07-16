// @flow

import * as React from 'react';

import ContentCard from 'components/ContentCard';
import CustomPieChart from 'components/CustomPieChart';

type Props = {
  match: Object,
  errorHandler: () => void,
}

type State = {
  data: {
    timeRange: string,
    count: number,
  }[],
  isLoaded: boolean,
}

class ResponseTime extends React.Component<Props, State> {
  state = {
    data: [],
    isLoaded: false,
  };

  loadData = () => {
    const id = this.props.match.params.id;
    fetch(`/api/reports/${id}/response-time`)
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
      <CustomPieChart
        data={[]}
        nameKey="timeRange"
        dataKey="count"
      />;

    return (
      <ContentCard
        title="Response Time"
        loading={loading}
        placeholder={placeholder}
      >
        <CustomPieChart
          data={this.state.data}
          nameKey="timeRange"
          dataKey="count"
        />
      </ContentCard>
    );
  }
}

export default ResponseTime;
