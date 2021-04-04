import { Instance, types } from 'mobx-state-tree';

/** model id */
const IDENTIFIER = 'expCodeModel';

/** 동영상 카드에 사용될 체험 정보 모델 */
const model = types.model(IDENTIFIER, {
  /** 스토어 아이덴티티 */
  identifier: types.optional(types.identifier, IDENTIFIER),
  expSeqNo: types.number,
  name: types.string
});

/** 초기화 값 */
const defaultValue = {
  identifier: IDENTIFIER,
  expSeqNo: 0,
  name: ''
};

/** create or initialize */
const create = model.create(defaultValue);

const expCodeStore = {
  create,
  defaultValue,
  model
};

/** 모델 타입 */
export type IExpCodeModelType = Instance<typeof model>;

export default expCodeStore;
