import React, { useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { observer } from 'mobx-react';
import { authCheck, sessionPersist } from '~/utils/auth';
import { ILoginInfo } from '~/src/interfaces';
import styled from 'styled-components';
import { useStore } from '~/store';
import MasterLayout from '~/components/Layout/MasterLayout';
import ForestMngLayout from '~/components/Layout/ForestMngLayout';
import { apiCall } from '~/utils/fetchUtils';
import BaseEdit from '~/src/views/movieEdit/BaseEdit';
import { useRouter } from 'next/router';
import _ from 'lodash';

/** props */
interface IProps {
  className?: string;
  loginInfo: ILoginInfo;
  forestSeqNo?: number;
  initState?: any;
  expCodeList: any[];
  movieList?: any[];
}

/** style */
const MovieEditWrapper = styled('div')``;

/** 동영상 관리 컴포넌트 */
const MovieEdit: React.FC<IProps> = (props) => {
  const { loginInfo, forestSeqNo, expCodeList, movieList } = props;
  const { movieEditListModel: store } = useStore();
  const router = useRouter();

  if (!!!forestSeqNo) {
    store.alertModel.setToggleWithSetting({
      bodyContents: '휴양림 정보가 없습니다.<br />휴양림 등록페이지로 이동 합니다.',
      firstBtnText: '확인',
      opFirstBtnClick: () => {
        router.push('forestEdit?forestSeqNo=0');
      },
      secondBtnClassName: 'd-none'
    });
  }

  // 처음 로드시 서버사이드 데이터를 store 에 바인딩
  useEffect(() => {
    // 세션 유지(await 필요 없음)
    sessionPersist();

    store.setForestSeqNo(forestSeqNo);
    store.setExpListModel(expCodeList);
    store.setMovieEditListModel(movieList);

    return () => {
      // 컴포넌트 unmount 시 상태값 초기화
      store.setInit();
    };
  }, []);

  // 동영상 추가
  const handleMovieAdd = () => {
    store.setAddEmptyMovieInfo();
  };

  return (
    <MasterLayout loginInfo={loginInfo}>
      <ForestMngLayout
        activeStep={2}
        alertModel={store.alertModel}
        forestSeqNo={forestSeqNo}
        opMovieAdd={handleMovieAdd}
      >
        <MovieEditWrapper>
          <BaseEdit forestSeqNo={forestSeqNo} />
        </MovieEditWrapper>
      </ForestMngLayout>
    </MasterLayout>
  );
};
export default observer(MovieEdit);

/** 서버사이드 함수 */
export const getServerSideProps: GetServerSideProps = async (props) => {
  const { query } = props;
  const loginInfo = await authCheck(props);
  const forestSeqNo = Number(query.forestSeqNo) ?? 0;

  // const store = initializeStore(isServer);
  // const { movieEditListModel } = store;

  // 체험 리스트 정보
  let expRes = null;

  // 드랍다운컨트롤 바인딩용 체험 코드 리스트
  let expCodeList = null;

  // 동영상 리스트 정보
  let movieRes = null;

  // 만약 수정 모드이면 휴양림 번호에 해당하는 동영상 정보를 가져온다.
  if (forestSeqNo > 0) {
    // 체험 정보
    expRes = await apiCall({
      url: '/getExpList',
      params: {
        FOREST_SEQ_NO: forestSeqNo
      }
    });

    // 체험 코드 리스트
    expCodeList = _.map(expRes?.LIST, (val) => _.pick(val, ['EXP_SEQ_NO', 'NAME']));

    // 동영상 리스트
    movieRes = await apiCall({
      url: '/getMovieList',
      params: {
        FOREST_SEQ_NO: forestSeqNo
      }
    });

    // store set
    // movieEditListModel.setForestSeqNo(forestSeqNo);
    // movieEditListModel.setMovieEditListModel(movieRes.LIST);
  }

  return {
    props: {
      // initState: getSnapshot(store),
      loginInfo,
      forestSeqNo,
      expCodeList,
      movieList: movieRes?.LIST ?? null
    }
  };
};
