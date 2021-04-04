import React from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import {
  Grid,
  Typography,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Card,
  CardContent,
  Button
} from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';
import { MuiTextField } from '~/components/MuiCustom';
import { useStore } from '~/store';

/** props */
interface IProps {
  className?: string;
  boardSeqNo?: number;
  opSave?: () => void;
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

  .btn-proc-area {
    display: flex;
    justify-content: flex-end;
  }
`;

/** 기본정보 등록/수정*/
const BaseEdit: React.FC<IProps> = (props, ref) => {
  const { boardSeqNo, opSave } = props;
  const { notiEditModel: store } = useStore();

  // 필드값 변경시 상태값에 update
  const handleChange = (fieldName: string) => (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    store.setChangeHandler(fieldName, e.target.value);
  };

  return (
    <BaseEditWrapper>
      <Card elevation={10} className="position-relative">
        <CardContent>
          <Grid container className="title">
            <Grid item xs={4}>
              <Typography variant="h6">
                <b>공지 등록/수정</b>
              </Typography>
            </Grid>
            <Grid item xs={8} className="btn-proc-area">
              <Button
                variant="contained"
                className="bg-primary text-white mr-2"
                startIcon={<SaveIcon />}
                onClick={opSave}
              >
                저장하기
              </Button>
            </Grid>
          </Grid>
          <Grid container spacing={3} className="contents">
            <Grid item xs={6}>
              <MuiTextField
                required
                name="title"
                variant="outlined"
                label="제목"
                value={store.title}
                onChange={handleChange('title')}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl required variant="outlined">
                <InputLabel id="lblUseYn">사용여부</InputLabel>
                <Select
                  required
                  labelId="lblUseYn"
                  id="useYn"
                  value={store.useYn}
                  fullWidth
                  label="사용여부"
                  MenuProps={{
                    anchorOrigin: {
                      vertical: 'bottom',
                      horizontal: 'left'
                    },
                    getContentAnchorEl: null
                  }}
                  onChange={handleChange('useYn')}
                >
                  <MenuItem value="Y">예</MenuItem>
                  <MenuItem value="N">아니오</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={12}>
              <MuiTextField
                required
                name="contents"
                label="내용"
                multiline
                rows={11}
                value={store.contents}
                variant="outlined"
                onChange={handleChange('contents')}
              />
            </Grid>
            <Grid item xs={12}>
              <MuiTextField
                name="url1"
                variant="outlined"
                label="URL 1"
                value={store.url1 ?? ''}
                onChange={handleChange('url1')}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <MuiTextField
                name="url2"
                variant="outlined"
                label="URL 2"
                value={store.url2 ?? ''}
                onChange={handleChange('url2')}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <MuiTextField
                name="url3"
                variant="outlined"
                label="URL 3"
                value={store.url3 ?? ''}
                onChange={handleChange('url3')}
                fullWidth
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </BaseEditWrapper>
  );
};

export default observer(BaseEdit);
