import React from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { LinearProgressWithLabel } from '~/components/Loading';
import { IMovieEditModelType } from '~/store/movieEdit/movieEditStore';

/** props */
interface IProps {
  store?: IMovieEditModelType;
}

/** style */
const MoviePercentWrapper = styled('div')``;

/**
 * 동영상정보 업로드 퍼센트 컴포넌트
 * 업로드 진행시에 store.percent 값이 업데이트 되기 때문에 컴포넌트 전체가 업데이트되므로
 * 해당값을 받는 컴포넌트를 따로 분리하여 드랍존의 프리뷰 이미지 깜빡임에 대한 대응을 함
 */
const MoviePercent: React.FC<IProps> = (props) => {
  return (
    <MoviePercentWrapper>
      <LinearProgressWithLabel value={props.store.percent} />
    </MoviePercentWrapper>
  );
};

export default observer(MoviePercent);
