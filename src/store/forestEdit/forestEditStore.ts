import { Instance, types, applySnapshot, flow } from 'mobx-state-tree';
import alertTypeAstore from '~/store/common/alertTypeAstore';
import dropZoneStore, { IFile } from '~/store/common/dropZoneStore';
import { apiCall } from '~/utils/fetchUtils';
import { getFileNameFromUrl } from '~/utils/fileUtils';
import xmlJs from 'xml-js';
import _ from 'lodash';

/** model id */
const IDENTIFIER = 'forestEditModel';

/**
 *  forestEdit 모델
 */
const model = types
  .model(IDENTIFIER, {
    /** 스토어 아이덴티티 */
    identifier: types.optional(types.identifier, IDENTIFIER),
    /** 휴양림 번호 */
    forestSeqNo: types.optional(types.number, 0),
    /** 휴양림명 */
    name: types.maybeNull(types.string),
    /** 메인노출 여부 Y/N */
    mainYn: types.maybeNull(types.string),
    /** 주소 1 */
    addr1: types.maybeNull(types.string),
    /** 주소 2 */
    addr2: types.maybeNull(types.string),
    /** 전화번호 */
    telNo: types.maybeNull(types.string),
    /** 사업자번호 */
    bussinessNum: types.maybeNull(types.string),
    /** 휴양림 설명 */
    desc: types.maybeNull(types.string),
    /** 휴양림 간편 설명 */
    simpleDesc: types.maybeNull(types.string),
    /** 휴양림 이미지 */
    imgDropZoneModel: types.optional(dropZoneStore.model, () => dropZoneStore.create),
    /** 휴양림 맵 이미지 */
    mapDropZoneModel: types.optional(dropZoneStore.model, () => dropZoneStore.create),
    /** ALERT 모델 */
    alertModel: types.optional(alertTypeAstore.model, () => alertTypeAstore.create),
    /** 로딩 유무 */
    loading: types.optional(types.boolean, false),
    /** 파일 upload 성공여부 true/false */
    isFileUploadSuccess: types.optional(types.boolean, true),
    /** 파일 delete 성공여부 true/false */
    isFileDeleteSuccess: types.optional(types.boolean, true)
  })
  .actions((self) => {
    /** 로딩 설정 */
    const setLoading = (val: boolean) => {
      self.loading = val;
    };

    /** 휴양림정보 가져와 상태값에 세팅 */
    const setForestInfo = (forestInfo: any) => {
      const result = forestInfo;

      if (result.RESULT) {
        self.addr1 = result.ADDR1;
        self.addr2 = result.ADDR2;
        self.bussinessNum = result.BUSSINESS_NUMBER;
        self.desc = result.DESCRIPT;
        self.simpleDesc = result.SIMPLE_DESCRIPT;
        self.mainYn = result.MAIN_YN;
        self.name = result.NAME;
        self.telNo = result.TEL_NO;

        // 휴양림 이미지 파일 set
        const forestImgs: IFile[] = _.map(result.IMG_LIST, (val) => ({
          gubun: 'D',
          imgSeqNo: val.IMG_SEQ_NO,
          sort: val.SORT,
          url: val.IMG_URL,
          name: getFileNameFromUrl(val.IMG_URL)
        }));

        // DROP ZONE 상태값에 저장
        self.imgDropZoneModel.setAddFile(forestImgs);

        // 휴양림 맵 이미지 파일 set
        if (result.MAP_IMG) {
          const mapImg = result.MAP_IMG;

          self.mapDropZoneModel.setAddFile([
            {
              gubun: 'D',
              imgSeqNo: mapImg.IMG_SEQ_NO,
              sort: mapImg.SORT,
              url: mapImg.IMG_URL,
              name: getFileNameFromUrl(mapImg.IMG_URL)
            }
          ]);
        }
      }
    };

    /** 파일을 제외한 input 입력값 상태값에 저장 */
    const setChangeHandler = (fieldName: string, val: string) => {
      self[fieldName] = val;
    };

    /** 데이터 저장 */
    const setSaveData = flow(function* (callback?: (forestSeqNo: number) => void) {
      const resultFalseProc = (fileResult: boolean) => {
        if (!fileResult) {
          self.loading = false;

          return false;
        }
      };

      // loading true
      self.loading = true;

      // 파일 upload/delete 여부 초기화
      self.isFileUploadSuccess = true;
      self.isFileDeleteSuccess = true;

      // alert show
      const showAlert = (contents: string, seqNo?: number) => {
        self.alertModel.setToggleWithSetting({
          bodyContents: contents,
          opFirstBtnClick: () => callback?.(seqNo),
          secondBtnText: '',
          secondBtnClassName: 'd-none'
        });
      };

      /** 휴양림 이미지 AWS 에 업로드 */
      const imgUploadResult = yield setImageUpload();
      resultFalseProc(imgUploadResult);
      /** 휴양림 이미지 AWS 에 업로드 */

      /** 휴양림 삭제대상 이미지 AWS 에서 DELETE */
      const imgDeleteResult = yield setImageDelete();
      resultFalseProc(imgDeleteResult);
      /** 휴양림 삭제대상 이미지 AWS 에서 DELETE */

      /** 휴양림 맵 이미지 AWS 에 업로드 */
      const mapUploadResult = yield setMapUpload();
      resultFalseProc(mapUploadResult);
      /** 휴양림 맵 이미지 AWS 에 업로드 */

      /** 휴양림 맵 삭제대상 이미지 AWS에서 DELETE */
      const mapDeleteResult = yield setMapDelete();
      resultFalseProc(mapDeleteResult);
      /** 휴양림 맵 삭제대상 이미지 AWS에서 DELETE */

      /** DB에 SAVE */
      // 이미지 데이터 수집
      const imgsData = _.map(self.imgDropZoneModel.dropZoneFiles, (val) => ({
        IMG_URL: val.url /** DB에 SAVE */,
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
      const mapUrl =
        self.mapDropZoneModel.dropZoneFiles.length > 0
          ? self.mapDropZoneModel.dropZoneFiles[0].url
          : '';
      const result = yield apiCall({
        url: '/setForestSave',
        method: 'POST',
        data: {
          FOREST_SEQ_NO: self.forestSeqNo,
          NAME: self.name,
          ADDR1: self.addr1,
          ADDR2: self.addr2,
          BUSSINESS_NUMBER: self.bussinessNum,
          DESCRIPT: self.desc,
          SIMPLE_DESCRIPT: self.simpleDesc,
          MAIN_YN: self.mainYn,
          TEL_NO: self.telNo,
          MAP_IMG_URL: mapUrl,
          XML_FILE_DATA: imgXml
        }
      });

      if (!result.RESULT) {
        // alert 띄우기
        showAlert('저장이 실패 되었습니다.');
      } else {
        // alert 띄우기
        showAlert('저장 되었습니다.', result.RET_FOREST_SEQ_NO);
      }
      /** DB에 SAVE */

      // loading false
      self.loading = false;
    });

    /** 휴양림 이미지 AWS에 UPLOAD */
    const setImageUpload = flow(function* () {
      // 업로드해야할 이미지 파일들 데이터 수집
      const files = _.filter(self.imgDropZoneModel.dropZoneFiles, (val) => val.gubun !== 'D');

      if (files.length === 0) {
        return true;
      }

      // aws 에 업로드 및 업로드 결과 array 출력
      yield Promise.all(
        _.map(files, async (val) => {
          // 업로드 콜백
          const imgUploadCallback = (percent: number, guid: string, fileName: string) => {
            console.log('img upload status:', percent, fileName, guid);
          };

          // aws 에 파일 업로드
          const imgUploadResult = await self.imgDropZoneModel.setUploadFile(
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
        self.alertModel.setSimpleShow('파일업로드가 실패 되었습니다.');
      }

      return true;
    });

    /** 휴양림 이미지 AWS 에서 DELETE */
    const setImageDelete = flow(function* () {
      // 삭제대상 이미지 파일들 데이터 수집
      const files = self.imgDropZoneModel.delFiles;

      if (files.length === 0) {
        return true;
      }

      // aws 에서 파일 삭제
      yield Promise.all(
        _.map(files, async (val) => {
          // 업로드 콜백
          const imgDeleteCallback = (percent: number, guid: string, fileName: string) => {
            console.log('img delete status:', percent, fileName, guid);
          };

          // aws 에서 파일 삭제
          const imgDeleteResult = await self.imgDropZoneModel.setUpfileDelete(
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
        self.alertModel.setSimpleShow('파일삭제가 실패 되었습니다.');
      }

      return true;
    });

    /** 맵이미지 AWS 에 UPLOAD */
    const setMapUpload = flow(function* () {
      const files = _.filter(self.mapDropZoneModel.dropZoneFiles, (val) => val.gubun !== 'D');

      if (files.length === 0) {
        return true;
      }

      const mapFile = files[0];

      // 업로드 콜백
      const uploadCallback = (percent: number, guid: string, fileName: string) => {
        console.log('map upload status:', percent, fileName, guid);
      };

      // aws 에 파일 업로드
      const uploadResult = yield self.mapDropZoneModel.setUploadFile(
        mapFile.file,
        mapFile.guid,
        uploadCallback
      );

      // 파일 업로드 실패시
      if (!uploadResult) {
        self.isFileUploadSuccess = false;
        return;
      }

      if (!self.isFileUploadSuccess) {
        self.alertModel.setSimpleShow('맵 파일업로드가 실패 되었습니다.');
      }
    });

    /** 맵이미지 AWS 에서 DELETE */
    const setMapDelete = flow(function* () {
      // 업로드해야할 이미지 파일들 데이터 수집
      const files = self.mapDropZoneModel.delFiles;

      if (files.length === 0) {
        return true;
      }

      const delFile = files[0];

      // 삭제 콜백
      const mapDeleteCallback = (percent: number, guid: string, fileName: string) => {
        console.log('map delete status:', percent, fileName, guid);
      };

      const mapDeleteResult = yield self.mapDropZoneModel.setUpfileDelete(
        delFile.guid,
        mapDeleteCallback
      );

      if (!mapDeleteResult) {
        self.isFileDeleteSuccess = false;
        return;
      }

      if (!self.isFileDeleteSuccess) {
        self.alertModel.setSimpleShow('맵 파일삭제가 실패 되었습니다.');
      }
    });

    /** seqNo set */
    const setForestSeqNo = (forestSeqNo: number) => {
      self.forestSeqNo = forestSeqNo;
    };

    /** 상태값 초기화 */
    const setInit = () => {
      applySnapshot(self, defaultValue);
    };

    return {
      setLoading,
      setForestInfo,
      setChangeHandler,
      setImageUpload,
      setImageDelete,
      setMapUpload,
      setMapDelete,
      setSaveData,
      setForestSeqNo,
      setInit
    };
  })
  .views((self) => {
    /** 필수값 체크 */
    const getValidate = () => {
      if (
        !self.name ||
        !self.addr1 ||
        !self.addr2 ||
        !self.telNo ||
        !self.bussinessNum ||
        !self.desc ||
        !self.simpleDesc
      ) {
        (self as IForestEditModelType).alertModel.setToggleWithSetting({
          bodyContents: '* 휴양림이름/주소/연락처/사업자번호/간단소개 및 소개는 필수값 입니다.',
          secondBtnText: '',
          secondBtnClassName: 'd-none'
        });

        return false;
      }

      return true;
    };

    return { getValidate };
  });

/** 초기화 값 */
const defaultValue = {
  identifier: IDENTIFIER,
  forestSeqNo: 0,
  name: '',
  mainYn: 'N',
  addr1: '',
  addr2: '',
  telNo: '',
  bussinessNum: '',
  desc: '',
  simpleDesc: '',
  imgDropZoneModel: {
    ...dropZoneStore.defaultValue,
    categ: 'F'
  },
  mapDropZoneModel: {
    ...dropZoneStore.defaultValue,
    categ: 'M'
  },
  alertModel: { ...alertTypeAstore.defaultValue },
  loading: false,
  isFileUploadSuccess: true,
  isFileDeleteSuccess: true
};

/** create or initialize */
const create = model.create(defaultValue);

const forestEditStore = {
  create,
  defaultValue,
  model
};

/** 모델 타입 */
export type IForestEditModelType = Instance<typeof model>;

export default forestEditStore;
