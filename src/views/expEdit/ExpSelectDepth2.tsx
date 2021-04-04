import React from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { Select, MenuItem, InputLabel, FormControl } from '@material-ui/core';
import { IExpEditModelType } from '~/store/expEdit/expEditStore';
import _ from 'lodash';

/** props */
interface IProps {
  className?: string;
  opChange?: (val: string) => void;
  groupCd?: string;
  list?: any[];
  store?: IExpEditModelType;
}

/** style */
const ExpEditSelectDepth2Wrapper = styled(FormControl)``;

/** 체험 정보 중분류 select 박스 */
const ExpEditSelectDepth2: React.FC<IProps> = (props) => {
  const { store, list } = props;

  // change 핸들러
  const handleChange = (
    e: React.ChangeEvent<{
      name?: string;
      value: string;
    }>,
    child: React.ReactNode
  ) => {
    const { value } = e.target;
    props.opChange?.(value);

    // 상태값에 저장
    store.setChangeHandler('categ2', value);
  };

  // 대분류 리스트 가져오기
  const depth2List = store.getDepth2List(list);

  // 선택된값 세팅
  const selectValue = () => {
    return !_.some(depth2List, { CD: store.categ2 }) ? depth2List?.[0].CD : store.categ2;
  };

  return (
    <ExpEditSelectDepth2Wrapper variant="outlined">
      <InputLabel id="lblDepth2">중분류</InputLabel>
      <Select
        labelId="lblDepth2"
        name="depth2"
        value={selectValue()}
        defaultValue=""
        fullWidth
        label="중분류"
        MenuProps={{
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'left'
          },
          getContentAnchorEl: null
        }}
        onChange={handleChange}
      >
        {depth2List &&
          _.map(depth2List, (val: any, idx: number) => (
            <MenuItem key={val.CD} value={val.CD}>
              {val.NAME}
            </MenuItem>
          ))}
      </Select>
    </ExpEditSelectDepth2Wrapper>
  );
};

export default observer(ExpEditSelectDepth2);
