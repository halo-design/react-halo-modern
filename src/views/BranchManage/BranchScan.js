import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Form, Button, Input, Row, Col, Select, message, Modal, TreeSelect } from 'antd'
import Spin from 'COMPONENT/effects/Spin'
import BranchAdd from './BranchAdd'
import { checkBtnList, isEmptyObject } from 'UTIL/filters'
import * as branchScanActions from 'REDUCER/pages/branchManage'

const FormItem = Form.Item
const Confirm = Modal.confirm
const Option = Select.Option
const SHOW_PARENT = TreeSelect.SHOW_PARENT

@connect(
  state => {
    const {
      pages: {
        branchManage: { selectedObject }
      },
      public: {
        menu: { userMenu },
        branchTree: { selectTreeBranchList }
      }
    } = state
    return {
      userMenu,
      selectedBranch: selectedObject,
      branchNodes: selectTreeBranchList
    }
  },
  dispatch => bindActionCreators({ ...branchScanActions }, dispatch)
)

@Form.create()

export default class BranchScanView extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      brhId: 0,
      loading: false
    }
  }

  showSpin () {
    this.setState({
      loading: true
    })
  }

  hideSpin () {
    this.setState({
      loading: false
    })
  }

  addBranch () {
    this.props.setAddBranchVisible(true)
  }

  modBranch () {
    const { form, selectedBranch, branchModify, changeBranchSelected } = this.props
    const { getFieldsValue, resetFields } = form

    if (!isEmptyObject(selectedBranch) && selectedBranch.brhId) {
      Confirm({
        title: '确认修改这项内容？',
        content: '点击确认修改',
        onOk: () => {
          let level = ''
          let params = getFieldsValue()
          switch (params.brhLevel) {
            case '等级1':
              level = '1'
              break
            case '等级2':
              level = '2'
              break
            case '等级3':
              level = '3'
              break
          }
          params = {
            ...getFieldsValue(),
            brhLevel: level
          }
          // 避免将空字段保存为 'undefined'
          if (!params.brhParentId) {
            params.brhParentId = ''
          }

          // 避免选中节点自身作为所属机构
          if (selectedBranch.brhId === params.brhParentId) {
            message.error('不允许选择当前机构为所属机构！')
          } else {
            const reload = () => {
              resetFields()
              changeBranchSelected(params)
              this.hideSpin()
            }

            this.showSpin()
            branchModify(params, reload, reload)
          }
        }
      })
    } else {
      message.warning('请先选择一个机构节点！')
    }
  }

  delBranch () {
    const { form, selectedBranch, branchDelete, resetForm } = this.props
    const { getFieldsValue } = form
    if (!isEmptyObject(selectedBranch) && selectedBranch.brhId) {
      Confirm({
        title: '确认删除这项内容？',
        content: '点击确认删除',
        onOk: () => {
          // 当点击删除机构
          const params = getFieldsValue()
          this.showSpin()
          branchDelete(params, () => {
            resetForm()
            this.hideSpin()
          }, () => {
            this.hideSpin()
          })
        }
      })
    } else {
      message.warning('请先选择一个机构节点！')
    }
  }

  componentWillUnmount () {
    this.props.resetForm()
  }

  render () {
    const { userMenu, form, selectedBranch, branchNodes } = this.props
    const { getFieldDecorator, resetFields } = form

    const addBtn = (
      <Button
        size='large'
        type='primary'
        onClick={e => this.addBranch()}
      >
        新增机构
      </Button>
    )
    const modBtn = (
      <Button
        size='large'
        onClick={e => this.modBranch()}
      >
        保存修改
      </Button>
    )
    const delBtn = (
      <Button
        size='large'
        type='danger'
        onClick={e => this.delBranch()}
      >
        删除机构
      </Button>
    )

    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 12 }
    }

    const getLevel = () => {
      switch (selectedBranch.brhLevel) {
        case '1':
          return '等级1'
        case '2':
          return '等级2'
        case '3':
          return '等级3'
        default:
          return selectedBranch.brhLevel
      }
    }

    // 机构等级选择
    const setOptions = ['等级1', '等级2', '等级3'].map(
      item => <Option key={item} value={item}>{item}</Option>
    )

    const treeProps = {
      dropdownStyle: { maxHeight: 400, overflow: 'auto' },
      treeData: branchNodes,
      placeholder: '请选择所属机构',
      treeDefaultExpandAll: true,
      treeCheckStrictly: false,
      treeCheckable: false,
      showCheckedStrategy: SHOW_PARENT
    }

    return (
      <div className='app-form-scan'>
        <div className='app-search-panel'>
          <div className='button-group'>
            <Button
              size='large'
              type='ghost'
              onClick={e => resetFields()}
            >
              重置修改
            </Button>
            {checkBtnList(userMenu, [{
              item: 'F002',
              button: modBtn
            }, {
              item: 'F001',
              button: addBtn
            }, {
              item: 'F004',
              button: delBtn
            }], true)}
          </div>
          <BranchAdd />
        </div>
        <Form layout='horizontal'>
          <Row>
            <Col span={12}>
              <FormItem
                label='机构编号：'
                {...formItemLayout}
                required
              >
                {
                  getFieldDecorator('brhId', {
                    initialValue: selectedBranch.brhId ? selectedBranch.brhId : ''
                  })(
                    <Input
                      placeholder='请输入机构编号'
                      size='large'
                      disabled
                    />
                  )
                }
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                label='机构名称：'
                {...formItemLayout}
                required
              >
                {
                  getFieldDecorator('brhName', {
                    initialValue: selectedBranch.brhName ? selectedBranch.brhName : ''
                  })(
                    <Input
                      placeholder='请输入机构'
                      size='large'
                    />
                  )
                }
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <FormItem
                label='联系人：'
                {...formItemLayout}
              >
                {
                  getFieldDecorator('brhPerson', {
                    initialValue: selectedBranch.brhPerson ? selectedBranch.brhPerson : ''
                  })(
                    <Input
                      placeholder='请输入用户描述'
                      size='large'
                    />
                  )
                }
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                label='机构等级：'
                {...formItemLayout}
                required
              >
                {
                  getFieldDecorator('brhLevel', {
                    initialValue: getLevel()
                  })(
                    <Select
                      placeholder='请选择机构等级'
                    >
                      {setOptions}
                    </Select>
                  )
                }
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <FormItem
                label='联系电话：'
                {...formItemLayout}
              >
                {
                  getFieldDecorator('brhPhone', {
                    initialValue: selectedBranch.brhPhone
                  })(
                    <Input
                      placeholder='请输入联系电话'
                      size='large'
                    />
                  )
                }
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                label='机构描述：'
                {...formItemLayout}
              >
                {
                  getFieldDecorator('brhDesc', {
                    initialValue: selectedBranch.brhDesc ? selectedBranch.brhDesc : ''
                  })(
                    <Input
                      placeholder='请填写机构描述'
                      size='large'
                    />
                  )
                }
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <FormItem
                label='地区编号：'
                {...formItemLayout}
              >
                {
                  getFieldDecorator('brhRegionId', {
                    initialValue: selectedBranch.brhRegionId ? selectedBranch.brhRegionId : ''
                  })(
                    <Input
                      placeholder='请输入地区编号'
                      size='large'
                    />
                  )
                }
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                label='机构地址：'
                {...formItemLayout}
              >
                {
                  getFieldDecorator('brhAddress', {
                    initialValue: selectedBranch.brhAddress ? selectedBranch.brhAddress : ''
                  })(
                    <Input
                      placeholder='请输入机构地址'
                      size='large'
                    />
                  )
                }
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <FormItem
                label='所属机构：'
                {...formItemLayout}
              >
                {
                  getFieldDecorator('brhParentId', {
                    initialValue: selectedBranch.brhParentId || ''
                  })(
                    <TreeSelect
                      {...treeProps}
                      allowClear
                    />
                  )
                }
              </FormItem>
            </Col>
          </Row>
        </Form>
        <Spin loading={this.state.loading} />
      </div>
    )
  }
}
