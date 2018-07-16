// @flow

import * as React from 'react';
import { Button, Icon, Form, Modal, Input, Select, Spin } from 'antd';

import ContentCard from 'components/ContentCard';
import { success, error as modalError } from 'utils/Modal';
import styles from './index.css';

const { Option } = Select;

type Props = {
  form: Object,
}

type State = {
  logFile: string,
  logPattern: string,
  logFormat: string[], // TODO: validator
  timeFormat: string,
  spinning: boolean,
}

class LogFormat extends React.Component<Props, State> {
  state = {
    logFile: '',
    logPattern: '',
    logFormat: [],
    timeFormat: '',
    spinning: false,
  };

  loadData = () => {
    fetch('/api/config/log-format')
      .then(response => response.json())
      .then(
        data => {
          if (data.status === 'failed') { // Server API error
            console.log('Server API error');
          }
          else {
            this.setState(data);
          }
        },
        error => { // Fetch error
          console.log(error);
        }
      );
  };

  postData = (data) => {
    fetch('/api/config/log-format', {
      body: JSON.stringify(data),
      method: 'POST',
    })
      .then(response => {
        this.setState({ spinning: false });
        return response.json();
      })
      .then(
        data => {
          if (data.status === 'successful') {
            success({
              title: 'Success',
              content: 'Generate report successfully!',
            });
          }
          else {
            const errorMessage = data.errors != null ? 'Error message: ' + data.errors.join(': ') : '';
            modalError({
              title: 'Error',
              content: <div><p>Generate report failed.</p>{errorMessage}</div>,
            });
          }
        },
        error => { // Fetch error
          modalError({
            title: 'Error',
            content: 'Generate report failed.',
          });
          console.log(error);
        }
      );
  };

  handleSubmit = (event) => {
    event.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        // this.setState({ ...values, spinning: true }, () => { // TODO: setState is asnyc, does it matters?
        //   this.postData(values);
        // });
        this.setState({ ...values, spinning: true });
        this.postData(values);
      }
    });
  };

  componentDidMount() {
    this.loadData();
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };
    const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0,
        },
        sm: {
          span: 16,
          offset: 8,
        },
      },
    };

    return (
      <ContentCard title="Log Format Configuration">
        <Form className={styles.form} onSubmit={this.handleSubmit}>
          <Form.Item
            {...formItemLayout}
            label="Log File"
            extra="Full path (on your file system) of the log file to be analyzed."
          >
            {
              getFieldDecorator('logFile', {
                initialValue: this.state.logFile,
                rules: [{ required: true, message: 'Please input the log file name!' }],
              })(
                <Input />
              )
            }
          </Form.Item>
          <Form.Item
            {...formItemLayout}
            label="Log Pattern"
            extra={
              <div>
                <p>A regular expression that matches the <b>Log Format</b> below.</p>
                <p>The regexp grammar should be compatible with Elixir/Erlang&#39;s regexp grammar, which can be found <a href="http://erlang.org/doc/man/re.html" target="_blank" rel="noopener noreferrer">here</a>.</p>
              </div>
            }
          >
            {
              getFieldDecorator('logPattern', {
                initialValue: this.state.logPattern,
                rules: [{ required: true, message: 'Please input the log pattern!' }],
              })(
                <Input />
              )
            }
          </Form.Item>
          <Form.Item
            {...formItemLayout}
            label="Log Format"
            extra={<p>Log fields appeared in the log file, make sure they are in the same order with <b>Log Pattern</b> above.</p>}
          >
            {
              getFieldDecorator('logFormat', {
                initialValue: this.state.logFormat,
                rules: [{ required: true, message: 'Please select the log format!' }],
              })(
                <Select mode="multiple">
                  <Option value="IP">IP</Option>
                  <Option value="Time">Time</Option>
                  <Option value="RequestMethod">RequestMethod</Option>
                  <Option value="RequestURL">RequestURL</Option>
                  <Option value="HTTPVersion">HTTPVersion</Option>
                  <Option value="ResponseCode">ResponseCode</Option>
                  <Option value="ResponseTime">ResponseTime</Option>
                  <Option value="ContentSize">ContentSize</Option>
                  <Option value="UserAgent">UserAgent</Option>
                  <Option value="Referrer">Referrer</Option>
                </Select>
              )
            }
          </Form.Item>
          <Form.Item
            {...formItemLayout}
            label="Time Format"
            extra={
              <div>
                <p>Format of the time string in <b>Time</b> field above.</p>
                <p>You can find some common used formats <a href="https://hexdocs.pm/timex/Timex.Format.DateTime.Formatters.Default.html#module-compound-directives" target="_blank" rel="noopener noreferrer">here</a>, and you can also utilize the <a href="https://hexdocs.pm/timex/Timex.Format.DateTime.Formatters.Default.html#module-list-of-all-directives" target="_blank" rel="noopener noreferrer">directives</a> below to create your own format.</p>
                <p>Just be aware you can only use the specific time point - <b>2006-01-02 15:04:05</b>, which is the birthday of Golang.</p>
              </div>
            }
          >
            {
              getFieldDecorator('timeFormat', {
                initialValue: this.state.timeFormat,
                rules: [{ required: true, message: 'Please input the time format!' }],
              })(
                <Input />
              )
            }
          </Form.Item>
          <Form.Item {...tailFormItemLayout}>
            <Button type="primary" htmlType="submit">Generate Report</Button>
          </Form.Item>
        </Form>
        <Modal
          visible={this.state.spinning}
          title={<Spin indicator={<Icon type="loading" style={{ fontSize: 24 }} spin />} />}
          footer={null}
          closable={false}
          width={416}
        >
          <p>Analyzing log file, please wait for a while...</p>
        </Modal>
      </ContentCard>
    );
  }
}

export default Form.create()(LogFormat);