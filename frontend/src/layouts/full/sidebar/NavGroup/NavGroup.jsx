import PropTypes from 'prop-types';
import { ListSubheader, styled } from '@mui/material';

const ListSubheaderStyled = styled(ListSubheader)(({ theme }) => ({
  ...theme.typography.overline,
  fontWeight: '700',
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(0),
  color: theme.palette.text.primary,
  lineHeight: '26px',
  padding: '3px 12px',
  backgroundColor: 'transparent'
}));

const NavGroup = ({ item }) => {
  return (
    <ListSubheaderStyled disableSticky disableGutters>
      {item.subheader}
    </ListSubheaderStyled>
  );
};

NavGroup.propTypes = {
  item: PropTypes.shape({
    subheader: PropTypes.string.isRequired
  }).isRequired,
};

export default NavGroup;
