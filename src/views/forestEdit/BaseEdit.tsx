import React from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { Grid, Select, MenuItem, InputLabel, FormControl } from '@material-ui/core';
import { MuiTextField, OutlinedBox } from '~/components/MuiCustom';
import { DropZone } from '~/components/File';
import { useStore } from '~/store';

/** props */
interface IProps {
  className?: string;
  forestSeqNo?: number;
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
`;

/** 기본정보 등록/수정*/
const BaseEdit: React.FC<IProps> = (props, ref) => {
  const { forestEditModel: store } = useStore();

  // 필드값 변경시 상태값에 update
  const handleChange = (fieldName: string) => (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    store.setChangeHandler(fieldName, e.target.value);
  };

  return (
    <BaseEditWrapper>
      <Grid container spacing={3} className="contents">
        <Grid item xs={12} sm={6}>
          <MuiTextField
            required
            name="forestName"
            variant="outlined"
            label="휴양림 이름"
            value={store.name}
            onChange={handleChange('name')}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl required variant="outlined">
            <InputLabel id="lblMainYn">메인노출</InputLabel>
            <Select
              required
              labelId="lblMainYn"
              id="mainYn"
              value={store.mainYn}
              fullWidth
              label="메인노출"
              MenuProps={{
                anchorOrigin: {
                  vertical: 'bottom',
                  horizontal: 'left'
                },
                getContentAnchorEl: null
              }}
              onChange={handleChange('mainYn')}
            >
              <MenuItem value="Y">예</MenuItem>
              <MenuItem value="N">아니오</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <MuiTextField
            required
            error={store.addr1 === ''}
            name="forestAddr"
            label="휴양림 주소"
            value={store.addr1}
            variant="outlined"
            onChange={handleChange('addr1')}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <MuiTextField
            required
            error={store.addr2 === ''}
            name="forestAddrDetail"
            label="휴양림 상세 주소"
            value={store.addr2}
            variant="outlined"
            onChange={handleChange('addr2')}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <MuiTextField
            required
            error={store.telNo === ''}
            name="forestTel"
            label="휴양림 연락처"
            value={store.telNo}
            variant="outlined"
            onChange={handleChange('telNo')}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <MuiTextField
            required
            error={store.bussinessNum === ''}
            name="forestBussinessNum"
            label="사업자번호"
            value={store.bussinessNum}
            variant="outlined"
            onChange={handleChange('bussinessNum')}
          />
        </Grid>
        <Grid item xs={12} sm={12}>
          <MuiTextField
            required
            name="forestDesc"
            label="휴양림 간단 소개"
            multiline
            rows={4}
            value={store.simpleDesc}
            variant="outlined"
            onChange={handleChange('simpleDesc')}
          />
        </Grid>
        <Grid item xs={12} sm={12}>
          <MuiTextField
            required
            name="forestDesc"
            label="휴양림 소개"
            multiline
            rows={4}
            value={store.desc}
            variant="outlined"
            onChange={handleChange('desc')}
          />
        </Grid>
        <Grid item xs={12} sm={12}>
          <OutlinedBox label="휴양림 이미지">
            <DropZone
              acceptedFiles={['image/*']}
              imgGridSize={3}
              fileLimit={6}
              maxFileSize={10000000}
              dropZoneModel={store.imgDropZoneModel}
            />
          </OutlinedBox>
        </Grid>
        <Grid item xs={12} sm={12}>
          <OutlinedBox label="맵 이미지">
            <DropZone
              acceptedFiles={['image/*']}
              imgGridSize={12}
              fileLimit={1}
              maxFileSize={10000000}
              isSortHidden={true}
              dropZoneModel={store.mapDropZoneModel}
            />
          </OutlinedBox>
        </Grid>
      </Grid>
    </BaseEditWrapper>
  );
};

export default observer(BaseEdit);
