import request from '../utils/request';

export async function langAjax(params: string) {
  return request(`/assets/lang/${params}.json`);
}

export async function listAjax(params: string) {
  return request('/language/list');
}