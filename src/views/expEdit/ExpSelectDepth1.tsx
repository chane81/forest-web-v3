import React from 'react';
import styled from 'styled-components';
import { Select, MenuItem, InputLabel, FormControl } from '@material-ui/core';
import { observer } from 'mobx-react';
import { IExpEditModelType } from '~/store/expEdit/expEditStore';
import _ from 'lodash';

/** props */
interface IProps {
  className?: string;
  opChange?: (val: string) => void;
  list?: any[];
  store?: IExpEditModelType;
}

/** style */
const ExpEditSelectDepth1Wrapper = styled(FormControl)``;

/** 체험 정보 대분류 select 박스*/
const ExpEditSelectDepth1: React.FC<IProps> = (props) => {
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
    store.setChangeHandler('categ1', value);
  };

  return (
    <ExpEditSelectDepth1Wrapper variant="outlined">
      <InputLabel id="lblDepth1">대분류</InputLabel>
      <Select
        labelId="lblDepth1"
        name="depth1"
        value={store.categ1}
        defaultValue=""
        fullWidth
        label="대분류"
        MenuProps={{
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'left'
          },
          getContentAnchorEl: null
        }}
        onChange={handleChange}
      >
        {list &&
          _.map(list, (val: any, idx: number) => (
            <MenuItem key={val.CD} value={val.CD}>
              {val.NAME}
            </MenuItem>
          ))}
      </Select>
    </ExpEditSelectDepth1Wrapper>
  );
};

export default observer(ExpEditSelectDepth1);
