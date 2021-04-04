import React, { useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { observer } from 'mobx-react';
import { authCheck, sessionPersist } from '~/utils/auth';
import { ILoginInfo } from '~/src/interfaces';
import styled from 'styled-components';
import { apiCall } from '~/utils/fetchUtils';
import { useStore } from '~/store';
import MasterLayout from '~/components/Layout/MasterLayout';
import ForestMngLayout from '~/components/Layout/ForestMngLayout';
import BaseEdit from '~/views/expEdit/BaseEdit';
import { useRouter } from 'next/router';
import _ from 'lodash';

/** props */
interface IProps {
  className?: string;
  loginInfo: ILoginInfo;
  forestSeqNo?: number;
  initialState?: any;
  expList?: any[];
  depth1?: any[];
  depth2?: any[];
}

/** style */
const ExpEditWrapper = styled('div')``;

/** 체험 관리 컴포넌트 */
const ExpEdit: React.FC<IProps> = (props) => {
  const { loginInfo, forestSeqNo, expList, initialState, depth1, depth2 } = props;
  const { expEditListModel: store } = useStore();
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
    store.setExpEditListModel(expList);

    return () => {
      // 컴포넌트 unmount 시 상태값 초기화
      store.setInit();
    };
  }, []);

  // 체험 추가
  const handleExpAdd = () => {
    store.setAddEmptyExpInfo();
  };

  return (
    <MasterLayout loginInfo={loginInfo}>
      <ForestMngLayout
        activeStep={1}
        alertModel={store.alertModel}
        forestSeqNo={forestSeqNo}
        opExpAdd={handleExpAdd}
      >
        <ExpEditWrapper>
          <BaseEdit depth1={props.depth1} depth2={props.depth2} forestSeqNo={forestSeqNo} />
        </ExpEditWrapper>
      </ForestMngLayout>
    </MasterLayout>
  );
};

export default observer(ExpEdit);

/** 서버사이드 함수 */
export const getServerSideProps: GetServerSideProps = async (props) => {
  const { query } = props;
  const loginInfo = await authCheck(props);
  const forestSeqNo = Number(query.forestSeqNo) ?? 0;

  // const store = initializeStore();
  // const { expEditListModel } = store;
  let expRes = null;

  // 만약 수정 모드이면 휴양림 번호에 해당하는 체험 정보를 가져온다.
  if (forestSeqNo > 0) {
    // 체험 정보
    expRes = await apiCall({
      url: '/getExpList',
      params: {
        FOREST_SEQ_NO: forestSeqNo
      }
    });

    // store set
    // 서버사이드에서 mst 바인딩 후 mui 컨트롤의 className is not match 이슈가 있어서
    // 이슈 해결 전까지는 useEffect 에서 데이터 바인딩 하게 한다.
    // expEditListModel.setForestSeqNo(forestSeqNo);
    // expEditListModel.setExpEditListModel(expRes.LIST);
  }

  // 체험 대분류 select 박스 값들
  const depth1Res = await apiCall({
    url: '/getCodeList',
    params: {
      GROUP_CD: 'G00001'
    }
  });

  // 체험 소분류 select 박스 값들
  const depth2Res = await apiCall({
    url: '/getCodeList',
    params: {
      GROUP_CD: 'G00002'
    }
  });

  // store 에 대분류, 중분류 코드 set
  // expEditListModel.setCateg1List(categ1Res);
  // expEditListModel.setCateg2List(categ2Res);

  return {
    props: {
      loginInfo,
      // initialState: getSnapshot(store),
      expList: expRes?.LIST ?? null,
      forestSeqNo,
      depth1: depth1Res?.LIST ?? null,
      depth2: depth2Res?.LIST ?? null
    }
  };
};
