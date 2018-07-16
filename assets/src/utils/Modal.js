// @flow

import { Modal } from 'antd';

export const error = Modal.error;
export const info = Modal.info;
export const success = Modal.success;
export const warning = Modal.warning;
export const confirm = Modal.confirm;

export const fetchError = () => {
  error({
    title: 'Fetch data error',
    content: 'Sorry. There seems to be an error when fetching data from server. Please try again later.',
  });
};