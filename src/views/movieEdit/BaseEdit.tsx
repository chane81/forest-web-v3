import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import { useMediaQuery, Grid } from '@material-ui/core';
import theme from '~/components/Theme';
import MovieEditCard from '~/views/movieEdit/MovieEditCard';
import { IMovieEditModelType } from '~/store/movieEdit/movieEditStore';
import { useStore } from '~/store';

/** props */
interface IProps {
  className?: string;
  forestSeqNo?: number;
  movieList?: any[];
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

  .grid-categ {
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;

    /** 계절구분 */
    .ctl-categ {
      width: 7rem;
      margin-right: 1.5rem;
    }

    /** 동영상 추가 버튼 */
    .btn-add {
      height: 36px;
    }
  }

  .MuiFab-root {
    box-shadow: 0px 7px 10px -4px rgb(0 0 0 / 58%), 0px 12px 17px 2px rgba(0, 0, 0, 0.042),
      0px 5px 16px 4px rgba(0, 0, 0, 0.036);
  }
`;

/** 동영상 정보 등록/수정*/
const BaseEdit: React.FC<IProps> = (props) => {
  const { movieEditListModel: store } = useStore();
  const [cardSizeState, setCardSizeState] = useState<true | 6 | 12>(6);
  const { movieListModel, expListModel } = store;
  const matches = useMediaQuery(theme.breakpoints.down('md'));

  // useEffect md 사이즈보다 작을경우 card 사이즈를
  // 12 (width full) 그렇지 않으면 6 (width half)
  useEffect(() => {
    setCardSizeState(movieListModel.length === 1 || matches ? 12 : 6);
  }, [matches, movieListModel.length]);

  // 동영상 삭제
  const handleDelete = (targetModel: IMovieEditModelType) => {
    const handleRemove = async () => {
      await store.setRemoveData(targetModel);
    };

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
        {movieListModel.map((val, idx) => {
          return (
            <MovieEditCard
              key={idx}
              xsSize={cardSizeState}
              opDelete={handleDelete}
              categ1={val.categ1}
              store={val}
            />
          );
        })}
      </Grid>
    </BaseEditWrapper>
  );
};

export default observer(BaseEdit);
