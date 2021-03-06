import createReducer from 'STORE/createReducer'
import NProgress from 'nprogress'
import { NotiSuccess, NotiError } from 'UTIL/info'
import { postListAction, addPostListAction, modifyPostAction, delPostAction } from '../fetch/post'

export const getPostList = () => async (dispatch, getState) => {
  NProgress.start()
  let state = getState().pages.postManage
  const action = await dispatch(postListAction(state.currentPage, state.turnPageShowNum))
  if (action.data.body.errorCode === '0') {
    dispatch(setAllPostList(action.data.body))
  }
  NProgress.done()
}

export const addPostList = (data, success, fail) => async (dispatch, getState) => {
  const action = await dispatch(addPostListAction(data))
  if (action.data.body.errorCode === '0') {
    NotiSuccess({ description: '岗位添加成功！' })
    dispatch(getPostList())
    if (success) success()
  } else {
    NotiError({ description: '岗位添加失败！' })
    if (fail) fail()
  }
}

export const modifyPost = (data, success, fail) => async (dispatch, getState) => {
  const action = await dispatch(modifyPostAction(data))
  if (action.data.body.errorCode === '0') {
    NotiSuccess({ description: '岗位修改成功！' })
    dispatch(getPostList())
    if (success) success()
  } else {
    NotiError({ description: '岗位修改失败！' })
    if (fail) fail()
  }
}

export const deletePost = data => async (dispatch, getState) => {
  const action = await dispatch(delPostAction(data))
  if (action.data.body.errorCode === '0') {
    NotiSuccess({ description: '岗位删除成功！' })
    dispatch(getPostList())
  } else {
    NotiError({ description: '岗位删除失败！' })
  }
}

const actionsReducer = createReducer({
  setAllPostList: postListData => ({ postListData }),
  resetPageState: () => ({ currentPage: 1, turnPageShowNum: 10 }),
  setCurPageState: currentPage => ({ currentPage }),
  setPageShowNum: turnPageShowNum => ({ turnPageShowNum }),
  closeAddEditBox: () => ({ addEditBoxVisible: false }),
  setAddPostState: () => ({
    addEditBoxVisible: true,
    addEditBoxType: 'add',
    addEditBoxInitVals: {}
  }),
  setEditPostState: params => ({
    addEditBoxVisible: true,
    addEditBoxType: 'edit',
    addEditBoxInitVals: params
  })
}, {
  postListData: [],
  currentPage: 1,
  turnPageShowNum: 10,

  addEditBoxVisible: false,
  addEditBoxType: 'add',
  addEditBoxInitVals: {}
})

export const { setAllPostList, resetPageState, setCurPageState, setPageShowNum, closeAddEditBox, setAddPostState, setEditPostState } = actionsReducer.actions
export default actionsReducer.reducer
