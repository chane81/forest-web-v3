import { Instance, types, applySnapshot } from 'mobx-state-tree';

/** model id */
const IDENTIFIER = 'alertTypeAmodel';

interface IAlertTypeASettingInfo {
  title?: string;
  bodyContents?: string;
  firstBtnText?: string;
  firstBtnClassName?: string;
  opFirstBtnClick?: () => void | Promise<void>;
  secondBtnText?: string;
  secondBtnClassName?: string;
  opSecondBtnClick?: () => void | Promise<void>;
  opClosed?: () => void;
  isClosedInit?: boolean;
}

/**
 * 모달창 모델
 */
const model = types
  .model(IDENTIFIER, {
    /** 스토어 아이덴티티 */
    identifier: types.optional(types.identifier, IDENTIFIER),
    /** alert open 여부 */
    isOpen: types.optional(types.boolean, false),
    /** 제목 */
    title: types.optional(types.string, ''),
    /** 내용 */
    bodyContents: types.optional(types.string, ''),
    /** 첫번째 버튼 text */
    firstBtnText: types.optional(types.string, ''),
    /** 첫번째 버튼 css class */
    firstBtnClassName: types.optional(types.string, ''),
    /** 두번째 버튼 text */
    secondBtnText: types.optional(types.string, ''),
    /** 두번째 버튼 css class */
    secondBtnClassName: types.optional(types.string, ''),
    /** 닫기시 초기화 여부 */
    isClosedInit: types.optional(types.boolean, false)
  })
  .volatile<{
    opFirstBtnClick: () => void;
    opSecondBtnClick: () => void;
    opClosed: () => void;
  }>((self) => ({
    /** 첫번째 버튼 클릭 이벤트 핸들러 */
    opFirstBtnClick: null,
    /** 두번째 버튼 클릭 이벤트 핸들러 */
    opSecondBtnClick: null,
    /** closed 이벤트 핸들러 */
    opClosed: null
  }))
  .actions((self) => {
    /** 첫번째 버튼 이벤트 핸들러 등록 */
    const setFirstBtnClick = (callback) => {
      self.opFirstBtnClick = callback;
    };

    /** 두번째 버튼 이벤트 핸들러 등록 */
    const setSecondBtnClick = (callback) => {
      self.opSecondBtnClick = callback;
    };

    /** 닫기 버튼 클릭시 콜백 */
    const setClosed = (callback) => {
      self.opClosed = callback;

      if (self.isClosedInit) {
        setInit();
      }
    };

    /** 토글 */
    const setToggle = () => {
      self.isOpen = !self.isOpen;
    };

    /** simple 모달 show */
    const setSimpleShow = (contents: string, title?: string, secondBtnShow?: boolean) => {
      // alert 모델 초기화
      setInit();

      self.bodyContents = contents;

      if (title) {
        self.title = title;
      }

      if (!secondBtnShow) {
        self.secondBtnClassName = 'd-none';
      }

      self.isOpen = !self.isOpen;
    };

    /** 토글 with 세팅정보 */
    const setToggleWithSetting = (params: IAlertTypeASettingInfo) => {
      // alert 모델 초기화
      setInit();

      if (params.title) {
        self.title = params.title;
      }
      if (params.bodyContents) {
        self.bodyContents = params.bodyContents;
      }
      if (params.firstBtnText) {
        self.firstBtnText = params.firstBtnText;
      }
      if (params.firstBtnClassName) {
        self.firstBtnClassName = params.firstBtnClassName;
      }
      if (params.opFirstBtnClick) {
        self.opFirstBtnClick = params.opFirstBtnClick;
      }
      if (params.secondBtnText) {
        self.secondBtnText = params.secondBtnText;
      }
      if (params.secondBtnClassName) {
        self.secondBtnClassName = params.secondBtnClassName;
      }
      if (params.opSecondBtnClick) {
        self.opSecondBtnClick = params.opSecondBtnClick;
      }
      if (params.opClosed) {
        self.opClosed = params.opClosed;
      }
      if (params.isClosedInit) {
        self.isClosedInit = params.isClosedInit;
      }

      self.isOpen = !self.isOpen;
    };

    /** 오픈 여부 */
    const setOpen = (val: boolean) => {
      self.isOpen = val;
    };

    /** 타이틀 set */
    const setTitle = (val: string) => {
      self.title = val;
    };

    /** 컨텐츠 바디 set */
    const setBodyContents = (val: string) => {
      self.bodyContents = val;
    };

    /** 첫번째 버튼 set */
    const setFirstBtnText = (val: string) => {
      self.firstBtnText = val;
    };

    /** 첫번째 버튼 css class set */
    const setFirstBtnClassName = (val: string) => {
      self.firstBtnClassName = val;
    };

    /** 두번째 버튼 set */
    const setSecondBtnText = (val: string) => {
      self.secondBtnText = val;
    };

    /** 두번째 버튼 css class set */
    const setSecondBtnClassName = (val: string) => {
      self.secondBtnClassName = val;
    };

    /** 초기화 */
    const setInit = () => {
      // volatile init
      self.opFirstBtnClick = null;
      self.opSecondBtnClick = null;
      self.opClosed = null;

      applySnapshot(self, defaultValue);
    };

    return {
      setFirstBtnClick,
      setSecondBtnClick,
      setClosed,
      setToggle,
      setSimpleShow,
      setToggleWithSetting,
      setOpen,
      setTitle,
      setBodyContents,
      setFirstBtnText,
      setFirstBtnClassName,
      setSecondBtnText,
      setSecondBtnClassName,
      setInit
    };
  });

/** 초기화 값 */
const defaultValue = {
  identifier: IDENTIFIER,
  isOpen: false,
  title: '알림',
  bodyContents: '',
  firstBtnText: '확인',
  firstBtnClassName: 'd-block',
  opFirstBtnClick: null,
  secondBtnText: '취소',
  secondBtnClassName: 'd-block',
  opSecondBtnClick: null,
  opClosed: null,
  isClosedInit: false
};

const create = model.create(defaultValue);

const alertTypeAstore = {
  create,
  defaultValue,
  model
};

export type IAlertTypeAmodelType = Instance<typeof model>;

export default alertTypeAstore;
