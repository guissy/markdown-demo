/**
 * 从后台返回的json数据转换为本地class
 *
 */
export class Result {
  public status: number;
  public message: string;
  public data: any;
  public state: AjaxState; // 0=成功，1=警告，2=失败，3=错误

  constructor(json: any) {
    type T = keyof Result;
    Object.keys(json).forEach((key:T)=>{
      this[key] = json[key];
    })
  }
}

/**
 * 提交数据到后台
 * 会将moment date 转为时间戳
 */
export class Post {
  constructor(data: any) {
    type T = keyof Result;
    Object.keys(data).forEach((key:T)=>{
      const value = data[key];
      if (typeof value === 'object' && ('_isAMomentObject' in value || value instanceof Date)) {
        this[key] = value.valueOf();
      } else if (!key.startsWith("__")) {
        this[key] = value;
      }
    })
  }
}


export enum AjaxState {
  成功,
  警告,
  失败,
  错误,
}