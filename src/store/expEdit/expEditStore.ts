import { Instance, types, applySnapshot, flow, getParent } from 'mobx-state-tree';
import dropZoneStore from '~/store/common/dropZoneStore';
import { apiCall } from '~/utils/fetchUtils';
import xmlJs from 'xml-js';
import _ from 'lodash';
import { IAlertTypeAmodelType } from '../common/alertTypeAstore';
import { IExpEditListModelType } from './expEditListStore';

/** model id */
const IDENTIFIER = 'expEditModel';

/**
 *  체험 모델
 */
const model = types
  .model(IDENTIFIER, {
    /** 스토어 아이덴티티 */
    identifier: types.optional(types.identifier, IDENTIFIER),
    /** 휴양림 번호 */
    forestSeqNo: types.optional(types.number, 0),
    /** 체험 번호 */
    expSeqNo: types.optional(types.number, 0),
    /** 체험명 */
    name: types.optional(types.string, ''),
    /** 체험 대분류 */
    categ1: types.optional(types.string, 'N'),
    /** 체험 소분류 */
    categ2: types.maybe(types.string),
    /** 체험 주제 */
    title: types.maybe(types.string),
    /** 체험 설명 */
    desc: types.maybe(types.string),
    /** 메인 노출 여부 Y/N */
    mainYn: types.optional(types.string, ''),
    /** 체험 이미지 */
    dropZoneModel: types.optional(dropZoneStore.model, () => dropZoneStore.create),
    /** 파일 upload 성공여부 true/false */
    isFileUploadSuccess: types.optional(types.boolean, true),
    /** 파일 delete 성공여부 true/false */
    isFileDeleteSuccess: types.optional(types.boolean, true),
    /** 로딩 유무 */
    loading: types.optional(types.boolean, false)
  })
  .actions((self) => {
    const root = self as IExpEditModelType;

    /** 로딩 설정 */
    const setLoading = (val: boolean) => {
      self.loading = val;
    };

    // 파일 upload/delete 수행 실패시 call
    const resultFalseProc = (fileResult: boolean) => {
      if (!fileResult) {
        setLoading(false);

        return false;
      }
    };

    /** forestSeqNo set */
    const setForestSeqNo = (forestSeqNo: number) => {
      self.forestSeqNo = forestSeqNo;
    };

    /** 파일을 제외한 input 입력값 상태값에 저장 */
    const setChangeHandler = (fieldName: string, val: string) => {
      self[fieldName] = val;
    };

    /** 데이터 저장 */
    const setSaveData = flow(function* (callback?: (expSeqNo: number) => void) {
      // alert 모델
      const alertModel = root.getAlertModel();

      // loading true
      setLoading(true);

      // 파일 upload/delete 여부 초기화
      self.isFileUploadSuccess = true;
      self.isFileDeleteSuccess = true;

      // alert show
      const showAlert = (contents: string, seqNo?: number) => {
        alertModel.setToggleWithSetting({
          bodyContents: contents,
          opFirstBtnClick: () => callback?.(seqNo),
          secondBtnText: '',
          secondBtnClassName: 'd-none'
        });
      };

      /** 체험 이미지 AWS 에 업로드 */
      const imgUploadResult = yield setImageUpload();
      resultFalseProc(imgUploadResult);
      /** 체험 이미지 AWS 에 업로드 */

      /** 체험 삭제대상 이미지 AWS 에서 DELETE */
      const imgDeleteResult = yield setImageDelete();
      resultFalseProc(imgDeleteResult);
      /** 체험 삭제대상 이미지 AWS 에서 DELETE */

      /** DB에 SAVE */
      // 이미지 데이터 수집
      const imgsData = _.map(self.dropZoneModel.dropZoneFiles, (val) => ({
        IMG_URL: val.url,
        SORT: val.sort
      }));

      // 이미지 데이터 xml 로 파싱
      const imgXml = xmlJs.js2xml(
        {
          ROOT: {
            DATA: [...imgsData]
          }
        },
        {
          compact: true,
          spaces: 2
        }
      );

      // api call
      const result = yield apiCall({
        url: '/setExpSave',
        method: 'POST',
        data: {
          FOREST_SEQ_NO: self.forestSeqNo,
          EXP_SEQ_NO: self.expSeqNo,
          NAME: self.name,
          CATEG1: self.categ1,
          CATEG2: self.categ2,
          TITLE: self.title,
          DESCRIPT: self.desc,
          MAP_X: 0,
          MAP_Y: 0,
          MAIN_YN: self.mainYn,
          XML_FILE_DATA: imgXml
        }
      });

      if (!result.RESULT) {
        // alert 띄우기
        showAlert('저장이 실패 되었습니다.');
      } else {
        // alert 띄우기
        showAlert('저장 되었습니다.', result.RET_EXP_SEQ_NO);
      }
      /** DB에 SAVE */

      // loading false
      setLoading(false);
    });

    /** 체험 이미지 AWS에 UPLOAD */
    const setImageUpload = flow(function* () {
      // 업로드해야할 이미지 파일들 데이터 수집
      const uploadImgs = _.filter(self.dropZoneModel.dropZoneFiles, (val) => val.gubun !== 'D');

      if (uploadImgs.length === 0) {
        return true;
      }

      // aws 에 업로드 및 업로드 결과 array 출력
      yield Promise.all(
        _.map(uploadImgs, async (val) => {
          // 업로드 콜백
          const imgUploadCallback = (percent: number, guid: string, fileName: string) => {
            console.log('img upload status:', percent, fileName, guid);
          };

          // aws 에 파일 업로드
          const imgUploadResult = await self.dropZoneModel.setUploadFile(
            val.file,
            val.guid,
            imgUploadCallback
          );

          // 파일 업로드 실패시
          if (!imgUploadResult) {
            self.isFileUploadSuccess = false;

            return false;
          }
        })
      );

      if (!self.isFileUploadSuccess) {
        root.getAlertModel().setSimpleShow('파일업로드가 실패 되었습니다.');
      }

      return true;
    });

    /** 체험 이미지 AWS 에서 DELETE */
    const setImageDelete = flow(function* () {
      // 삭제대상 이미지 파일들 데이터 수집
      const deleteImgs = self.dropZoneModel.delFiles;

      if (deleteImgs.length === 0) {
        return true;
      }

      // aws 에서 파일 삭제
      yield Promise.all(
        _.map(deleteImgs, async (val) => {
          // 업로드 콜백
          const imgDeleteCallback = (percent: number, guid: string, fileName: string) => {
            console.log('img delete status:', percent, fileName, guid);
          };

          // aws 에서 파일 삭제
          const imgDeleteResult = await self.dropZoneModel.setUpfileDelete(
            val.guid,
            imgDeleteCallback
          );

          // 파일 삭제 실패시
          if (!imgDeleteResult) {
            self.isFileDeleteSuccess = false;

            return false;
          }
        })
      );

      if (!self.isFileDeleteSuccess) {
        root.getAlertModel().setSimpleShow('파일삭제가 실패 되었습니다.');
      }

      return true;
    });

    /** expSeqNo set */
    const setExpSeqNo = (expSeqNo: number) => {
      self.expSeqNo = expSeqNo;
    };

    /** 로딩중 표시 */
    // const setLoading = (val: boolean) => {
    // 	getParent<IExpEditListModelType>(getParent(self)).setLoading(val);
    // };

    /** 상태값 초기화 */
    const setInit = () => {
      applySnapshot(self, defaultValue);
    };

    return {
      setForestSeqNo,
      setChangeHandler,
      setSaveData,
      setImageUpload,
      setExpSeqNo,
      setLoading,
      setInit
    };
  })
  .views((self) => {
    /** 중분류 리스트 가져오기 */
    const getDepth2List = (categ2List: any[]) => {
      return _.filter(categ2List, (val) => val.CD.indexOf(self.categ1) > -1);
    };

    /** alert 모델 가져오기 */
    const getAlertModel = (): IAlertTypeAmodelType => {
      return getParent<IExpEditListModelType>(getParent(self)).alertModel;
    };

    /** 필수값 체크 */
    const getValidate = () => {
      const alert = getAlertModel();

      if (!self.name || !self.categ1 || !self.categ2 || !self.title || !self.desc) {
        alert.setToggleWithSetting({
          bodyContents: '* 체험명/체험주제/체험설명은 필수값 입니다.',
          secondBtnText: '',
          secondBtnClassName: 'd-none'
        });

        return false;
      }

      return true;
    };

    return {
      getDepth2List,
      getAlertModel,
      getValidate
    };
  });

/** 초기화 값 */
const defaultValue = {
  identifier: IDENTIFIER,
  forestSeqNo: 0,
  expSeqNo: 0,
  name: '',
  categ1: 'E',
  categ2: 'E1',
  title: '',
  desc: '',
  mainYn: 'N',
  dropZoneModel: {
    ...dropZoneStore.defaultValue,
    categ: 'E'
  }
};

/** create or initialize */
const create = model.create(defaultValue);

const expEditStore = {
  create,
  defaultValue,
  model
};

/** 모델 타입 */
export type IExpEditModelType = Instance<typeof model>;

export default expEditStore;
