import { useContext, useState } from 'react'
import { GlobalStoreContext } from '../store'
import { Box, List, ListItem, IconButton, Grid, Typography, ListItemText, TextField, Link } from '@mui/material';
import api from '../api'
import AuthContext from '../auth'
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

/*
    This is a card in our list of top 5 lists. It lets select
    a list for editing and it has controls for changing its 
    name or deleting it.
    
    @author McKilla Gorilla
*/
function ListCard(props) {
    const { store } = useContext(GlobalStoreContext);
    const [ expandState, setExpandState] = useState(false);
    const [ updated, setUpdated] = useState(false);
    const { idNamePair } = props;
    const { auth } = useContext(AuthContext);

    function handleLoadList(event, id) {
        if (!event.target.disabled) {
            // CHANGE THE CURRENT LIST
            store.setCurrentList(id);
        }
    }

    async function handleDeleteList(event, id) {
        event.stopPropagation();
        store.markListForDeletion(id);
    }

    let list = idNamePair;
    async function updateList(id) {
        try {
            let response = '';
            if (list.owner !== 'Community') {
                response = await api.getTop5ListById(id);
            }
            else {
                response = await api.getCommunityListById(id);
            }
            if (response.data.success) {
                response = response.data.top5List;
                list.likes = response.likes;
                list.dislikes = response.dislikes;
                list.views = response.views;
                list.comments = response.comments;
                list.publishedAt = response.publishedAt;
            }
        }
        catch (err) {
            try {
                store.showAlert(err.response.data.errorMessage);
            }
            catch{}
        }
    }
    async function updateListViews(id) {
        try {
            if (list.owner !== 'Community') {
                await api.updateTop5ListViews(id);
            }
            else {
                await api.updateCommunityListViews(id);
            }
        }
        catch (err) {
            try {
                store.showAlert(err.response.data.errorMessage);
            }
            catch{}
        }
        handleExpand(id);
    }
    async function updateListLikes(id) {
        try {
            let response = '';
            if (list.owner !== 'Community') {
                response = await api.updateTop5ListLikes(id);
            }
            else {
                //response = await api.updateTop5ListLikes(id);
                response = await api.updateCommunityListLikes(id);
            }
            if (response.data.success) {
                response = response.data.top5List;
                list.likes = response.likes;
                list.dislikes = response.dislikes;
                list.views = response.views;
                list.comments = response.comments;
                list.publishedAt = response.publishedAt;
                document.getElementById('likes-'+id).innerHTML=response.likes;
                document.getElementById('dislikes-'+id).innerHTML=response.dislikes;
            }
        }
        catch (err) {
            try {
                store.showAlert(err.response.data.errorMessage);
            }
            catch{}
        }
    }
    async function updateListDislikes(id) {
        try {
            let response = '';
            if (list.owner !== 'Community') {
                response = await api.updateTop5ListDislikes(id);
            }
            else {
                response = await api.updateCommunityListDislikes(id);
            }
            if (response.data.success) {
                response = response.data.top5List;
                list.likes = response.likes;
                list.dislikes = response.dislikes;
                list.views = response.views;
                list.comments = response.comments;
                list.publishedAt = response.publishedAt;
                document.getElementById('likes-'+id).innerHTML=response.likes;
                document.getElementById('dislikes-'+id).innerHTML=response.dislikes;
            }
        }
        catch (err) {
            try {
                store.showAlert(err.response.data.errorMessage);
            }
            catch{}
        }
    }


    async function updateListComments(event, id) {
        try {
            if (event.code ==="Enter" && event.target.value) {
            let response = '';
            let payload = {
                comment: event.target.value,
            };
            if (list.owner !== 'Community') {
                response = await api.updateTop5ListComment(id, payload);
            }
            else {
                response = await api.updateCommunityListComment(id, payload);
            }
            if (response.data.success) {
                response = response.data.top5List;
                list.likes = response.likes;
                list.dislikes = response.dislikes;
                list.views = response.views;
                list.comments = response.comments;
                list.publishedAt = response.publishedAt;
                setUpdated(true);
            }
            }
        }
        catch (err) {
            try {
                store.showAlert(err.response.data.errorMessage);
            }
            catch{}
        }
    }

    async function handleExpand(id) {
        await updateList(id);
        setExpandState(!expandState);
    }

    let items = "";
    if (expandState) {
        items =
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {
                    list.items.map((item, index) => (
                        <ListItem key={'item-'+(index+1)}>
                            <ListItemText primary={(index+1) + '. ' + item}/>
                        </ListItem>
                    ))
                }
            </List>;
    }
    if (updated) {
        items =
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {
                    list.items.map((item, index) => (
                        <ListItem key={'item-'+(index+1)}>
                            <ListItemText primary={(index+1) + '. ' + item}/>
                        </ListItem>
                    ))
                }
            </List>;
                setUpdated(false);
    }
    let comments = "";
    if (expandState) {
        comments =
            //<List sx={{ width: '100%', height: '10%', bgcolor: 'background.paper' }}>
            <List
                sx={{
                width: '100%',
                bgcolor: 'background.paper',
                position: 'relative',
                overflow: 'auto',
                maxHeight: 250,
                height: 250,
                '& ul': { padding: 0 },
              }}
              subheader={<li />}
            >
            {
                list.comments.map((comment, index) => (
                    <ListItem
                        key={'comment-'+(index+1)}>
                        <ListItemText secondary={'by ' + comment[0]} primary={<Typography variant='h5'>{comment[1]}</Typography>}/>
                    </ListItem>
                ))
            }
            </List>;
    }

    let backgroundColor = 'background.paper';
    if (list.published) {
        backgroundColor =  '#f8f8f8';
    }
    else {
        backgroundColor = '#e0f0ff';
    }



    let cardElement =
        <Box sx={{ flexGrow: 1, borderRadius: 8, bgcolor: {backgroundColor}, borderColor: 'primary.main'}}>
              <Grid container spacing={2}>
            <Grid item xs={12}>
            <ListItem
                id={list._id}
                key={list._id}
                sx={{ marginTop: '15px', display: 'flex', p: 1 }}
                style={{
                    fontSize: '48pt',
                    width: '100%'
                }}
            >
                    <Box sx={{ p: 1, flexGrow: 1 }}><ListItem> <ListItemText primary={<Typography variant='h3'>{list.name}</Typography>} secondary={<div><Typography>{'by ' + list.owner}</Typography><Typography>{
                    list.published?
                    <div><Typography> {'Views: ' + list.views}</Typography><Typography>{list.owner==='Community'?'Updated: ':'Published: '}{list.publishedAt[0]+'-'+list.publishedAt[1]+'-'+list.publishedAt[2]}</Typography></div>:
                    <Link herf='#' onClick={
                        (event) => {
                                handleLoadList(event, list._id);
                        }
                    }>
                    edit</Link>}
                        </Typography></div>}/> </ListItem>
        </Box>
                    <Box sx={{ p: 1 }}>
                            <IconButton aria-label='like'
                                onClick={
                                    (event) => {
                                        updateListLikes(list._id)
                                    }
                                }>
                                <ThumbUpIcon style={{fontSize:'24pt'}} />
                            </IconButton>
                    </Box>
                    <Typography id={'likes-'+list._id}>{list.likes}</Typography>
                    <Box sx={{ p: 1 }}>
                            <IconButton aria-label='dislike'
                                onClick={
                                    (event) => {
                                        updateListDislikes(list._id)
                                    }
                                }>
                                <ThumbDownIcon style={{fontSize:'24pt'}} />
                            </IconButton>
                    </Box>
                    <Typography id={'dislikes-'+list._id}>{list.dislikes}</Typography>
                    <Box sx={{ p: 1 }}>
                        <IconButton aria-label='expandMore' onClick={ 
                            (event) => {
                                updateListViews(list._id)
                            }}>
                            <ExpandMoreIcon style={{fontSize:'24pt'}} />
                        </IconButton>
                    </Box>
                </ListItem>
            </Grid>
        </Grid>
        </Box>


    if (expandState) {
        cardElement =
        <Box sx={{ flexGrow: 1, borderRadius:8, bgcolor: {backgroundColor}}}>
            <Grid container alignItems="flex-start" justifyContent="center" spacing={2}>
            <Grid item xs={12}>
            <ListItem
                id={list._id}
                key={list._id}
                sx={{ marginTop: '15px', display: 'flex', p: 1 }}
                style={{
                    fontSize: '48pt',
                    width: '100%'
                }}
            >
                    <Box sx={{ p: 1, flexGrow: 1 }}><ListItem> <ListItemText primary={<Typography variant='h3'>{list.name}</Typography>} secondary={<div><Typography>{'by ' + list.owner}</Typography><Typography>{
                    list.published?
                    <div><Typography> {'Views: ' + list.views}</Typography><Typography>{list.owner==='Community'?'Updated: ':'Published: '}{list.publishedAt[0]+'-'+list.publishedAt[1]+'-'+list.publishedAt[2]}</Typography></div>:
                    <Link herf='#' onClick={
                        (event) => {
                                handleLoadList(event, list._id);
                        }
                    }>
                    edit</Link>}
                        </Typography></div>}/> </ListItem>
        </Box>
                    <Box sx={{ p: 1 }}>
                            <IconButton aria-label='like'
                                onClick={
                                    (event) => {
                                        updateListLikes(list._id)
                                    }
                                }>
                                <ThumbUpIcon style={{fontSize:'24pt'}} />
                            </IconButton>
                    </Box>
                    <Typography id={'likes-'+list._id}>{list.likes}</Typography>
                    <Box sx={{ p: 1 }}>
                            <IconButton aria-label='dislike'
                                onClick={
                                    (event) => {
                                        updateListDislikes(list._id)
                                    }
                                }>
                                <ThumbDownIcon style={{fontSize:'24pt'}} />
                            </IconButton>
                    </Box>
                    <Typography id={'dislikes-'+list._id}>{list.dislikes}</Typography>
                    <Box sx={{ p: 1 }}>
                            <IconButton aria-label='expandMore' onClick={ 
                                    (event) => {
                                        handleExpand(list._id) 
                                    }
                            }>
                                <ExpandLessIcon style={{fontSize:'24pt'}} />
                            </IconButton>
                    </Box>
                </ListItem>
            </Grid>
            <Grid item xs={5.5} sx={{}}>
                <Box sx={{bgcolor: 'black', border: '1px dashed grey'}}>{items}</Box>
            </Grid>
            <Grid item xs={5.5}>
                <Box id={'comments-'+list._id} sx={{bgcolor: 'black', border: '1px dashed grey'}}>{comments}</Box>
            </Grid>
            <Grid item xs={2.5}>
                {
                }
            </Grid>
            <Grid item xs={2.5}>
                {
                    (auth.user.name===list.owner)?
                    <Link herf='#' onClick={
                        (event) => {
                                handleDeleteList(event, list._id);
                        }
                    }>
                    delete</Link>:
                    <div/>
                }
            </Grid>
            <Grid item xs={5}>
                <TextField placeholder='Leave Your Comment here'
                sx={{bgcolor: '#fff', width: 500, maxWidth: '100%'}}
                onKeyPress={
                    (event) => {
                        updateListComments(event, list._id);
                    }
                }/>
            </Grid>
        </Grid>
        </Box>
    }

    return (
        cardElement
    );
}

export default ListCard;
