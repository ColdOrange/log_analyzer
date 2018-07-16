// @flow

import * as React from 'react';

import PageViewsDaily from './components/PageViewsDaily';
import PageViewsHourly from './components/PageViewsHourly';
import PageViewsMonthly from './components/PageViewsMonthly';
import { fetchError } from 'utils/Modal';
import styles from './index.css';

type Props = {
  match: Object,
}

class PageViews extends React.Component<Props> {
  error = false;

  // Handle error in parent component, in case it will show several times in children
  errorHandler = () => {
    if (!this.error) {
      this.error = true;
      fetchError();
    }
  };

  render() {
    return (
      <div>
        <PageViewsDaily
          match={this.props.match}
          errorHandler={this.errorHandler}
        />
        <div className={styles.divider} />
        <PageViewsHourly
          match={this.props.match}
          errorHandler={this.errorHandler}
        />
        <div className={styles.divider} />
        <PageViewsMonthly
          match={this.props.match}
          errorHandler={this.errorHandler}
        />
      </div>
    );
  }
}

export default PageViews;
