// @flow

import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'antd';

import styles from './index.css';

class NotFound extends React.Component<{}> {
  render() {
    return (
      <div className={styles.exception}>
        <div className={styles.imgBlock}>
          <div
            className={styles.imgEle}
            style={{ backgroundImage: 'url(/static/images/404.svg)' }}
          />
        </div>
        <div className={styles.content}>
          <h1 className={styles.h1}>404</h1>
          <div className={styles.desc}>Page Not Found</div>
          <Link to="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }
}

export default NotFound;
