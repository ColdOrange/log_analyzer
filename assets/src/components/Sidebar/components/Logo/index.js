// @flow

import * as React from 'react';

import styles from './index.css';

type Props = {
  collapsed: boolean,
}

class Logo extends React.Component<Props> {
  render() {
    return (
      <div className={styles.logo}>
        <img
          className={styles.img}
          alt="logo"
          src="/static/images/logo.svg"
        />
        {
          this.props.collapsed ? null : <span className={styles.span}>Log Analyzer</span>
        }
      </div>
    );
  }
}

export default Logo;
