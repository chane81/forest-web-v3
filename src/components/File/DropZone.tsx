import { ElementType } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { CardMedia, TextField, FormControl, Card, CardContent, Grid } from '@material-ui/core';
import { DropzoneAreaBase, FileObject, PreviewIconProps } from 'material-ui-dropzone';
import { MuiNumberInput } from '~/components/MuiCustom';
import { IDropZoneModelType } from '~/store';
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';
import { useSnackbar } from 'notistack';

/** props
 * fileLimit: 파일 제한개수
 * maxFileSize: 파일 용량 limit (default: 3000000 (3 mb))
 */
interface IProps {
  className?: string;
  label?: string;
  imgGridSize?: boolean | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'auto';
  dropZoneModel?: IDropZoneModelType;
  fileLimit?: number;
  maxFileSize?: number;
  previewType?: ElementType<any>;
  acceptedFiles?: string[];
  isSortHidden?: boolean;
}

/**  props: 미리보기 */
interface IPreviewImg {
  dropZoneModel: IDropZoneModelType;
  fileObj: IDropzoneFile;
  previewType?: ElementType<any>;
  isSortHidden?: boolean;
}

/**
 * 드랍존 FileObject extends
 *  gubun: 'D': DB 에서 불러온 데이터, '': 일반 파일업로드 데이터
 *  */
export interface IDropzoneFile extends FileObject {
  name?: string;
  url?: string;
  sort?: number;
  imgSeqNo?: number;
  gubun?: string;
  guid?: string;
}

/** style */
const DropZoneAWrapper = styled(FormControl)<IProps>`
  width: 100%;

  .MuiDropzonePreviewList-root {
    width: 100%;
    margin: 0;
  }

  .MuiDropzoneArea-root {
    padding-left: 0.7rem;
    padding-right: 0.7rem;
  }

  .MuiGrid-spacing-xs-8 > .MuiGrid-item {
    padding: 0.5rem;
  }
`;

/** 미리보기 이미지 컴포넌트 */
const PreviewImg: React.FC<IPreviewImg> = observer((props) => {
  const { dropZoneModel, fileObj } = props;
  const fileName = fileObj.file?.name;
  const mstFile = dropZoneModel.getFileWithGuid(fileObj.guid);

  // 파일업로드 중에 브라우저를 키우면 fileObj.file 부분이 비게 된다.
  // file add 시 저장된 상태값에서 file 오프젝트를 가져오게 함
  const persistFileObj = !!mstFile?.file ? mstFile : fileObj;
  const imgSrc = persistFileObj.url
    ? persistFileObj.url
    : persistFileObj.file.arrayBuffer
    ? URL.createObjectURL(persistFileObj.file)
    : '';

  // 소트 변경시
  const handleSortChange = (e) => {
    dropZoneModel.setSort(fileObj.guid, parseInt(e.target.val, 10));
  };

  return (
    <Card elevation={10}>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} className="position-relative">
            <CardMedia
              component={props.previewType ?? 'img'}
              src={imgSrc}
              // title='image'
            />
          </Grid>
          <Grid item xs>
            <TextField
              name="fileName"
              label="파일명"
              inputProps={{ readOnly: true }}
              defaultValue={fileName}
              variant="outlined"
              size="small"
              onClick={(e) => e.stopPropagation()}
            />
          </Grid>
          <Grid item xs={6} hidden={props.isSortHidden}>
            <MuiNumberInput
              name="sort"
              label="소트"
              defaultValue={fileObj.sort}
              variant="outlined"
              size="small"
              onClick={(e) => e.stopPropagation()}
              onChange={handleSortChange}
            ></MuiNumberInput>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
});

/**
 * component
 * 파일 drop zone
 */
const DropZone: React.FC<IProps> = (props, ref) => {
  const { dropZoneModel, label } = props;
  let { fileLimit, maxFileSize, imgGridSize } = props;
  const { enqueueSnackbar } = useSnackbar();

  // props default set
  // file update 제한개수 default set
  fileLimit = fileLimit ?? 6;

  // file 용량 제한
  maxFileSize = maxFileSize ?? 3000000;

  // 이미지 프리뷰 grid set
  imgGridSize = imgGridSize ?? 3;

  /** 드랍존 파일 추가 */
  const handleFileAdd = (newFiles: IDropzoneFile[]) => {
    // 파일 업로드 개수 제한
    if (dropZoneModel.dropZoneFiles.length < fileLimit) {
      const files = newFiles.map((val, idx) => {
        const sort = dropZoneModel.dropZoneFiles.length + 1 + idx;
        const guid = uuidv4();
        // add 성공 메시지
        enqueueSnackbar(`${val.file.name} 추가`, {
          variant: 'success'
        });

        return {
          ...val,
          name: val.file.name,
          sort,
          guid
        };
      });

      // 글로벌 상태값에 전달
      dropZoneModel.setAddFile(files);
    } else {
      // add 리미트 제한 메시지
      enqueueSnackbar(`파일을 추가 할 수 없습니다. 개수 제한: ${fileLimit}개`, {
        variant: 'error'
      });
    }
  };

  /** 드랍존 파일 삭제 */
  const handleFileDel = (delFile: IDropzoneFile, idx: number) => {
    // 상태값 변경
    dropZoneModel.setDelFile(delFile.guid);

    // 삭제 메시지
    enqueueSnackbar(`${delFile.name} 삭제`, {
      variant: 'info'
    });
  };

  /** 드랍존 미리보기 컴포넌트 구성 */
  const handlePreviewIcon = (fileObj: IDropzoneFile, classes: PreviewIconProps) => {
    return (
      <PreviewImg
        dropZoneModel={dropZoneModel}
        fileObj={fileObj}
        previewType={props.previewType}
        isSortHidden={props.isSortHidden}
      ></PreviewImg>
    );
  };

  /** 파일 형식 제한 핸들러 */
  const handleDropRejectMsg = (
    rejectedFile: File,
    acceptedFiles: string[],
    maxFileSize: number
  ): string => {
    // 삭제 메시지
    enqueueSnackbar(`${rejectedFile.name} 파일형식이 맞지 않습니다.`, {
      variant: 'warning'
    });

    return;
  };

  /** 파일 동시 드랍시 개수 제한 */
  const handleFileLimitMsg = (filesLimit: number): string => {
    // add 리미트 제한 메시지
    enqueueSnackbar(`파일을 추가 할 수 없습니다. 개수 제한: ${fileLimit}개`, {
      variant: 'error'
    });

    return;
  };

  return (
    <>
      <DropZoneAWrapper className="popup-layer">
        <DropzoneAreaBase
          showAlerts={false}
          acceptedFiles={props.acceptedFiles}
          fileObjects={dropZoneModel.dropZoneFiles.toJSON()}
          Icon={null}
          filesLimit={fileLimit}
          maxFileSize={props.maxFileSize}
          previewGridProps={{
            item: { xs: props.imgGridSize }
          }}
          dropzoneText=""
          onAdd={handleFileAdd}
          onDelete={handleFileDel}
          getFileLimitExceedMessage={handleFileLimitMsg}
          getDropRejectMessage={handleDropRejectMsg}
          onAlert={(message, variant) => {
            console.log(`${variant}: ${message}`);
          }}
          showPreviewsInDropzone={true}
          getPreviewIcon={handlePreviewIcon}
        />
      </DropZoneAWrapper>
    </>
  );
};

export default observer(DropZone);
