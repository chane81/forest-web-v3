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
const ForestListWrapper = styled('div')<IStyle>`
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

  /** 리스트 테이블 스타일 */
  .list-table {
    // table style
    .MuiTable-root {
      table-layout: fixed !important;

      th:nth-child(1) {
        width: 80px !important;
      }

      th:nth-child(2) {
        width: 150px !important;
      }

      th:nth-child(6) {
        width: 80px !important;
      }
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
    }
  }

  .btnEdit,
  .btnDel {
    min-width: 3rem;
    width: 4rem;
  }

  .btnEdit {
    margin-bottom: 0.5rem;
  }
`;

/** 그리드의 수정/삭제 버튼 */
const GridEditDel: React.FC<IPropsGridEditDel> = (props) => {
  const { forestListModel: store } = useStore();

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
      url: '/setForestDelete',
      params: {
        FOREST_SEQ_NO: props.seqNo
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
      <Link href={`/forestEdit?forestSeqNo=${props.seqNo}`}>
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

/** 휴양림 리스트 */
const ForestList: React.FC<IProps> = (props) => {
  const { forestListModel: store } = useStore();
  const tableRef = useRef<any>();

  // 처음 로드시 서버사이드 데이터를 store 에 바인딩
  useEffect(() => {
    return () => {
      // 컴포넌트 unmount 시 상태값 초기화
      store.setInit();
    };
  }, []);

  const columns: Column<any>[] = [
    {
      title: '번호',
      field: 'LIST_NUM'
    },
    {
      title: '이미지',
      field: 'IMG_URL',
      render: (rowData) => <img src={rowData.IMG_URL} className="list-img" />
    },
    {
      field: 'FOREST_SEQ_NO',
      hidden: true
    },
    {
      title: '휴양림이름',
      field: 'NAME'
    },
    {
      title: '간단설명',
      field: 'SIMPLE_DESCRIPT'
    },
    {
      title: '체험구분',
      field: 'EXP_GUBUN_NAME'
    },
    {
      title: '메인노출',
      field: 'MAIN_YN'
    },
    {
      title: '비고',
      render: (rowData) => <GridEditDel seqNo={rowData.FOREST_SEQ_NO} opDel={handleRefetchTable} />
    }
  ];

  const handleRefetchTable = () => {
    tableRef.current.onQueryChange();
  };

  return (
    <MasterLayout loginInfo={props.loginInfo}>
      <ForestListWrapper muiTheme={theme}>
        <Card elevation={10} className="h-100 d-flex flex-column">
          <CardHeader
            title={
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  휴양림 리스트
                </Grid>
                <Grid item xs={6} className="create-data-area">
                  <Link href={`/forestEdit?forestSeqNo=0`}>
                    <Button
                      variant="contained"
                      color="secondary"
                      className="m-1"
                      startIcon={<CreateIcon />}
                    >
                      휴양림 등록
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
              columns={columns}
              title=""
              data={listCall({
                // firstData: props.listData,
                url: '/getForestList'
              })}
              tableRef={tableRef}
            ></MuiTable>
          </CardContent>
        </Card>
      </ForestListWrapper>
      <AlertTypeA
        alertInfo={store.alertModel}
        alertStyle={{
          width: '300px'
        }}
      ></AlertTypeA>
    </MasterLayout>
  );
};

export default ForestList;

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
