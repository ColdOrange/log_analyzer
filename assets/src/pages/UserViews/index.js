// @flow

import * as React from 'react';

import UserViewsDaily from './components/UserViewsDaily';
import UserViewsHourly from './components/UserViewsHourly';
import UserViewsMonthly from './components/UserViewsMonthly';
import { fetchError } from 'utils/Modal';
import styles from './index.css';

type Props = {
  match: Object,
}

class UserViews extends React.Component<Props> {
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
        <UserViewsDaily
          match={this.props.match}
          errorHandler={this.errorHandler}
        />
        <div className={styles.divider} />
        <UserViewsHourly
          match={this.props.match}
          errorHandler={this.errorHandler}
        />
        <div className={styles.divider} />
        <UserViewsMonthly
          match={this.props.match}
          errorHandler={this.errorHandler}
        />
      </div>
    );
  }
}

export default UserViews;
