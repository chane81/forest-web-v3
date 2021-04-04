import React from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { Grid, Card, CardHeader, CardContent, Fab, Tooltip, Fade } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import SaveIcon from '@material-ui/icons/Save';
import { DropZone } from '~/components/File';
import ExpEditSelectDepth1 from './ExpSelectDepth1';
import ExpEditSelectDepth2 from './ExpSelectDepth2';
import { MuiTextField, OutlinedBox } from '~/components/MuiCustom';
import { IExpEditModelType } from '~/store/expEdit/expEditStore';
import { FullLoading } from '~/components/Loading';

/** props */
interface IProps {
  className?: string;
  xsSize?: true | 6 | 12;
  smSize?: true | 6 | 12;
  opDelete?: (store: IExpEditModelType) => void;
  depth1?: any[];
  depth2?: any[];
  store?: IExpEditModelType;
}

/** style */
const ExpEditCardWrapper = styled(Grid)`
  width: 100%;

  .MuiFab-root {
    box-shadow: 0px 7px 10px -4px rgb(0 0 0 / 58%), 0px 12px 17px 2px rgba(0, 0, 0, 0.042),
      0px 5px 16px 4px rgba(0, 0, 0, 0.036);
  }
`;

/** 체험 정보 등록/수정에 쓰이는 입력 카드*/
const ExpEditCard: React.FC<IProps> = (props) => {
  const { xsSize, smSize, store, depth1, depth2 } = props;

  // 체험 삭제
  const handleDelete = () => {
    props.opDelete?.(store);
  };

  // 체험 저장
  const handleSave = () => {
    if (store.getValidate()) {
      store.getAlertModel().setToggleWithSetting({
        bodyContents: '저장 하시겠습니까?.',
        firstBtnText: '예',
        firstBtnClassName: 'btn-primary',
        opFirstBtnClick: () => store.setSaveData(),
        secondBtnText: '아니오',
        secondBtnClassName: 'btn-secondary'
      });
    }
  };

  // 필드값 변경시 상태값에 update
  const handleChange = (fieldName: string) => (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    store.setChangeHandler(fieldName, e.target.value);
  };

  return (
    <ExpEditCardWrapper item xs={xsSize ?? true}>
      <Card elevation={20} variant="elevation" className="border border-gray position-relative">
        <CardHeader
          title=""
          titleTypographyProps={{
            variant: 'h6'
          }}
          action={
            <div className="mt-2">
              <Tooltip title="체험 저장" arrow placement="top-start" TransitionComponent={Fade}>
                <Fab color="primary" size="medium" className="mr-4" onClick={handleSave}>
                  <SaveIcon />
                </Fab>
              </Tooltip>
              <Tooltip title="체험 삭제" arrow placement="top-end" TransitionComponent={Fade}>
                <Fab color="secondary" size="medium" onClick={handleDelete}>
                  <DeleteIcon />
                </Fab>
              </Tooltip>
            </div>
          }
        ></CardHeader>
        <CardContent>
          <Grid container spacing={3} className="contents">
            <Grid item xs={12} sm={6}>
              {/* 대분류 */}
              <ExpEditSelectDepth1 list={depth1} store={store} />
              {/* 대분류 */}
            </Grid>
            <Grid item xs={12} sm={6}>
              <ExpEditSelectDepth2 list={depth2} store={store} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <MuiTextField
                required
                error={store.name === ''}
                name="expName"
                label="체험명"
                value={store.name}
                variant="outlined"
                onChange={handleChange('name')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <MuiTextField
                required
                error={store.title === ''}
                name="expTitle"
                label="체험 주제"
                value={store.title}
                variant="outlined"
                onChange={handleChange('title')}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <MuiTextField
                required
                error={store.desc === ''}
                name="expDesc"
                label="체험 설명"
                value={store.desc}
                variant="outlined"
                onChange={handleChange('desc')}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <OutlinedBox label="체험 이미지">
                <DropZone
                  acceptedFiles={['image/*']}
                  fileLimit={6}
                  imgGridSize={6}
                  maxFileSize={10000000}
                  dropZoneModel={store.dropZoneModel}
                />
              </OutlinedBox>
            </Grid>
          </Grid>
        </CardContent>
        <FullLoading isShow={store.loading} isBgShow={true} iconBgColor="#ffffff"></FullLoading>
      </Card>
    </ExpEditCardWrapper>
  );
};

export default observer(ExpEditCard);
