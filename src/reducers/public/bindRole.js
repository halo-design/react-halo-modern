import createReducer from 'STORE/createReducer'
import { groupList } from 'UTIL/filters'
import NProgress from 'nprogress'
import { getUserRoleListAction, userRoleAssociationAction, getRoleListAction } from '../fetch/role'
import { NotiSuccess, NotiError } from 'UTIL/info'

// 用户绑定角色所需要数据的类型
const converTreeSelectRole = roleList => ({
  label: roleList.roleName,
  value: roleList.roleId,
  key: roleList.roleId,
  children: []
})

// 查询所有角色时，树所需要的类型
const converTreeRole = role => ({
  roleId: role.roleId,
  rolePId: role.rolePId,
  roleName: role.roleName,
  roleDesc: role.roleDesc,
  roleStatus: role.roleStatus,
  roleType: role.roleType,
  children: []
})

export const getUserRoleTree = userNo => async (dispatch, getState) => {
  const action = await dispatch(getUserRoleListAction(userNo))
  const dataBody = action.data.body
  let selectKeys = []
  let userRoleRelList = dataBody.userRoleRelList
  userRoleRelList.map(item => {
    item.state === '1' ? selectKeys.push(item.roleId) : null
  })
  dispatch(updateSelectedRole(selectKeys))
  let allSelectRoleList = dataBody.userRoleRelList
  let selectRoleTreeList = groupList(allSelectRoleList, 'roleId', 'rolePId', 'children', converTreeSelectRole)
  dispatch(userGetRole({
    selectRoleTreeList,
    allSelectRoleList
  }))
}

// 绑定角色的方法
export const userRoleAssociation = (userNo, userName, roleList) => async (dispatch, getState) => {
  const action = await dispatch(userRoleAssociationAction(userNo, userName, roleList))
  const dataBody = action.data.body
  if (dataBody.errorCode === '0') {
    NotiSuccess({ description: '綁定成功！' })
  } else {
    NotiError({ description: '绑定失败！' })
  }
}

export const getRoleTree = () => async (dispatch, getState) => {
  NProgress.start()
  const action = await dispatch(getRoleListAction())
  const dataBody = action.data.body
  const flatRoleList = dataBody.roleList
  let roleTreeList = groupList(flatRoleList, 'roleId', 'rolePId', 'children', converTreeRole)
  let selectRoleTreeList = groupList(flatRoleList, 'roleId', 'rolePId', 'children', converTreeSelectRole)
  dispatch(updateRoleTreeList(selectRoleTreeList))
  dispatch(updateRoleTree(roleTreeList))
  NProgress.done()
}

const actionsReducer = createReducer({
  userGetRole: data => data,
  updateSelectedRole: selectedRoleList => ({ selectedRoleList }),
  updateRoleTree: roleTreeList => ({ roleTreeList }),
  updateRoleTreeList: selectRoleTreeList => ({ selectRoleTreeList })
}, {
  roleTreeList: [],
  selectRoleTreeList: [],
  allSelectRoleList: [],
  selectedRoleList: []
})

export const { userGetRole, updateSelectedRole, updateRoleTree, updateRoleTreeList } = actionsReducer.actions
export default actionsReducer.reducer
