import { Instance, destroy, types, applySnapshot, flow, getParent } from 'mobx-state-tree';
import dropZoneStore from '~/store/common/dropZoneStore';
import { apiCall } from '~/utils/fetchUtils';
import xmlJs from 'xml-js';
import _ from 'lodash';
import { IAlertTypeAmodelType } from '~/store/common/alertTypeAstore';
import movieDetailStore, { IMovieDetailModelType } from '~/store/movieEdit/movieDetailStore';
import { IMovieEditListModelType } from './movieEditListStore';
import { IExpCodeModelType } from './expCodeStore';

/** model id */
const IDENTIFIER = 'movieEditModel';

/**
 *  동영상 모델
 */
const model = types
  .model(IDENTIFIER, {
    /** 스토어 아이덴티티 */
    identifier: types.optional(types.identifier, IDENTIFIER),
    /** 휴양림 번호 */
    forestSeqNo: types.optional(types.number, 0),
    /** 동영상 번호 */
    movieSeqNo: types.optional(types.number, 0),
    /** 대분류 */
    categ1: types.optional(types.string, 'A'),
    /** 동영상 url */
    url: types.optional(types.string, ''),
    /** 동영상 체험 시분초 표시 모델 */
    movieDetailModel: types.optional(types.array(movieDetailStore.model), []),
    /** 동영상 파일 모델 */
    dropZoneModel: types.optional(dropZoneStore.model, () => dropZoneStore.create),
    /** 파일 upload 성공여부 true/false */
    isFileUploadSuccess: types.optional(types.boolean, true),
    /** 파일 delete 성공여부 true/false */
    isFileDeleteSuccess: types.optional(types.boolean, true),
    /** 로딩 유무 */
    loading: types.optional(types.boolean, false),
    /** 파일 업로드 퍼센트 */
    percent: types.optional(types.number, 0)
  })
  .actions((self) => {
    const root = self as IMovieEditModelType;

    /** 파일 업로드 퍼센트 set */
    const setPercent = (val: number) => {
      self.percent = val;
    };

    /** 로딩 설정 */
    const setLoading = (val: boolean) => {
      self.loading = val;
    };

    /** 파일을 제외한 input 입력값 상태값에 저장 */
    const setChangeHandler = (fieldName: string, val: string) => {
      self[fieldName] = val;
    };

    /** alert */
    const showAlert = (
      contents: string,
      movieSeqNo?: number,
      callback?: (movieSeqNo: number) => void
    ) => {
      // alert 모델
      const alertModel = root.getAlertModel();

      alertModel.setToggleWithSetting({
        bodyContents: contents,
        opFirstBtnClick: () => callback?.(movieSeqNo),
        secondBtnText: '',
        secondBtnClassName: 'd-none'
      });
    };

    // 파일 upload/delete 수행 실패시 call
    const resultFalseProc = (fileResult: boolean) => {
      if (!fileResult) {
        setLoading(false);

        return false;
      }
    };

    /** 데이터 저장 */
    const setSaveData = flow(function* (callback?: (expSeqNo: number) => void) {
      // 중복된 계절구분인지 체크
      const movieListModel: IMovieEditModelType[] = getParent(self);
      if (_.filter(movieListModel, { categ1: self.categ1 }).length > 1) {
        showAlert('중복된 계절구분이 존재합니다.<br />데이터를 확인해 주세요.');

        return;
      }

      // loading true
      self.loading = true;

      // 파일 upload/delete 여부 초기화
      self.isFileUploadSuccess = true;
      self.isFileDeleteSuccess = true;

      /** 동영상 파일 AWS 에 업로드 */
      const uploadResult = yield setMovieUpload();
      resultFalseProc(uploadResult);
      /** 동영상 파일 AWS 에 업로드 */

      /** 동영상 삭제대상 AWS 에서 DELETE */
      const deleteResult = yield setMovieDelete();
      resultFalseProc(deleteResult);
      /** 동영상 삭제대상 AWS 에서 DELETE */

      /** DB에 SAVE */
      // 체험 및 영상표시 상세 데이터 수집
      const detailMovieData = _.chain(self.movieDetailModel)
        .filter((val) => !!val.pointTime.trim())
        .map((val) => ({
          EXP_SEQ_NO: val.expSeqNo,
          POINT_TIME: val.pointTime,
          SORT: val.sort
        }))
        .value();

      // xml 로 파싱
      const xmlData = xmlJs.js2xml(
        {
          ROOT: {
            DATA: [...detailMovieData]
          }
        },
        {
          compact: true,
          spaces: 2
        }
      );

      const { dropZoneFiles } = self.dropZoneModel;
      const url = dropZoneFiles.length > 0 ? dropZoneFiles[0].url : '';

      // api call
      const result = yield apiCall({
        url: '/setMovieSave',
        method: 'POST',
        data: {
          FOREST_SEQ_NO: self.forestSeqNo,
          MOVIE_SEQ_NO: self.movieSeqNo,
          CATEG1: self.categ1,
          URL: url,
          XML_DETAIL_DATA: xmlData
        }
      });

      if (!result.RESULT) {
        // alert 띄우기
        showAlert('저장이 실패 되었습니다.');
      } else {
        // 동영상 seq no 를 상태값에 저장
        self.movieSeqNo = parseInt(result.RET_MOVIE_SEQ_NO, 10);
        self.dropZoneModel.dropZoneFiles[0].gubun = 'D';

        // alert 띄우기
        showAlert('저장 되었습니다.', result.RET_MOVIE_SEQ_NO);
      }
      /** DB에 SAVE */

      // loading false
      self.loading = false;
    });

    /** 동영상 AWS에 UPLOAD */
    const setMovieUpload = flow(function* () {
      // 업로드해야할 이미지 파일들 데이터 수집
      const files = _.filter(self.dropZoneModel.dropZoneFiles, (val) => val.gubun !== 'D');

      if (files.length === 0) {
        return true;
      }

      const movieFile = files[0];

      // 업로드 콜백
      const uploadCallback = (percent: number, guid: string, fileName: string) => {
        root.setPercent(percent);

        console.log('movie upload status:', percent, fileName, guid);
      };

      // aws 에 파일 업로드
      const uploadResult = yield self.dropZoneModel.setUploadFile(
        movieFile.file,
        movieFile.guid,
        uploadCallback
      );

      // 파일 업로드 실패시
      if (!uploadResult) {
        self.isFileUploadSuccess = false;
        return false;
      }

      if (!self.isFileUploadSuccess) {
        root.getAlertModel().setSimpleShow('동영상 파일업로드가 실패 되었습니다.');
      }

      return true;
    });

    /** 동영상 AWS 에서 DELETE */
    const setMovieDelete = flow(function* () {
      // 삭제대상 파일들 데이터 수집
      const files = self.dropZoneModel.delFiles;

      if (files.length === 0) {
        return true;
      }

      // aws 에서 파일 삭제
      const delFile = files[0];

      // 삭제 콜백
      const callBack = (percent: number, guid: string, fileName: string) => {
        console.log('movie delete status:', percent, fileName, guid);
      };

      const deleteResult = yield self.dropZoneModel.setUpfileDelete(delFile.guid, callBack);

      if (!deleteResult) {
        self.isFileDeleteSuccess = false;
        return false;
      }

      if (!self.isFileDeleteSuccess) {
        root.getAlertModel().setSimpleShow('동영상 파일삭제가 실패 되었습니다.');
      }

      return true;
    });

    /** 체험 및 영상 분초 정보 추가시 */
    const setAddMovieDetail = () => {
      const movieEditModel = getParent<IMovieEditListModelType>(getParent(self));
      const expCnt = movieEditModel.expListModel.length;

      if (self.movieDetailModel.length < expCnt) {
        self.movieDetailModel.push({
          ...movieDetailStore.defaultValue,
          sort: self.movieDetailModel.length + 1
        });
      } else {
        movieEditModel.alertModel.setSimpleShow('체험개수 이상 추가할 수 없습니다.');
      }
    };

    /** 체험 및 영상 분초 정보 제거시 */
    const setRemoveMovieDetail = (val: IMovieDetailModelType) => {
      destroy(val);
    };

    const setDestory = () => {
      destroy(self);
    };

    /** 상태값 초기화 */
    const setInit = () => {
      applySnapshot(self, defaultValue);
    };

    return {
      setChangeHandler,
      setSaveData,
      setAddMovieDetail,
      setRemoveMovieDetail,
      setLoading,
      setMovieUpload,
      setMovieDelete,
      showAlert,
      setPercent,
      resultFalseProc,
      setDestory,
      setInit
    };
  })
  .views((self) => {
    const root = self as IMovieEditModelType;

    /** alert 모델 가져오기 */
    const getAlertModel = (): IAlertTypeAmodelType => {
      return getParent<IMovieEditListModelType>(getParent(self)).alertModel;
    };

    /** 체험 리스트 모델 가져오기 */
    const getExpListModel = (): IExpCodeModelType[] => {
      return getParent<IMovieEditListModelType>(getParent(self)).expListModel;
    };

    /** 필수값 체크 */
    const getValidate = () => {
      if (self.dropZoneModel.dropZoneFiles.length === 0) {
        getAlertModel().setToggleWithSetting({
          bodyContents: '* 계절 구분/동영상파일은 필수값 입니다.',
          secondBtnText: '',
          secondBtnClassName: 'd-none'
        });

        return false;
      }

      return true;
    };

    return { getAlertModel, getExpListModel, getValidate };
  });

/** 초기화 값 */
const defaultValue = {
  identifier: IDENTIFIER,
  forestSeqNo: 0,
  movieSeqNo: 0,
  categ1: 'A',
  url: '',
  movieDetailModel: [
    {
      expSeqNo: 0,
      pointTime: '',
      sort: 1
    }
  ],
  dropZoneModel: {
    ...dropZoneStore.defaultValue,
    categ: 'V'
  },
  isFileUploadSuccess: true,
  isFileDeleteSuccess: true,
  loading: false,
  percent: 0
};

/** create or initialize */
const create = model.create(defaultValue);

const movieEditStore = {
  create,
  defaultValue,
  model
};

/** 모델 타입 */
export type IMovieEditModelType = Instance<typeof model>;

export default movieEditStore;
