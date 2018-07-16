// @flow

import * as React from 'react';
import { Row, Col } from 'antd';

import RequestMethod from './components/RequestMethod';
import HTTPVersion from './components/HTTPVersion';
import RequestURL from './components/RequestURL';
import StaticFile from './components/StaticFile';
import { fetchError } from 'utils/Modal';
import styles from './index.css';

type Props = {
  match: Object,
}

class Request extends React.Component<Props> {
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
        <Row gutter={24}>
          <Col span={12}>
            <RequestMethod
              match={this.props.match}
              errorHandler={this.errorHandler}
            />
          </Col>
          <Col span={12}>
            <HTTPVersion
              match={this.props.match}
              errorHandler={this.errorHandler}
            />
          </Col>
        </Row>
        <div className={styles.divider} />
        <RequestURL
          match={this.props.match}
          errorHandler={this.errorHandler}
        />
        <div className={styles.divider} />
        <StaticFile
          match={this.props.match}
          errorHandler={this.errorHandler}
        />
      </div>
    );
  }
}

export default Request;
