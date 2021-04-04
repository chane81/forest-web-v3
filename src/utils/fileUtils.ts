import { apiCall, IProgressArgs } from '~/utils/fetchUtils';

/** 파일 URL 로부터파일명 추출 */
export const getFileNameFromUrl = (fileUrl: string): string => {
  return fileUrl.substring(fileUrl.lastIndexOf('/') + 1, fileUrl.length);
};

/** 업로드 인자 타입 */
interface IUploadArgs {
  /** File 객체 */
  file: File;
  /** 이미지 종류 - F: 휴양림, C: 체험, M: 휴양림 맵 */
  categ: string;
  /** File guid: Dropzone 에 있는 file 의 guid */
  guid?: string;
  /** 업로드 진행율 콜백 함수 */
  callback?: (percent: number, guid: string, fileName: string) => void;
}

/** 업로드 결과 타입 */
interface IUploadResult {
  RESULT: boolean;
  S3_URL: string;
  S3_FILE_NAME: string;
}

/** 파일 삭제 인자 타입 */
interface IFileDeleteArgs {
  /** 삭제할 파일명*/
  fileName: string;
  /** 이미지 종류 - F: 휴양림, C: 체험, M: 휴양림 맵 */
  categ: string;
  /** File guid: Dropzone 에 있는 file 의 guid */
  guid?: string;
  /** 업로드 진행율 콜백 함수 */
  callback?: (percent: number, guid: string, fileName: string) => void;
}

/** 단일 파일 삭제 */
export const setFileDelete = async (
  args: IFileDeleteArgs
): Promise<boolean> => {
  const { fileName, categ, guid, callback } = args;

  const data = {
    CATEG: categ,
    FILE: fileName
  };

  // 진행율 콜백
  const progressCallback = (progArgs: IProgressArgs) => {
    callback?.(progArgs.percent, guid, fileName);

    console.log('percent:', progArgs.percent);
  };

  // api call
  const res = await apiCall({
    url: '/deleteFile',
    method: 'POST',
    data,
    progressCallback
  });

  return res.RESULT;
};

/** 단일 파일 업로드 */
export const setUploadFile = async (
  args: IUploadArgs
): Promise<IUploadResult> => {
  const { file, categ, guid, callback } = args;

  // 진행율 콜백
  const progressCallback = (progArgs: IProgressArgs) => {
    /** 콜백 call */
    callback(progArgs.percent, guid, file.name);

    /** 로그 */
    console.log('percent:', progArgs.percent);
  };

  // form data 생성
  const formData = new FormData();
  formData.append('CATEG', categ);
  formData.append('FILE', file);

  // api call
  const res = await apiCall({
    url: '/upload',
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: formData,
    progressCallback
  });

  // 업로드 결과
  let rtn: IUploadResult = {
    RESULT: false,
    S3_URL: null,
    S3_FILE_NAME: null
  };

  // S3 업로드 후 결과
  if (res.RESULT && res.FILE_INFO?.length > 0) {
    const { S3_URL, S3_FILE_NAME } = res.FILE_INFO?.[0];

    rtn = {
      RESULT: true,
      S3_URL,
      S3_FILE_NAME
    };
  }

  return rtn;
};
