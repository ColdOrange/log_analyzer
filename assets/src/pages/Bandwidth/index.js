// @flow

import * as React from 'react';

import BandwidthDaily from './components/BandwidthDaily';
import BandwidthHourly from './components/BandwidthHourly';
import BandwidthMonthly from './components/BandwidthMonthly';
import { fetchError } from 'utils/Modal';
import styles from './index.css';

type Props = {
  match: Object,
}

class Bandwidth extends React.Component<Props> {
  error = false;

  // Handle error in parent component, in case it will show several times in children
  errorHandler = () => { // TODO: add error message
    if (!this.error) {
      this.error = true;
      fetchError();
    }
  };

  render() {
    return (
      <div>
        <BandwidthDaily
          match={this.props.match}
          errorHandler={this.errorHandler}
        />
        <div className={styles.divider} />
        <BandwidthHourly
          match={this.props.match}
          errorHandler={this.errorHandler}
        />
        <div className={styles.divider} />
        <BandwidthMonthly
          match={this.props.match}
          errorHandler={this.errorHandler}
        />
      </div>
    );
  }
}

export default Bandwidth;
