import { Instance, types, applySnapshot } from 'mobx-state-tree';

/** model id */
const IDENTIFIER = 'loginInfoModel';

/**
 * 로그인정보 모델
 */
const model = types
  .model(IDENTIFIER, {
    /** 스토어 아이덴티티 */
    identifier: IDENTIFIER,
    userSeqNo: types.number,
    email: types.string,
    name: types.string,
    gubun: types.string,
    phoneNo: types.string
  })
  .actions((self) => ({
    /** 로그인정보 set */
    setLoginInfo(userSeqNo: number, email: string, name: string, gubun: string, phoneNo: string) {
      self.userSeqNo = userSeqNo;
      self.email = email;
      self.name = name;
      self.gubun = gubun;
      self.phoneNo = phoneNo;
    },
    /** 초기화 */
    setInit() {
      applySnapshot(self, defaultValue);
    }
  }));

/** 초기화 값 */
const defaultValue = {
  identifier: IDENTIFIER,
  userSeqNo: 0,
  email: '',
  name: '',
  gubun: '',
  phoneNo: ''
};

const create = model.create(defaultValue);

const loginInfoStore = {
  create,
  defaultValue,
  model
};

export type ILoginInfoModelType = Instance<typeof model>;

export default loginInfoStore;
