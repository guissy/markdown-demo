import { stringify } from 'querystring';
import request from '../../utils/request';

export async function loginAjax(params) {
  return request(`/api/login`, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}
