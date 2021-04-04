import { Instance, types, applySnapshot, clone, destroy, flow } from 'mobx-state-tree';
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';
import { apiCall, IProgressArgs } from '~/utils/fetchUtils';
import dropZoneFileStore from '~/store/common/dropZoneFileStore';

/** model id */
const IDENTIFIER = 'fileModel';

export interface IFile {
  name?: string;
  url?: string;
  sort?: number;
  imgSeqNo?: number;
  /** D: DB에서 가져온값 */
  gubun?: string;
  guid?: string;
  file?: any;
}

const fileModel = types.model(IDENTIFIER, {
  identifier: types.optional(types.identifier, IDENTIFIER),
  name: types.optional(types.string, ''),
  url: types.optional(types.string, ''),
  sort: types.optional(types.maybeNull(types.number), null),
  imgSeqNo: types.optional(types.maybeNull(types.number), null),
  gubun: types.optional(types.string, ''),
  guid: types.optional(types.string, ''),
  file: types.frozen()
});

/**
 * 파일 드랍존 모델
 */
const model = types
  .model('dropZoneModel', {
    /** 스토어 아이덴티티 */
    identifier: types.optional(types.identifier, 'dropZoneModel'),
    /** 드랍존 파일들 */
    dropZoneFiles: types.optional(types.array(dropZoneFileStore.model), []),
    /** 삭제처리 대상파일들(DB, AWS에서 삭제처리 대상) */
    delFiles: types.optional(types.array(dropZoneFileStore.model), []),
    /** 카테고리 구분 */
    categ: types.optional(types.string, '')
  })
  .actions((self) => ({
    /** 파일 add set */
    setAddFile(fileObj: IFile[]) {
      _.each(fileObj, (val, idx) => {
        self.dropZoneFiles.push({
          ...val,
          guid: val.guid ?? uuidv4(),
          file: val.gubun === 'D' ? new File([''], val.name) : val.file
        });
      });
    },
    /** 파일정보 delete set*/
    setDelFile(guid: string) {
      const fileObj = _.find(self.dropZoneFiles, { guid });

      // 삭제파일정보에 push (AWS 에 올라간 파일만 PUSH)
      if (fileObj.gubun === 'D') {
        self.delFiles.push(clone(fileObj));
      }

      // 기존 파일정보들에서 삭제
      destroy(fileObj);
    },
    /**
     * 업로드 파일 삭제
     * delFile: 삭제 타겟 파일 정보
     * callback: 콜백함수, 삭제처리 퍼센트 진행률 콜백
     * */
    setUpfileDelete: flow(function* (
      guid: string,
      callback?: (percent: number, guid: string, fileName: string) => void
    ) {
      // 삭제대상 파일 find
      const delFile = _.find(self.delFiles, { guid });

      let result = null;

      // 구분이 'D' 인 (이미 AWS 에 올라간 파일) 파일들만 골라서 삭제
      if (delFile.gubun === 'D') {
        // 삭제할 data 생성
        const data = {
          CATEG: self.categ,
          FILE: delFile.name
        };

        // 진행율 콜백
        const progressCallback = (args: IProgressArgs) => {
          callback?.(args.percent, guid, delFile.name);

          console.log('percent:', args.percent);
        };

        // api call
        result = yield apiCall({
          url: '/deleteFile',
          method: 'POST',
          data,
          progressCallback
        });
      }

      // 정상 삭제처리 되었다면 상태값에서 제거
      if (result.RESULT) {
        destroy(delFile);
      }

      return result.RESULT;
    }),
    /** 파일 업로드 */
    setUploadFile: flow(function* (
      file: File,
      guid: string,
      callback?: (percent: number, guid: string, fileName: string) => void
    ) {
      // 진행율 콜백
      const progressCallback = (args: IProgressArgs) => {
        callback(args.percent, guid, file.name);

        console.log('percent:', args.percent);
      };

      // mst 상태값 find
      const mstFile = _.find(self.dropZoneFiles, { guid });

      // form data 생성
      const formData = new FormData();
      formData.append('CATEG', self.categ);
      formData.append('FILE', file);

      // api call
      const result = yield apiCall({
        url: '/upload',
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        data: formData,
        progressCallback
      });

      // S3 업로드 후 데이터 가져와서 상태값에 UPDATE
      if (result.RESULT && result.FILE_INFO?.length > 0) {
        const { S3_URL, S3_FILE_NAME } = result.FILE_INFO?.[0];

        (self as IDropZoneModelType).setS3Info(mstFile, S3_URL, S3_FILE_NAME);

        return true;
      } else {
        return false;
      }
    }),
    /** S3 업로드 정보 UPDATE */
    setS3Info(file: Instance<typeof fileModel>, s3Url: string, s3FileName: string) {
      file.url = s3Url;
      file.name = s3FileName;
    },
    /** 파일 소트정보 set */
    setSort(guid: string, sort: number) {
      const fileObj = _.find(self.dropZoneFiles, { guid });

      fileObj.sort = sort;
    },
    /** 초기화 */
    setInit() {
      applySnapshot(self, defaultValue);
    }
  }))
  .views((self) => ({
    /** guid 기준 파일 객체 찾기 */
    getFileWithGuid(guid: string) {
      return _.find(self.dropZoneFiles, { guid });
    },
    /** 상태값에 저장되어있던 파일 정보들
     * (화면 크기 조절이나 컴포넌트가 다시 로딩시에 이미지 유지를 하기위해 아래 함수 필요함)
     * */
    getDropZoneFiles() {
      const files = _.chain(self.dropZoneFiles)
        // .filter({ gubun: 'D' })
        .map((val) => {
          return {
            file: {
              name: val.name,
              arrayBuffer: null,
              size: null,
              lastModified: null,
              type: null,
              slice: null,
              stream: null,
              text: null
            },
            data: null,
            name: val.name,
            url: val.url,
            sort: val.sort,
            imgSeqNo: val.imgSeqNo,
            gubun: val.gubun,
            guid: val.guid
          };
        })
        .value();

      return files;
    }
  }));

/** 초기화 값 */
const defaultValue = {
  identifier: IDENTIFIER,
  dropZoneFiles: [],
  delFiles: [],
  categ: ''
};

const create = model.create(defaultValue);

const dropZoneStore = {
  create,
  defaultValue,
  model
};

/** model type */
export type IDropZoneModelType = Instance<typeof model>;

export default dropZoneStore;
