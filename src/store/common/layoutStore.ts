import { Instance, types, applySnapshot } from 'mobx-state-tree';

/** model id */
const IDENTIFIER = 'layoutModel';

/**
 * 레이아웃 모델
 */
const model = types
  .model(IDENTIFIER, {
    /** 스토어 아이덴티티 */
    identifier: IDENTIFIER,
    leftMenuIsOpen: types.optional(types.boolean, true)
  })
  .actions((self) => ({
    /** 레프트메뉴 open 여부 set */
    setLeftMenuIsOpen(val: boolean) {
      self.leftMenuIsOpen = val;
    },
    /** 초기화 */
    setInit() {
      applySnapshot(self, defaultValue);
    }
  }));

/** 초기화 값 */
const defaultValue = {
  identifier: IDENTIFIER,
  leftMenuIsOpen: true
};

const create = model.create(defaultValue);

const layoutStore = {
  create,
  defaultValue,
  model
};

export type ILayoutModelType = Instance<typeof model>;

export default layoutStore;
