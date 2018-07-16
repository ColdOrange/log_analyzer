// @flow

import * as React from 'react';

import ReferringSite from './components/ReferringSite';
import ReferringURL from './components/ReferringURL';
import { fetchError } from 'utils/Modal';
import styles from './index.css';

type Props = {
  match: Object,
}

class Referrer extends React.Component<Props> {
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
        <ReferringSite
          match={this.props.match}
          errorHandler={this.errorHandler}
        />
        <div className={styles.divider} />
        <ReferringURL
          match={this.props.match}
          errorHandler={this.errorHandler}
        />
      </div>
    );
  }
}

export default Referrer;
