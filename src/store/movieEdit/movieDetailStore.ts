import { Instance, types, applySnapshot } from 'mobx-state-tree';

/** model id */
const IDENTIFIER = 'movieDetailModel';

/**
 *  동영상 상세 모델 (영상의 체험 시분초 표시 관련)
 */
const model = types
  .model(IDENTIFIER, {
    /** 스토어 아이덴티티 */
    identifier: types.optional(types.identifier, IDENTIFIER),
    /** 체험 번호 */
    expSeqNo: types.optional(types.number, 0),
    /** 해당 체험 재생 타임라인 */
    pointTime: types.optional(types.string, ''),
    /** 소트 */
    sort: types.optional(types.number, 0)
  })
  .actions((self) => ({
    /** 파일을 제외한 input 입력값 상태값에 저장 */
    setChangeHandler(fieldName: string, val: string) {
      self[fieldName] = val;
    },
    /** 체험 변경시 저장 */
    setExpSeqNo(val: number) {
      self.expSeqNo = val;
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
  expSeqNo: 0,
  pointTime: '',
  sort: 1
};

/** create or initialize */
const create = model.create(defaultValue);

const movieDetailStore = {
  create,
  defaultValue,
  model
};

/** 모델 타입 */
export type IMovieDetailModelType = Instance<typeof model>;

export default movieDetailStore;
