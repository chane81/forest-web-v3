import React, { useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { observer } from 'mobx-react';
import { authCheck, sessionPersist } from '~/utils/auth';
import { ILoginInfo } from '~/src/interfaces';
import styled from 'styled-components';
import { apiCall } from '~/utils/fetchUtils';
import { useStore } from '~/store';
import MasterLayout from '~/components/Layout/MasterLayout';
import BaseEdit from '~/views/notiEdit/BaseEdit';
import { useRouter } from 'next/router';
import { AlertTypeA } from '~/components/Popup';

/** props */
interface IProps {
  className?: string;
  loginInfo: ILoginInfo;
  boardSeqNo?: number;
  initialState?: any;
  notiInfo?: any;
}

/** style */
const NotiEditWrapper = styled('div')``;

/** 휴양림 관리 컴포넌트 */
const NotiEdit: React.FC<IProps> = (props) => {
  const { loginInfo, boardSeqNo, notiInfo } = props;
  const { notiEditModel: store } = useStore();
  const router = useRouter();

  // 처음 로드시 서버사이드 데이터를 store 에 바인딩
  useEffect(() => {
    // 세션 유지(await 필요 없음)
    sessionPersist();

    if (!!notiInfo) {
      store.setBoardSeqNo(boardSeqNo);
      store.setNotiInfo(notiInfo);
    }

    return () => {
      // 컴포넌트 unmount 시 상태값 초기화
      store.setInit();
    };
  }, [boardSeqNo]);

  /** 저장 클릭시 */
  const handleSave = () => {
    // insert의 경우 저장후 생성된 휴양림 seq no 로 페이지 이동
    const saveCallback = (seqNo: number) => {
      router.push(`notiEdit?boardSeqNo=${seqNo}`);
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
      <NotiEditWrapper>
        <BaseEdit opSave={handleSave} />
        <AlertTypeA
          alertInfo={store.alertModel}
          alertStyle={{
            width: '300px'
          }}
        ></AlertTypeA>
      </NotiEditWrapper>
    </MasterLayout>
  );
};

export default observer(NotiEdit);

/** 서버사이드 함수 */
export const getServerSideProps: GetServerSideProps = async (props) => {
  const { query } = props;
  const loginInfo = await authCheck(props);
  const boardSeqNo = Number(query.boardSeqNo) ?? 0;

  let notiInfo = null;

  // 만약 수정 모드이면 게시판번호에 해당하는 정보를 가져온다.
  if (boardSeqNo > 0) {
    // 휴양림 정보
    notiInfo = await apiCall({
      url: '/getBoardDetail',
      params: {
        BOARD_SEQ_NO: boardSeqNo
      }
    });
  }

  return {
    props: {
      loginInfo,
      notiInfo,
      boardSeqNo
    }
  };
};
