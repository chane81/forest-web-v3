import axios, { Method } from 'axios';
import dotenv from 'dotenv';
import env from '~/config/env';
import { Query, QueryResult } from 'material-table';

dotenv.config();

/** api 호출 파라메터 타입 */
export interface IApiCallArgs {
  url: string;
  params?: any;
  method?: Method;
  headers?: any;
  data?: any;
  progressCallback?: (args: IProgressArgs) => void;
}

/** ajax 호출 progress 콜백 인자 타입 */
export interface IProgressArgs {
  loaded: number;
  total: number;
  percent: number;
}

/** api 호출 함수 */
const apiCall = async (args: IApiCallArgs): Promise<any> => {
  const apiDomain = env.API_URL;
  const { url, params, method, headers, data, progressCallback } = args;

  // progress 상황 전달(callback 함수가 있을 경우에만)
  const setProgress = (callback: (args: IProgressArgs) => void) => (
    progressEvent: ProgressEvent<EventTarget>
  ) => {
    if (callback) {
      const { loaded, total } = progressEvent;
      const percent = Math.floor((loaded * 100) / total);

      // 콜백함수에 퍼센트 전달
      callback({
        loaded,
        total,
        percent
      });

      console.log(`${loaded}kb of ${total}kb | ${percent}%`);
    }
  };

  const res = await axios.request({
    baseURL: apiDomain,
    withCredentials: true,
    url,
    headers,
    method: method ?? 'GET',
    params,
    data,
    onUploadProgress: setProgress(progressCallback)
  });

  return res.data;
};

/** 리스트 콜 파라메터 타입 */
interface IListCallArgs extends IApiCallArgs {
  firstData?: any[];
  pageNo?: number;
  pageSize?: number;
}

/** 테이블 리스트 바인딩용 함수 */
const listCall = (args: IListCallArgs) => async (query: Query<any>): Promise<QueryResult<any>> => {
  // 만약 args 에서 세팅한 pageNo 가 있다면 그 번호가 default 페이지 번호가 된다.
  const page = !!args.pageNo && !query.page ? args.pageNo : !!query.page ? query.page : 0;

  // 만약 args 에서 세팅한 pageSize 가 있다면 그게 pageSize 가 되고 없으면 그리드의 기본 pageSize (5개) 가 세팅 된다.
  const pageSize = !!args.pageSize ? args.pageSize : query.pageSize;
  const isFirstData = args.firstData && page === 0;

  let data = null;

  // 주의: 컨트롤에서 인지하는 첫 페이지 번호 개념은 0 이다
  // DB 호출시 PAGE_NO 는 1이 첫 페이지의 개념이므로 page + 1 을 해준다.
  if (!isFirstData) {
    data = await apiCall({
      url: args.url,
      params: {
        ...args.params,
        PAGE_NO: page + 1,
        PAGE_SIZE: pageSize
      }
    });
  }

  const listData = isFirstData ? args.firstData : data.LIST;
  const totalCount = isFirstData ? args.data.TOTAL_COUNT : data.TOTAL_COUNT;

  return {
    data: listData,
    page,
    totalCount
  };
};

export { apiCall, listCall };
