import { Instance, types, applySnapshot, destroy, flow } from 'mobx-state-tree';
import alertTypeAstore from '~/store/common/alertTypeAstore';
import { IFile } from '~/store/common/dropZoneStore';
import { apiCall } from '~/utils/fetchUtils';
import _ from 'lodash';
import { getFileNameFromUrl } from '~/utils/fileUtils';
import { v4 as uuidv4 } from 'uuid';
import expEditStore, { IExpEditModelType } from '~/store/expEdit/expEditStore';

/** model id */
const IDENTIFIER = 'expEditListModel';

/**
 *  체험 리스트 모델
 */
const model = types
  .model(IDENTIFIER, {
    /** 스토어 아이덴티티 */
    identifier: types.optional(types.identifier, IDENTIFIER),
    /** 휴양림 번호 */
    forestSeqNo: types.optional(types.number, 0),
    /** 체험리스트 모델 */
    expListModel: types.optional(types.array(expEditStore.model), []),
    /** ALERT 모델 */
    alertModel: types.optional(alertTypeAstore.model, () => alertTypeAstore.create),
    /** 로딩 유무 */
    loading: types.optional(types.boolean, false)
  })
  .actions((self) => ({
    /** forestSeqNo set */
    setForestSeqNo(forestSeqNo: number) {
      self.forestSeqNo = forestSeqNo;
    },
    /** 체험 추가 시 (휴양림 seq_no는 mng store 에서 가져옴) */
    setAddEmptyExpInfo() {
      self.expListModel.push({
        ...expEditStore.defaultValue,
        forestSeqNo: self.forestSeqNo
      });
    },
    /** 체험 삭제 */
    setRemoveExpInfo: flow(function* (store: IExpEditModelType) {
      let result;

      if (!!store.expSeqNo) {
        // loading true
        self.loading = true;

        // api call
        result = yield apiCall({
          url: '/setExpDelete',
          method: 'GET',
          params: {
            EXP_SEQ_NO: store.expSeqNo
          }
        });

        // loading false
        self.loading = false;
      }

      // DB 결과 정상이거나 버튼눌러 바로 추가한경우(DB 데이터 아닌 경우)
      if (!!!store.expSeqNo || result.RESULT_CODE === '00') {
        // 상태값에서 삭제
        destroy(store);

        // alert 띄우기
        self.alertModel.setToggleWithSetting({
          bodyContents: '삭제 되었습니다.',
          secondBtnText: '',
          secondBtnClassName: 'd-none'
        });
      } else {
        // alert 띄우기
        self.alertModel.setToggleWithSetting({
          bodyContents: '삭제가 실패 되었습니다.<br />' + result.RESULT_MSG,
          secondBtnText: '',
          secondBtnClassName: 'd-none'
        });
      }
    }),
    /** 체험 리스트 정보 주입 */
    setExpEditListModel(expList: any[]) {
      _.each(expList, (val, idx) => {
        // 이미지 파일
        const imgs: IFile[] = _.map<any, IFile>(val.IMG_LIST, (args) => ({
          gubun: 'D',
          imgSeqNo: args.IMG_SEQ_NO,
          sort: args.SORT,
          url: args.IMG_URL,
          name: getFileNameFromUrl(args.IMG_URL),
          guid: uuidv4(),
          file: new File([''], getFileNameFromUrl(args.IMG_URL))
        }));

        // 체험 리스트 모델에 push
        // 휴양림 seq_no 는 mng store 에서 가져옴
        self.expListModel.push({
          forestSeqNo: self.forestSeqNo,
          expSeqNo: val.EXP_SEQ_NO,
          name: val.NAME,
          categ1: val.CATEG1,
          categ2: val.CATEG2,
          title: val.TITLE,
          desc: val.DESCRIPT,
          mainYn: val.MAIN_YN,
          dropZoneModel: {
            dropZoneFiles: imgs,
            delFiles: [],
            categ: 'E'
          }
        });
      });
    },
    /** 로딩 설정 */
    setLoading(val: boolean) {
      self.loading = val;
    },
    /** 상태값 초기화 */
    setInit() {
      applySnapshot(self, defaultValue);
    }
  }))
  .views((self) => ({}));

/** 초기화 값 */
const defaultValue = {
  identifier: IDENTIFIER,
  forestSeqNo: 0,
  expListModel: [],
  alertModel: { ...alertTypeAstore.defaultValue },
  loading: false
};

/** create or initialize */
const create = model.create(defaultValue);

const expEditListStore = {
  create,
  defaultValue,
  model
};

/** 모델 타입 */
export type IExpEditListModelType = Instance<typeof model>;

export default expEditListStore;
