import React, { useRef, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { authCheck, sessionPersist } from '~/utils/auth';
import MasterLayout from '~/components/Layout/MasterLayout';
import styled from 'styled-components';
import { Theme, Card, CardHeader, CardContent, Grid, Button } from '@material-ui/core';
import theme from '~/components/Theme';
import { apiCall, listCall } from '~/utils/fetchUtils';
import { ILoginInfo } from '~/src/interfaces';
import { MuiTable } from '~/components/Grid';
import { Column } from 'material-table';
import CreateIcon from '@material-ui/icons/Create';
import { useStore } from '~/store';
import { AlertTypeA } from '~/components/Popup';

/** props */
interface IProps {
  className?: string;
  loginInfo: ILoginInfo;
  listData: any;
}

/** GridEditDel props */
interface IPropsGridEditDel {
  seqNo: number;
  opDel: () => void;
}

/** style props */
interface IStyle {
  muiTheme: Theme;
}

/** style */
const NotiListWrapper = styled('div')<IStyle>`
  height: calc(100vh - 118px);

  .create-data-area {
    display: flex;
    justify-content: flex-end;
  }

  .list-img {
    width: 150px;
    height: 100px;
    border-radius: 0.25rem;
  }

  .btnEdit,
  .btnDel {
    min-width: 3rem;
    width: 4rem;
  }

  .btnEdit {
    margin-bottom: 0.5rem;
  }

  /** 리스트 테이블 스타일 */
  .list-table {
    // table style
    .MuiTable-root {
      table-layout: fixed !important;
    }

    th:nth-child(1) {
      width: 80px !important;
    }

    // table header & td style
    .MuiTableCell-head,
    .MuiTableCell-root {
      text-align: center;
    }

    // table td style
    .MuiTableCell-root {
      padding-left: 0.25rem;
      padding-right: 0.25rem;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
  }
`;

/** 그리드의 수정/삭제 버튼 */
const GridEditDel: React.FC<IPropsGridEditDel> = (props) => {
  const { notiListModel: store } = useStore();

  useEffect(() => {
    // 세션 유지(await 필요 없음)
    sessionPersist();

    return () => {
      // 컴포넌트 unmount 시 상태값 초기화
      store.setInit();
    };
  }, []);

  // 삭제 처리
  const handleDelete = async () => {
    store.alertModel.setInit();

    const res = await apiCall({
      url: '/setBoardDelete',
      params: {
        BOARD_SEQ_NO: props.seqNo
      }
    });

    if (res.RESULT) {
      store.alertModel.setToggleWithSetting({
        bodyContents: '삭제 되었습니다.',
        secondBtnText: '',
        secondBtnClassName: 'd-none'
      });

      props.opDel?.();
    }
  };

  // 삭제 클릭시
  const handleDelClick = () => {
    store.alertModel.setToggleWithSetting({
      bodyContents: '삭제 하시겠습니까?',
      opFirstBtnClick: handleDelete,
      opSecondBtnClick: () => {
        store.alertModel.setInit();
      }
    });
  };

  return (
    <div className="d-flex flex-column align-items-center">
      <Link href={`/notiEdit?boardSeqNo=${props.seqNo}`}>
        <Button variant="contained" color="primary" size="small" className="btnEdit">
          수정
        </Button>
      </Link>
      <Button
        variant="contained"
        color="secondary"
        size="small"
        className="btnDel"
        onClick={handleDelClick}
      >
        삭제
      </Button>
    </div>
  );
};

/** 공지 리스트 */
const NotiList: React.FC<IProps> = (props) => {
  const { notiListModel: store } = useStore();
  const tableRef = useRef<any>();

  const columns: Column<any>[] = [
    {
      title: '번호',
      field: 'LIST_NUM',
      width: 80
    },
    {
      title: '제목',
      field: 'TITLE',
      width: 160
    },
    {
      field: 'BOARD_SEQ_NO',
      hidden: true
    },
    {
      title: '내용',
      field: 'CONTENTS'
    },
    {
      title: '사용여부',
      field: 'USE_YN',
      width: 100
    },
    {
      title: '비고',
      width: 90,
      render: (rowData) => <GridEditDel seqNo={rowData.BOARD_SEQ_NO} opDel={handleRefetchTable} />
    }
  ];

  const handleRefetchTable = () => {
    tableRef.current.onQueryChange();
  };

  return (
    <MasterLayout loginInfo={props.loginInfo}>
      <NotiListWrapper muiTheme={theme}>
        <Card elevation={10} className="h-100 d-flex flex-column">
          <CardHeader
            title={
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  공지 리스트
                </Grid>
                <Grid item xs={6} className="create-data-area">
                  <Link href={`/notiEdit?forestSeqNo=0`}>
                    <Button
                      variant="contained"
                      color="secondary"
                      className="m-1"
                      startIcon={<CreateIcon />}
                    >
                      공지 등록
                    </Button>
                  </Link>
                </Grid>
              </Grid>
            }
          />
          <CardContent className="list-table flex-grow-1 overflow-auto">
            <MuiTable
              options={{
                search: false,
                paging: true,
                pageSize: 10,
                toolbar: false,
                sorting: false
              }}
              style={{
                tableLayout: 'fixed'
              }}
              columns={columns}
              title=""
              data={listCall({
                // firstData: props.listData,
                url: '/getBoardList',
                params: {
                  CATEG: 'N'
                }
              })}
              tableRef={tableRef}
            ></MuiTable>
          </CardContent>
        </Card>
      </NotiListWrapper>
      <AlertTypeA
        alertInfo={store.alertModel}
        alertStyle={{
          width: '300px'
        }}
      ></AlertTypeA>
    </MasterLayout>
  );
};

export default NotiList;

/** 서버사이드 함수 */
export const getServerSideProps: GetServerSideProps = async (props) => {
  const loginInfo = await authCheck(props);

  // const res = await apiCall({
  // 	url: '/getForestList',
  // 	params: {
  // 		PAGE_NO: 1,
  // 		PAGE_SIZE: 5
  // 	}
  // });

  // const listData = res.LIST;

  // return { props: { loginInfo, listData } };
  return { props: { loginInfo } };
};
