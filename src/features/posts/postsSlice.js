import { createSlice, nanoid, createAsyncThunk, createSelector } from '@reduxjs/toolkit'
import { sub } from 'date-fns'
import{client} from '../../api/client'

/*const initialState = [
    { id: '1', title: 'First Post!', content: 'Hello!', date: sub(new Date(), { minutes: 10 }).toISOString(), reactions: { thumbsUp: 0, hooray: 0, heart:0, rocket:0, eyes:0 }},
    { id: '2', title: 'Second Post', content: 'More text', date: sub(new Date(), { minutes: 5 }).toISOString(), reactions: { thumbsUp: 0, hooray: 0, heart: 0, rocket: 0, eyes: 0 } }
]*/

const initialState = {
    posts: [],
    status: 'idle',
    error: null
}

export const fetchPosts = createAsyncThunk('posts/fetchPosts', async()=>{
    const response = await client.get('/fakeApi/posts')
    return response.posts
})

export const addNewPost = createAsyncThunk(
    'posts/addNewPost',
    // The payload creator receives the partial `{title, content, user}` object
    async initialPost => {
        // We send the initial data to the fake API server
        const response = await client.post('/fakeApi/posts', { post: initialPost })
        // The response includes the complete post object, including unique ID
        return response.post
    }
)

const postsSlice = createSlice({
    name: 'posts',
    initialState,
    reducers: {
        /*postAdded(state, action){  //reducer
            state.push(action.payload)
        },*/
        /*postAdded: {
            reducer(state, action){
                state.posts.push(action.payload)
            },
            prepare(title, content, userId) {
                return {
                    payload: {
                        id: nanoid(),
                        date: new Date().toISOString(),
                        title,
                        content,
                        user: userId,
                        reactions: { thumbsUp: 0, hooray: 0, heart: 0, rocket: 0, eyes: 0 }
                    }
                }
            }
        
        },*/


        postUpdated(state, action){
            const {id, title, content} = action.payload
            const existingPost = state.posts.find(post => post.id === id)
            if(existingPost) {
                existingPost.title = title;
                existingPost.content = content;
            }
        },
        reactionAdded(state, action){
            const{postId, reaction} = action.payload
            const existingPost = state.posts.find(post=>post.id === postId)
            if(existingPost){
                existingPost.reactions[reaction]++
            }
        }
    },
    extraReducers:{
        [fetchPosts.pending]: (state, action) =>{
            state.status = 'loading'
        },
        [fetchPosts.fulfilled]: (state, action) => {
            state.status = 'succeeded'
            // Add any fetched posts to the array
            state.posts = state.posts.concat(action.payload)
        },
        [fetchPosts.rejected]: (state, action) => {
            state.status = 'failed'
            state.error = action.error.message
        },
        [addNewPost.fulfilled]: (state, action) => {
            // We can directly add the new post object to our posts array
            state.posts.push(action.payload)
        }
    }
})

export const { postAdded, postUpdated, reactionAdded} = postsSlice.actions  //Action Creator

export default postsSlice.reducer

export const selectAllPosts = state => state.posts.posts



export const selectPostById = (state, postId) => {
    state.posts.posts.find(post => post.id === postId)
}

export const selectPostsByUser = createSelector(
    [selectAllPosts, (state, userId) => userId],
    (posts, userId) => posts.filter(post => post.user === userId)
)