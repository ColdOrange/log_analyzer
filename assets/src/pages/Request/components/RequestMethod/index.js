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
    requestMethod: string,
    count: number,
  }[],
  isLoaded: boolean,
}

class RequestMethod extends React.Component<Props, State> {
  state = {
    data: [],
    isLoaded: false,
  };

  loadData = () => {
    const id = this.props.match.params.id;
    fetch(`/api/reports/${id}/request-method`)
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
        nameKey="requestMethod"
        dataKey="count"
      />;

    return (
      <ContentCard
        title="Request Method"
        loading={loading}
        placeholder={placeholder}
      >
        <CustomPieChart
          data={this.state.data}
          nameKey="requestMethod"
          dataKey="count"
        />
      </ContentCard>
    );
  }
}

export default RequestMethod;
