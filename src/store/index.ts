import { useMemo } from 'react';
import { applySnapshot, Instance, SnapshotIn, SnapshotOut, types } from 'mobx-state-tree';
import { useStaticRendering } from 'mobx-react';
import loginInfoStore from './common/loginInfoStore';
import layoutStore from './common/layoutStore';
import forestListStore from './forestList/forestListStore';
import forestEditStore from './forestEdit/forestEditStore';
import expEditListStore from './expEdit/expEditListStore';
import movieEditListStore from './movieEdit/movieEditListStore';
import notiListStore from './notiList/notiListStore';
import notiEditStore from './notiEdit/notiEditStore';

let initStore: IStore | undefined = null as any;

/** 서버 여부 true/false */
const isServer = typeof window === 'undefined';

/** mobx ssr 사용시 gc 문제 방지설정 (아래 내용 참고)
 * https://mobx.js.org/react-integration.html#tips
 * Server Side Rendering (SSR)
 * If is used in server side rendering context; make sure to call , so that won't subscribe to any observables used, and no GC problems are introduced
 */
useStaticRendering(isServer);

/** root store */
const store = types.model('store', {
  /** 스토어 아이덴티티 */
  identifier: types.optional(types.identifier, 'store'),
  /** login model */
  loginInfoModel: types.optional(loginInfoStore.model, () => loginInfoStore.create),
  /** layout model */
  layoutModel: types.optional(layoutStore.model, () => layoutStore.create),
  /** forest list model */
  forestListModel: types.optional(forestListStore.model, () => forestListStore.create),
  /** forest edit model */
  forestEditModel: types.optional(forestEditStore.model, () => forestEditStore.create),
  /** exp edit model */
  expEditListModel: types.optional(expEditListStore.model, () => expEditListStore.create),
  /** movie edit model */
  movieEditListModel: types.optional(movieEditListStore.model, () => movieEditListStore.create),
  /** noti list model */
  notiListModel: types.optional(notiListStore.model, () => notiListStore.create),
  /** noti edit model */
  notiEditModel: types.optional(notiEditStore.model, () => notiEditStore.create)
});

/** default state value */
const defaultValue = {
  loginInfoModel: { ...loginInfoStore.defaultValue },
  layoutModel: { ...layoutStore.defaultValue },
  forestListModel: { ...forestListStore.defaultValue },
  forestEditModel: { ...forestEditStore.defaultValue },
  expEditListModel: { ...expEditListStore.defaultValue },
  movieEditListModel: { ...movieEditListStore.defaultValue },
  notiListModel: { ...notiListStore.defaultValue },
  notiEditModel: { ...notiEditStore.defaultValue }
};

/** 스토어 initialize */
/** 참고: https://github.com/vercel/next.js/blob/master/examples/with-mobx-state-tree-typescript/store.ts */
const initializeStore = (snapshot: any = null): IStore => {
  const _store = initStore ?? store.create(defaultValue);

  // snapshot 인자값을 _store 스냅샷으로 적용
  if (snapshot) {
    applySnapshot(_store, snapshot);
  }

  // ssr 일 경우 기존 사용하던 상태값을 리턴(snapshot 가 있을 경우 스냅샷으로 적용 후 리턴)
  // For SSG and SSR always create a new store
  if (typeof window === 'undefined') return _store;

  // 클라이언트일 경우 한번만 생성
  // initStore 가 없을 경우 스냅샷 결과 또는 초기화값이 적용된 store 를 initStore 에 적용
  if (!initStore) initStore = _store;

  return initStore;
};

/** mobx 스토어 hooks */
const useStore = (initialState: any = null): IStore => {
  const rtnStore = useMemo(() => initializeStore(initialState), [initialState]);
  return rtnStore;
};

/** store export */
export { initializeStore, useStore };

/** type export */
export interface IStoreInjectType {
  store: IStore;
}
export type IStore = Instance<typeof store>;
export type IStoreSnapshotIn = SnapshotIn<typeof store>;
export type IStoreSnapshotOut = SnapshotOut<typeof store>;
export type { ILoginInfoModelType } from './common/loginInfoStore';
export type { IAlertTypeAmodelType } from './common/alertTypeAstore';
export type { ILayoutModelType } from './common/layoutStore';
export type { IForestListModelType } from './forestList/forestListStore';
export type { IDropZoneModelType } from './common/dropZoneStore';
export type { IForestEditModelType } from './forestEdit/forestEditStore';
export type { IExpEditModelType } from './expEdit/expEditStore';
export type { IExpEditListModelType } from './expEdit/expEditListStore';
export type { IMovieEditModelType } from './movieEdit/movieEditStore';
export type { IMovieEditListModelType } from './movieEdit/movieEditListStore';
export type { IExpCodeModelType } from './movieEdit/expCodeStore';
export type { INotiListModelType } from './notiList/notiListStore';
export type { INotiEditModelType } from './notiEdit/notiEditStore';
