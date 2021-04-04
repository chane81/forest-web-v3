import { Instance, types, applySnapshot, destroy, flow } from 'mobx-state-tree';
import alertTypeAstore from '~/store/common/alertTypeAstore';
import { IFile } from '~/store/common/dropZoneStore';
import { apiCall } from '~/utils/fetchUtils';
import _ from 'lodash';
import { getFileNameFromUrl } from '~/utils/fileUtils';
import { v4 as uuidv4 } from 'uuid';
import movieEditStore, { IMovieEditModelType } from '~/store/movieEdit/movieEditStore';
import expCodeStore from '~/store/movieEdit/expCodeStore';
import movieDetailStore from '~/store/movieEdit/movieDetailStore';

/** model id */
const IDENTIFIER = 'movieEditListModel';

/**
 *  동영상 리스트 모델
 */
const model = types
  .model(IDENTIFIER, {
    /** 스토어 아이덴티티 */
    identifier: types.optional(types.identifier, IDENTIFIER),
    /** 휴양림 번호 */
    forestSeqNo: types.optional(types.number, 0),
    /** 동영상리스트 모델 */
    movieListModel: types.optional(types.array(movieEditStore.model), []),
    /** ALERT 모델 */
    alertModel: types.optional(alertTypeAstore.model, () => alertTypeAstore.create),
    /** 체험 리스트 */
    expListModel: types.optional(types.array(expCodeStore.model), [])
  })
  .actions((self) => {
    /** forestSeqNo set */
    const setForestSeqNo = (forestSeqNo: number) => {
      self.forestSeqNo = forestSeqNo;
    };

    /** alert */
    const showAlert = (
      contents: string,
      movieSeqNo?: number,
      callback?: (movieSeqNo: number) => void
    ) => {
      // alert 모델
      self.alertModel.setToggleWithSetting({
        bodyContents: contents,
        opFirstBtnClick: () => callback?.(movieSeqNo),
        secondBtnText: '',
        secondBtnClassName: 'd-none'
      });
    };

    /** 체험 리스트 정보 주입 */
    const setExpListModel = (expList: any[]) => {
      _.map(expList, (val) => {
        self.expListModel.push({
          expSeqNo: val.EXP_SEQ_NO,
          name: val.NAME
        });
      });
    };

    /** 동영상 리스트 정보 주입 */
    const setMovieEditListModel = (movieList: any[]) => {
      _.each(movieList, (val, idx) => {
        // 동영상 상세 리스트
        let detailList = _.map(val.MOVIE_DETAIL_LIST, (args) => ({
          expSeqNo: args.EXP_SEQ_NO,
          pointTime: args.POINT_TIME,
          sort: args.SORT
        }));

        // 동영상 상세 정보가 없을 경우 기본값을 상태값으로 넣어줌
        detailList =
          detailList && detailList.length === 0
            ? [{ ...movieDetailStore.defaultValue }]
            : detailList;

        // 파일 드랍존 모델 바인딩 데이터
        const movieFile: IFile[] = [
          {
            gubun: 'D',
            imgSeqNo: 1,
            sort: 1,
            url: val.URL,
            name: getFileNameFromUrl(val.URL),
            guid: uuidv4(),
            file: new File([''], getFileNameFromUrl(val.URL))
          }
        ];

        // 동영상 리스트 모델에 push
        self.movieListModel.push({
          forestSeqNo: self.forestSeqNo,
          movieSeqNo: val.MOVIE_SEQ_NO,
          categ1: val.CATEG1,
          movieDetailModel: detailList,
          dropZoneModel: {
            dropZoneFiles: movieFile,
            delFiles: [],
            categ: 'V'
          },
          percent: 100
        });
      });
    };

    /** 동영상 추가 */
    const setAddEmptyMovieInfo = () => {
      // 계절구분
      const arrCateg1 = _.difference(
        ['A', 'B', 'C', 'D'],
        _.map(self.movieListModel, (val) => val.categ1)
      );
      const categ1 = arrCateg1.length > 0 ? arrCateg1[0] : '';

      if (!categ1) {
        self.alertModel.setSimpleShow(
          '더 추가할 수 없습니다.<br/>계절구분 개수만큼 추가가 가능합니다.'
        );
        return;
      }

      self.movieListModel.push({
        ...movieEditStore.defaultValue,
        categ1,
        forestSeqNo: self.forestSeqNo,
        movieDetailModel: self.expListModel.length > 0 && [
          {
            expSeqNo: self.expListModel[0].expSeqNo,
            pointTime: '',
            sort: 1
          }
        ]
      });
    };

    /** 동영상 삭제 */
    const setRemoveData = flow(function* (store: IMovieEditModelType) {
      let result;

      // 파일 upload/delete 여부 초기화
      store.isFileUploadSuccess = true;
      store.isFileDeleteSuccess = true;

      if (!!store.movieSeqNo) {
        // loading true
        store.setLoading(true);

        /** 동영상 삭제대상 AWS 에서 DELETE */
        const delFile =
          store.dropZoneModel.dropZoneFiles.length > 0
            ? store.dropZoneModel.dropZoneFiles[0]
            : null;
        if (delFile) {
          store.dropZoneModel.setDelFile(delFile.guid);

          const deleteResult = yield store.setMovieDelete();
          store.resultFalseProc(deleteResult);
        }
        /** 동영상 삭제대상 AWS 에서 DELETE */

        /** DB에 SAVE */
        // api call
        result = yield apiCall({
          url: '/setMovieDelete',
          method: 'GET',
          params: {
            MOVIE_SEQ_NO: store.movieSeqNo
          }
        });

        if (!result.RESULT) {
          // alert 띄우기
          showAlert('삭제가 실패 되었습니다.');
        } else {
          // loading false
          store.setLoading(false);

          // alert 띄우기
          showAlert('삭제 되었습니다.');
        }
        /** DB에 SAVE */
      }

      // 상태값에서 삭제
      destroy(store);
    });

    /** 상태값 초기화 */
    const setInit = () => {
      applySnapshot(self, defaultValue);
    };

    return {
      setForestSeqNo,
      setExpListModel,
      setMovieEditListModel,
      setAddEmptyMovieInfo,
      setRemoveData,
      setInit
    };
  })
  .views((self) => ({}));

/** 초기화 값 */
const defaultValue = {
  identifier: IDENTIFIER,
  forestSeqNo: 0,
  movieListModel: [],
  alertModel: { ...alertTypeAstore.defaultValue },
  expListModel: [],
  percent: 0
};

/** create or initialize */
const create = model.create(defaultValue);

const movieEditListStore = {
  create,
  defaultValue,
  model
};

/** 모델 타입 */
export type IMovieEditListModelType = Instance<typeof model>;

export default movieEditListStore;
