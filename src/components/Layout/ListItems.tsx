import React from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import NaturePeopleIcon from '@material-ui/icons/NaturePeople';
import ListAltIcon from '@material-ui/icons/ListAlt';
import Link from 'next/link';

export const mainListItems = (
  <div>
    <Link href="/forestList">
      <ListItem button>
        <ListItemIcon>
          <NaturePeopleIcon />
        </ListItemIcon>
        <ListItemText primary="휴양림관리" />
      </ListItem>
    </Link>
    <Link href="/notiList">
      <ListItem button>
        <ListItemIcon>
          <ListAltIcon />
        </ListItemIcon>
        <ListItemText primary="공지사항" />
      </ListItem>
    </Link>
  </div>
);
