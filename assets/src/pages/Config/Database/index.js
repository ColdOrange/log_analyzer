// @flow

import * as React from 'react';
import { Button, Form, Input, Select } from 'antd';

import ContentCard from 'components/ContentCard';
import { confirm, success, error as modalError } from 'utils/Modal';
import styles from './index.css';

type Props = {
  form: Object,
}

type State = {
  driver: string,
  username: string,
  password: string,
  database: string,
}

class Database extends React.Component<Props, State> {
  state = {
    driver: 'postgres',
    username: '',
    password: '',
    database: 'log_analyzer',
  };

  loadData = () => {
    fetch('/api/config/database')
      .then(response => response.json())
      .then(
        data => {
          if (data.status === 'failed') { // Server API error
            console.log('Server API error');
          }
          else if (data.initialized === true) {
            this.setState(data);
          }
        },
        error => { // Fetch error
          console.log(error);
        }
      );
  };

  postData = (data) => {
    fetch('/api/config/database', {
      body: JSON.stringify(data),
      method: 'POST',
    })
      .then(response => response.json())
      .then(
        data => {
          if (data.status === 'successful') {
            success({
              title: 'Success',
              content: 'Submit database configuration successfully!',
            });
          }
          else {
            const errorMessage = data.errors != null ? 'Error message: ' + data.errors.join(': ') : '';
            modalError({
              title: 'Error',
              content: <div><p>Submit database configuration failed.</p>{errorMessage}</div>,
            });
          }
        },
        error => { // Fetch error
          modalError({
            title: 'Error',
            content: 'Submit database configuration failed.',
          });
          console.log(error);
        }
      );
  };

  handleSubmit = (event) => {
    event.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        confirm({
          title: 'Caution',
          content: 'Change the database configuration will drop the old database and all the reports generated before, please be careful when submitting.',
          onOk: () => {
            this.setState(values);
            this.postData(values);
          },
        });
      }
    });
  };

  databaseNameValidator = (rule, value, callback) => {
    if (/\s/g.test(value)) {
      callback('Do not contain whitespace in the database name!');
    } else {
      callback();
    }
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
      <ContentCard title="Database Configuration">
        <Form className={styles.form} onSubmit={this.handleSubmit}>
          <Form.Item
            {...formItemLayout}
            label="Driver"
            extra="Database driver, only support PostgreSQL for now."
          >
            {
              getFieldDecorator('driver', {
                initialValue: this.state.driver,
                rules: [{ required: true, message: 'Please select the database driver!' }],
              })(
                <Select>
                  <Select.Option value="postgres">PostgreSQL</Select.Option>
                </Select>
              )
            }
          </Form.Item>
          <Form.Item
            {...formItemLayout}
            label="Username"
          >
            {
              getFieldDecorator('username', {
                initialValue: this.state.username,
                rules: [{ required: true, message: 'Please input your username!' }],
              })(
                <Input />
              )
            }
          </Form.Item>
          <Form.Item
            {...formItemLayout}
            label="Password"
          >
            {
              getFieldDecorator('password', {
                initialValue: this.state.password,
                rules: [{ required: true, message: 'Please input your password!' }],
              })(
                <Input type="password" />
              )
            }
          </Form.Item>
          <Form.Item
            {...formItemLayout}
            label="Database"
            extra="The database name that log analyzer will create on your disk."
          >
            {
              getFieldDecorator('database', {
                initialValue: this.state.database,
                rules: [
                  {
                    required: true, message: 'Please input the database name!',
                  },
                  {
                    validator: this.databaseNameValidator,
                  }
                ],
              })(
                <Input />
              )
            }
          </Form.Item>
          <Form.Item {...tailFormItemLayout}>
            <Button type="primary" htmlType="submit">Save</Button>
          </Form.Item>
        </Form>
      </ContentCard>
    );
  }
}

export default Form.create()(Database);
