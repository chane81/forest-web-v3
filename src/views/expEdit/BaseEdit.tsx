import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { useMediaQuery, Grid } from '@material-ui/core';
import theme from '~/components/Theme';
import ExpEditCard from '~/views/expEdit/ExpEditCard';
import { IExpEditModelType } from '~/store/expEdit/expEditStore';
import { useStore } from '~/store';

/** props */
interface IProps {
  className?: string;
  forestSeqNo?: number;
  expList?: any[];
  depth1?: any[];
  depth2?: any[];
}

/** style */
const BaseEditWrapper = styled('div')`
  .contents {
    .MuiGrid-item {
      display: flex;
      flex-flow: column;
      justify-content: flex-end;
    }
  }

  .title {
    height: 45.63px;
    margin-bottom: 1.5rem;
    align-items: flex-end;
  }

  .btn-delete {
    background-color: #e9ecef;
    &:hover {
      background-color: #dee2e6;
    }
  }

  .MuiFab-root {
    box-shadow: 0px 7px 10px -4px rgb(0 0 0 / 58%), 0px 12px 17px 2px rgba(0, 0, 0, 0.042),
      0px 5px 16px 4px rgba(0, 0, 0, 0.036);
  }
`;

/** 체험 정보 등록/수정*/
const BaseEdit: React.FC<IProps> = (props) => {
  const { expEditListModel: store } = useStore();
  const [cardSizeState, setCardSizeState] = useState<true | 6 | 12>(6);
  const { expListModel } = store;
  const matches = useMediaQuery(theme.breakpoints.down('md'));

  // useEffect md 사이즈보다 작을경우 card 사이즈를
  // 12 (width full) 그렇지 않으면 6 (width half)
  useEffect(() => {
    setCardSizeState(expListModel.length === 1 || matches ? 12 : 6);
  }, [matches, expListModel.length]);

  // 체험 삭제
  const handleDelete = (targetModel: IExpEditModelType) => {
    const handleRemove = () => {
      store.alertModel.setInit();

      store.setRemoveExpInfo(targetModel);
    };

    // alert 초기화
    store.alertModel.setInit();

    // alert
    store.alertModel.setToggleWithSetting({
      bodyContents: '삭제 하시겠습니까?',
      opFirstBtnClick: handleRemove,
      opSecondBtnClick: () => {
        store.alertModel.setInit();
      }
    });
  };

  return (
    <BaseEditWrapper>
      <Grid container spacing={2}>
        {expListModel.map((val, idx) => {
          return (
            <ExpEditCard
              key={idx}
              xsSize={cardSizeState}
              opDelete={handleDelete}
              depth1={props.depth1}
              depth2={props.depth2}
              store={val}
            />
          );
        })}
      </Grid>
    </BaseEditWrapper>
  );
};

export default observer(BaseEdit);
