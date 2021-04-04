import { Instance, types, applySnapshot } from 'mobx-state-tree';

/** model id */
const IDENTIFIER = 'dropZoneFileModel';

/** 드랍존 파일 모델 */
const model = types
  .model(IDENTIFIER, {
    identifier: types.optional(types.identifier, IDENTIFIER),
    name: types.optional(types.string, ''),
    url: types.optional(types.string, ''),
    sort: types.optional(types.maybeNull(types.number), null),
    imgSeqNo: types.optional(types.maybeNull(types.number), null),
    gubun: types.optional(types.string, ''),
    guid: types.optional(types.string, ''),
    file: types.optional(types.frozen<File | null>(), null),
    data: types.optional(types.frozen<string | ArrayBuffer | null>(), null)
  })
  .actions((self) => {
    /** 초기화 */
    const setInit = () => {
      applySnapshot(self, defaultValue);
    };

    return { setInit };
  });

/** 초기화 값 */
const defaultValue = {
  identifier: IDENTIFIER,
  name: '',
  url: '',
  sort: 1,
  imgSeqNo: 0,
  gubun: '',
  guid: '',
  file: null,
  data: null
};

const create = model.create(defaultValue);

const dropZoneFileStore = {
  create,
  defaultValue,
  model
};

/** model type */
export type IDropZoneFileModelType = Instance<typeof model>;

export default dropZoneFileStore;
