import React from 'react';
import styled from 'styled-components';
import {
  Grid,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Card,
  CardHeader,
  CardContent,
  Fab,
  Tooltip,
  Fade
} from '@material-ui/core';
import { observer } from 'mobx-react';
import { DropZone } from '~/components/File';
import DeleteIcon from '@material-ui/icons/Delete';
import SaveIcon from '@material-ui/icons/Save';
import { OutlinedBox } from '~/components/MuiCustom';
import MovieEditExpRow from '~/views/movieEdit/MovieEditExpRow';
import { IMovieDetailModelType } from '~/store/movieEdit/movieDetailStore';
import { IMovieEditModelType } from '~/store/movieEdit/movieEditStore';
import { FullLoading } from '~/components/Loading';
import MoviePercent from './MoviePercent';

/**
 * props
 * xsSize/smSize 가 true 일 경우 auto size 로 됨
 */
interface IProps {
  className?: string;
  xsSize?: true | 6 | 12;
  smSize?: true | 6 | 12;
  opDelete?: (store: IMovieEditModelType) => void;
  categ1?: string;
  store?: IMovieEditModelType;
}

/** style */
const MovieEditCardWrapper = styled(Grid)`
  width: 100%;

  /** fab 아이콘 버튼에 shadow */
  .MuiFab-root {
    box-shadow: 0px 7px 10px -4px rgb(0 0 0 / 58%), 0px 12px 17px 2px rgba(0, 0, 0, 0.042),
      0px 5px 16px 4px rgba(0, 0, 0, 0.036);
  }

  .MuiCardHeader-action {
    width: 100%;
  }

  /** 파일 업로드 프로그레스바 */
  .content-action > .MuiBox-root {
    width: 100%;
  }

  .header-contents {
    .MuiGrid-item {
      display: flex;
      flex-flow: column;
      justify-content: center;
    }
  }
`;

/** 동영상정보 등록/수정에 쓰이는 입력 카드*/
const MovieEditCard: React.FC<IProps> = (props) => {
  // const { xsSize, smSize, store, categ1, expCodeList } = props;
  const { xsSize, smSize, store, categ1 } = props;
  const { movieDetailModel } = store;

  // 동영상 삭제
  const handleDelete = async () => {
    props.opDelete?.(store);
  };

  // 동영상 저장
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

  // 체험 및 영상 분초정보 추가시
  const handleAddExpClick = () => {
    store.setAddMovieDetail();
  };

  // 체험 및 영상 분초정보 삭제시
  const handleRemoveExpClick = (removeModel: IMovieDetailModelType) => {
    store.setRemoveMovieDetail(removeModel);
  };

  return (
    <MovieEditCardWrapper item xs={xsSize ?? true}>
      <Card elevation={20} variant="elevation" className="border border-gray position-relative">
        <CardHeader
          title=""
          titleTypographyProps={{
            variant: 'h6'
          }}
          action={
            <div className="mt-2 d-flex w-100 justify-content-end content-action">
              <Grid container spacing={3} className="header-contents">
                <Grid item xs={8}>
                  <MoviePercent store={store} />
                </Grid>
                <Grid item xs={4} className="flex-row justify-content-end">
                  <Tooltip
                    title="동영상 저장"
                    arrow
                    placement="top-start"
                    TransitionComponent={Fade}
                  >
                    <Fab color="primary" size="medium" className="mr-4" onClick={handleSave}>
                      <SaveIcon />
                    </Fab>
                  </Tooltip>
                  <Tooltip
                    title="동영상 정보 삭제"
                    arrow
                    placement="top-end"
                    TransitionComponent={Fade}
                  >
                    <Fab color="secondary" size="medium" onClick={handleDelete}>
                      <DeleteIcon />
                    </Fab>
                  </Tooltip>
                </Grid>
              </Grid>
            </div>
          }
        ></CardHeader>
        <CardContent>
          <Grid container spacing={3} className="contents">
            <Grid item xs={12} sm={12}>
              <FormControl variant="outlined" required>
                <InputLabel id="lblCateg">계절 구분</InputLabel>
                <Select
                  labelId="lblCateg"
                  name="categ"
                  label="계절 구분"
                  value={!store.categ1 ? 'A' : store.categ1}
                  fullWidth
                  MenuProps={{
                    anchorOrigin: {
                      vertical: 'bottom',
                      horizontal: 'left'
                    },
                    getContentAnchorEl: null
                  }}
                  onChange={handleChange('categ1')}
                >
                  <MenuItem disabled value="">
                    <em>계절구분</em>
                  </MenuItem>
                  <MenuItem value="A">봄</MenuItem>
                  <MenuItem value="B">여름</MenuItem>
                  <MenuItem value="C">가을</MenuItem>
                  <MenuItem value="D">겨울</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {/* 체험선택, 영상 시/분/초 row */}
            {movieDetailModel.map((val, idx) => {
              const iconType = idx === 0 ? 'add' : 'remove';

              return (
                <Grid key={idx} item xs={12} sm={12}>
                  <MovieEditExpRow
                    idx={idx}
                    iconType={iconType}
                    expCodeList={store.getExpListModel()}
                    store={val}
                    opAddExpClick={handleAddExpClick}
                    opRemoveExpClick={handleRemoveExpClick}
                  />
                </Grid>
              );
            })}
            {/* 체험선택, 영상 시/분/초 row */}

            <Grid item xs={12} sm={12}>
              <OutlinedBox label="동영상 파일" required>
                <DropZone
                  acceptedFiles={['video/*']}
                  previewType="video"
                  fileLimit={1}
                  imgGridSize={12}
                  maxFileSize={100000000}
                  dropZoneModel={store.dropZoneModel}
                />
              </OutlinedBox>
            </Grid>
          </Grid>
        </CardContent>
        <FullLoading isShow={store.loading} isBgShow={true} iconBgColor="#ffffff"></FullLoading>
      </Card>
    </MovieEditCardWrapper>
  );
};

export default observer(MovieEditCard);
