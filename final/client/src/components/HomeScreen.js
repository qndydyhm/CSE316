import React, { useContext, useEffect } from 'react'
import { GlobalStoreContext } from '../store'
import ListCard from './ListCard.js'
import { Button, Box, Typography, InputBase, Menu, MenuItem } from '@mui/material'
import HomeIcon from '@mui/icons-material/Home';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonIcon from '@mui/icons-material/Person';
import FunctionsIcon from '@mui/icons-material/Functions';
import SortIcon from '@mui/icons-material/Sort';
import List from '@mui/material/List';
import { DeleteModal } from '.';
import AuthContext from '../auth';

/*
    This React component lists all the top5 lists in the UI.
    
    @author McKilla Gorilla
*/
const HomeScreen = () => {
    const { store } = useContext(GlobalStoreContext);
    const { auth } = useContext(AuthContext);
      const [anchorEl, setAnchorEl] = React.useState(null);
      const open = Boolean(anchorEl);

    useEffect(() => {
        store.loadIdNamePairs();
    }, []);

    async function handleLoadHome() {
        if (auth.user.name !== 'Guest') {
            store.loadHomeView();
        }
    }

    async function handleLoadGroup() {
        store.loadGroupView();
    }

    async function handleLoadUser() {
        store.loadUserView();
    }

    async function handleLoadCommunity() {
        store.loadCommunityView();
    }

    async function handleFiltList(event) {
        console.log('filting');
        store.filter(event.target.value);
    }

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    async function handleSortByNewest() {
        handleClose();
        store.sort(1);
    }

    async function handleSortByOldest() {
        handleClose();
        store.sort(0);
    }

    async function handleSortByViews() {
        handleClose();
        store.sort(2);
    }

    async function handleSortByLikes() {
        handleClose();
        store.sort(3);
    }

    async function handleSortByDislikes() {
        handleClose();
        store.sort(4);
    }



    let listCard = "";
    if (store) {
        listCard =
            <List sx={{ width: '90%', left: '5%', bgcolor: 'var(--swatch-primary)' }}>
            {
                store.idNamePairs.map((pair) => (
                    <div><ListCard
                        key={pair._id}
                        idNamePair={pair}
                        selected={false}
                    />
                    <List sx={{ width: '100%', height: '10%'}}></List></div>
                ))
            }
            </List>;
    }
    return (
        <div id="top5-list-selector">
        <DeleteModal />
            <div id="list-selector-heading">
            <Button
                color="primary" 
                aria-label="home"
                id="home-button"
                disabled={auth.user.name === 'Guest'}
                onClick={
                    (event) => {
                        handleLoadHome()
                    }
                }
            >
                <HomeIcon />
            </Button>
            <Button
                color="primary" 
                aria-label="group"
                id="group-button"
                onClick={
                    (event) => {
                        handleLoadGroup()
                    }
                }
            >
                <GroupsIcon />
            </Button>
            <Button
                color="primary" 
                aria-label="user"
                id="user-button"
                onClick={
                    (event) => {
                        handleLoadUser()
                    }
                }
            >
                <PersonIcon />
            </Button>
            <Button
                color='primary'
                aria-label='community'
                id= 'community-button'
                onClick={
                    (event) => {
                        handleLoadCommunity()
                    }
                }
            >
                <FunctionsIcon />
            </Button>
            <InputBase sx={{width: '30%', maxWidth: '30%'}}
                id='search'
                placeholder=" Search…"
                onChange={handleFiltList}
            >
            </InputBase>
            <Box sx={{ flexGrow: 1 }} />
            <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                <Box component="span" sx={{ p: 2}}>
                    <Typography variant='h6' id='sort-text'>SORT BY</Typography>
                </Box>
                <Button
                color='primary'
                aria-label='sort'
                id= 'sort-button'
                onClick={handleClick}
            >
                    <SortIcon />
                </Button>
              <Menu
                id="sort"
                anchorEl={anchorEl}
                    anchorOrigin={{
                vertical: 'buttom',
                horizontal: 'left',
            }}
                    transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                  'aria-labelledby': 'basic-button',
                }}
              >
                <MenuItem onClick={handleSortByNewest}>Published Date (Newest)</MenuItem>
                <MenuItem onClick={handleSortByOldest}>Published Date (Oldest)</MenuItem>
                <MenuItem onClick={handleSortByViews}>Views</MenuItem>
                <MenuItem onClick={handleSortByLikes}>Likes</MenuItem>
                <MenuItem onClick={handleSortByDislikes}>Dislikes</MenuItem>
              </Menu>
            </Box>
            </div>
            <div id="list-selector-list">
                {
                    listCard
                }
            </div>
        </div>)
}

export default HomeScreen;
