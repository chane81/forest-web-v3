import { Instance, types, applySnapshot, flow, hasParent } from 'mobx-state-tree';
import alertTypeAstore from '~/store/common/alertTypeAstore';
import { apiCall } from '~/utils/fetchUtils';

/** model id */
const IDENTIFIER = 'notiEditModel';

/**
 *  notiEdit 모델
 */
const model = types
  .model(IDENTIFIER, {
    /** 스토어 아이덴티티 */
    identifier: types.optional(types.identifier, IDENTIFIER),
    /** 게시글 번호 */
    boardSeqNo: types.optional(types.number, 0),
    /** 제목 */
    title: types.maybeNull(types.string),
    /** 내용 */
    contents: types.maybeNull(types.string),
    /** URL 1 */
    url1: types.maybeNull(types.string),
    /** URL 2 */
    url2: types.maybeNull(types.string),
    /** URL 3 */
    url3: types.maybeNull(types.string),
    /** 사용여부 Y/N */
    useYn: types.maybeNull(types.string),
    /** ALERT 모델 */
    alertModel: types.optional(alertTypeAstore.model, () => alertTypeAstore.create),
    /** 로딩 유무 */
    loading: types.optional(types.boolean, false)
  })
  .actions((self) => ({
    /** 로딩 설정 */
    setLoading(val: boolean) {
      self.loading = val;
    },
    /** 공지글 가져와 상태값에 세팅 */
    setNotiInfo(notiInfo: any) {
      const result = notiInfo;

      if (result.RESULT) {
        self.title = result.TITLE;
        self.contents = result.CONTENTS;
        self.url1 = result.URL_1;
        self.url2 = result.URL_2;
        self.url3 = result.URL_3;
        self.useYn = result.USE_YN;
      }
    },
    /** input 입력값 상태값에 저장 */
    setChangeHandler(fieldName: string, val: string) {
      self[fieldName] = val;
    },
    /** 데이터 저장 */
    setSaveData: flow(function* (callback?: (boardSeqNo: number) => void) {
      // loading true
      (self as INotiEditModelType).setLoading(true);

      // api call
      const result = yield apiCall({
        url: '/setBoardSave',
        method: 'POST',
        data: {
          BOARD_SEQ_NO: self.boardSeqNo,
          TITLE: self.title,
          CONTENTS: self.contents,
          CATEG: 'N',
          URL_1: self.url1,
          URL_2: self.url2,
          URL_3: self.url3,
          USE_YN: self.useYn
        }
      });

      // loading false
      (self as INotiEditModelType).setLoading(false);

      // alert 모델
      const alertModel = (self as INotiEditModelType).alertModel;

      // alert 모델 초기화
      alertModel.setInit();

      // DB 결과 정상이면
      if (result.RESULT_CODE === '00' && hasParent(self)) {
        // alert 띄우기
        alertModel.setToggleWithSetting({
          bodyContents: '저장 되었습니다.',
          opFirstBtnClick: () => callback?.(result.RET_BOARD_SEQ_NO),
          secondBtnText: '',
          secondBtnClassName: 'd-none'
        });
      } else {
        // alert 띄우기
        alertModel.setToggleWithSetting({
          bodyContents: '저장이 실패 되었습니다.<br />' + result.RESULT_MSG,
          secondBtnText: '',
          secondBtnClassName: 'd-none'
        });
      }
    }),
    /** seqNo set */
    setBoardSeqNo(boardSeqNo: number) {
      self.boardSeqNo = boardSeqNo;
    },
    /** 상태값 초기화 */
    setInit(initState?: any) {
      applySnapshot(self, initState ?? defaultValue);
    }
  }))
  .views((self) => ({
    /** 필수값 체크 */
    getValidate() {
      if (!self.title.trim() || !self.contents.trim()) {
        (self as INotiEditModelType).alertModel.setToggleWithSetting({
          bodyContents: '* 공지 제목/내용은 필수값 입니다.',
          secondBtnText: '',
          secondBtnClassName: 'd-none'
        });

        return false;
      }

      return true;
    }
  }));

/** 초기화 값 */
const defaultValue = {
  identifier: IDENTIFIER,
  boardSeqNo: 0,
  title: '',
  contents: '',
  url1: '',
  url2: '',
  url3: '',
  useYn: 'Y',
  alertModel: { ...alertTypeAstore.defaultValue },
  loading: false
};

/** create or initialize */
const create = model.create(defaultValue);

const notiEditStore = {
  create,
  defaultValue,
  model
};

/** 모델 타입 */
export type INotiEditModelType = Instance<typeof model>;

export default notiEditStore;
