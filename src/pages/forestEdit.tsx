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
import BaseEdit from '~/views/forestEdit/BaseEdit';
import { useRouter } from 'next/router';
import { FullLoading } from '~/components/Loading';

/** props */
interface IProps {
  className?: string;
  loginInfo: ILoginInfo;
  forestSeqNo?: number;
  initialState?: any;
  forestInfo?: any;
}

/** style */
const ForestEditWrapper = styled('div')``;

/** 휴양림 관리 컴포넌트 */
const ForestEdit: React.FC<IProps> = (props) => {
  const { loginInfo, forestSeqNo, forestInfo } = props;
  const { forestEditModel: store } = useStore();
  const router = useRouter();

  useEffect(() => {
    // 세션 유지(await 필요 없음)
    sessionPersist();

    // 처음 로드시 서버사이드 데이터를 store 에 바인딩
    if (!!forestInfo) {
      store.setForestSeqNo(forestSeqNo);
      store.setForestInfo(forestInfo);
    }

    return () => {
      // 컴포넌트 unmount 시 상태값 초기화
      store.setInit();
    };
  }, [forestSeqNo]);

  /** 저장 클릭시 */
  const handleSave = () => {
    // insert의 경우 저장후 생성된 휴양림 seq no 로 페이지 이동
    const saveCallback = (seqNo: number) => {
      router.push(`forestEdit?forestSeqNo=${seqNo}`);
    };

    if (store.getValidate()) {
      store.alertModel.setToggleWithSetting({
        bodyContents: '저장 하시겠습니까?.',
        firstBtnText: '예',
        firstBtnClassName: 'btn-primary',
        opFirstBtnClick: () => store.setSaveData(saveCallback),
        secondBtnText: '아니오',
        secondBtnClassName: 'btn-secondary'
      });
    }
  };

  return (
    <MasterLayout loginInfo={loginInfo}>
      <ForestMngLayout
        activeStep={0}
        alertModel={store.alertModel}
        opSave={handleSave}
        forestSeqNo={forestSeqNo}
      >
        <ForestEditWrapper>
          <BaseEdit forestSeqNo={forestSeqNo} />
        </ForestEditWrapper>
        <FullLoading isShow={store.loading} isBgShow={true} iconBgColor="#ffffff"></FullLoading>
      </ForestMngLayout>
    </MasterLayout>
  );
};

export default observer(ForestEdit);

/** 서버사이드 함수 */
export const getServerSideProps: GetServerSideProps = async (props) => {
  const { query } = props;
  const loginInfo = await authCheck(props);
  const forestSeqNo = Number(query.forestSeqNo) ?? 0;
  let forestInfo = null;

  // 만약 수정 모드이면 휴양림 번호에 해당하는 휴양림 정보를 가져온다.
  if (forestSeqNo > 0) {
    // 휴양림 정보
    forestInfo = await apiCall({
      url: '/getForestInfo',
      params: {
        FOREST_SEQ_NO: forestSeqNo
      }
    });

    // store set
    // 서버사이드에서 mst 바인딩 후 mui 컨트롤의 className is not match 이슈가 있어서
    // 이슈 해결 전까지는 useEffect 에서 데이터 바인딩 하게 한다.
    // forestEditModel.setForestSeqNo(forestSeqNo);
    // forestEditModel.setForestInfo(forestInfo);
  }

  return {
    props: {
      // initialState: getSnapshot(store),
      loginInfo,
      forestInfo,
      forestSeqNo
    }
  };
};
