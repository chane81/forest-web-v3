import React from 'react';
import styled from 'styled-components';
import {
  Grid,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Fab,
  Tooltip
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import { MuiTextField } from '~/components/MuiCustom';
import { IMovieDetailModelType } from '~/store/movieEdit/movieDetailStore';
import { observer } from 'mobx-react';
import _ from 'lodash';
import { IExpCodeModelType } from '~/store/movieEdit/expCodeStore';

/** props */
interface IProps {
  className?: string;
  idx?: number;
  iconType?: 'add' | 'remove';
  expCodeList?: IExpCodeModelType[];
  opExpChange?: (val: string) => void;
  opAddExpClick?: () => void;
  opRemoveExpClick?: (store: IMovieDetailModelType) => void;
  store: IMovieDetailModelType;
}

/** style */
const MovieEditExpRowWrapper = styled(Grid)`
  /** fab 아이콘 버튼에 shadow */
  .MuiFab-root {
    box-shadow: 0px 7px 10px -4px rgb(0 0 0 / 58%), 0px 12px 17px 2px rgba(0, 0, 0, 0.042),
      0px 5px 16px 4px rgba(0, 0, 0, 0.036);
  }

  .empty-exp-field {
    background-color: #f1f3f5;
  }

  /** 영상 표시 시분초 grid */
  .add-exp-row {
    display: flex;
    flex-flow: row !important;
    align-items: center;

    /** row 추가 버튼 */
    .btn-add {
      min-width: 40px;
      background-color: #1c7ed6;
    }

    /** row 삭제 버튼 */
    .btn-remove {
      min-width: 40px;
      background-color: #d6336c;
    }
  }
`;

/** 동영상 상세의 체험 수정, 체험 포인트표시 분초 수정 컴포넌트 */
const MovieEditExpRow: React.FC<IProps> = (props) => {
  const { store, expCodeList } = props;

  if (!expCodeList || expCodeList.length === 0) {
    return (
      <MovieEditExpRowWrapper container spacing={3}>
        <Grid item xs>
          <TextField
            fullWidth
            disabled={true}
            className="empty-exp-field"
            variant="outlined"
            label="영상 체험표시 분/초"
            value="체험정보가 등록되어 있지 않습니다."
          ></TextField>
        </Grid>
      </MovieEditExpRowWrapper>
    );
  }

  const handleBtnClick = () => {
    if (props.iconType === 'add') {
      props.opAddExpClick?.();
    } else {
      props.opRemoveExpClick?.(store);
    }
  };

  // 필드값 변경시 상태값에 update
  const handleChange = (fieldName: string) => (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    store.setChangeHandler(fieldName, e.target.value);
  };

  return (
    <MovieEditExpRowWrapper container spacing={3}>
      <Grid item xs={12} sm={6}>
        <FormControl variant="outlined">
          <InputLabel id="lblExpChoice">체험선택</InputLabel>
          <Select
            labelId="lblExpChoice"
            name="expChoice"
            value={!!!store.expSeqNo ? expCodeList?.[0]?.expSeqNo : store.expSeqNo}
            fullWidth
            label="체험선택"
            MenuProps={{
              anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'left'
              },
              getContentAnchorEl: null
            }}
            onChange={handleChange('expSeqNo')}
          >
            <MenuItem disabled value="">
              <em>체험선택</em>
            </MenuItem>
            {expCodeList &&
              _.map(expCodeList, (val, idx) => (
                <MenuItem key={idx} value={val.expSeqNo}>
                  {val.name}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6} className="add-exp-row">
        <MuiTextField
          required
          className="w-100"
          error={store.pointTime === ''}
          name="movieTime"
          label="영상 체험표시 분/초"
          value={store.pointTime}
          variant="outlined"
          onChange={handleChange('pointTime')}
        />
        <Tooltip title={props.iconType === 'add' ? '추가' : '삭제'} className="ml-2">
          <Fab
            color="secondary"
            size="small"
            className={props.iconType === 'add' ? 'btn-add' : 'btn-remove'}
            onClick={handleBtnClick}
          >
            {props.iconType === 'add' ? <AddIcon /> : <RemoveIcon />}
          </Fab>
        </Tooltip>
      </Grid>
    </MovieEditExpRowWrapper>
  );
};

export default observer(MovieEditExpRow);
