import { forwardRef, ForwardRefExoticComponent, RefAttributes } from 'react';
import styled from 'styled-components';

import AddBox from '@material-ui/icons/AddBox';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';
import MaterialTable, { Icons, MaterialTableProps } from 'material-table';

interface IProps extends MaterialTableProps<any> {}

const makeRef = (Comp: React.FC): ForwardRefExoticComponent<RefAttributes<SVGSVGElement>> => {
  return forwardRef((props: any, ref: any) => <Comp {...props} ref={ref} />);
};

/** style */
const MuiTableWrapper = styled('div')`
  .MuiPaper-root {
    border-top: 1px solid rgba(224, 224, 224, 1);
    box-shadow: none;
  }
`;

const tableIcons: Icons = {
  Add: makeRef(AddBox),
  Check: makeRef(Check),
  Clear: makeRef(Clear),
  Delete: makeRef(DeleteOutline),
  DetailPanel: makeRef(ChevronRight),
  Edit: makeRef(Edit),
  Export: makeRef(SaveAlt),
  Filter: makeRef(FilterList),
  FirstPage: makeRef(FirstPage),
  LastPage: makeRef(LastPage),
  NextPage: makeRef(ChevronRight),
  PreviousPage: makeRef(ChevronLeft),
  ResetSearch: makeRef(Clear),
  Search: makeRef(Search),
  SortArrow: makeRef(ArrowDownward),
  ThirdStateCheck: makeRef(Remove),
  ViewColumn: makeRef(ViewColumn)
};

/** material-table 컴포넌트 */
const MuiTable: React.FC<IProps> = (props) => {
  return (
    <MuiTableWrapper>
      <MaterialTable icons={tableIcons} {...props}></MaterialTable>
    </MuiTableWrapper>
  );
};

export { MuiTable };
