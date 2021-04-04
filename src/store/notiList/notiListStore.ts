import { Instance, types, applySnapshot } from 'mobx-state-tree';
import alertTypeAstore from '~/store/common/alertTypeAstore';

/** model id */
const IDENTIFIER = 'notiListModel';

/**
 *  notiList 모델
 */
const model = types
  .model(IDENTIFIER, {
    /** 스토어 아이덴티티 */
    identifier: types.optional(types.identifier, IDENTIFIER),
    /** ALERT 모델 */
    alertModel: types.optional(alertTypeAstore.model, () => alertTypeAstore.create)
  })
  .actions((self) => ({
    /** 상태값 초기화 */
    setInit() {
      applySnapshot(self, defaultValue);
    }
  }))
  .views((self) => ({}));

/** 초기화 값 */
const defaultValue = {
  identifier: IDENTIFIER,
  alertModel: { ...alertTypeAstore.defaultValue }
};

/** create or initialize */
const create = model.create(defaultValue);

const notiListStore = {
  create,
  defaultValue,
  model
};

/** 모델 타입 */
export type INotiListModelType = Instance<typeof model>;

export default notiListStore;
