// @flow

import * as React from 'react';
import { Row, Col } from 'antd';

import StatusCode from './components/StatusCode';
import ResponseTime from './components/ResponseTime';
import ResponseURL from './components/ResponseURL';
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
            <StatusCode
              match={this.props.match}
              errorHandler={this.errorHandler}
            />
          </Col>
          <Col span={12}>
            <ResponseTime
              match={this.props.match}
              errorHandler={this.errorHandler}
            />
          </Col>
        </Row>
        <div className={styles.divider} />
        <ResponseURL
          match={this.props.match}
          errorHandler={this.errorHandler}
        />
      </div>
    );
  }
}

export default Request;
