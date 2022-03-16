import { PlusOutlined } from '@ant-design/icons';
import { Button, Divider, message, Skeleton } from 'antd';
import React, { useState, useRef } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import CreateForm from './components/CreateForm';
import { queryRegressionList, addRegression, removeRegression } from './service';
import { Link } from 'react-router-dom';
import { stringify } from 'query-string';
import { useIntl } from 'umi';

/**
 * 添加节点
 *
 * @param fields
 */
const handleAdd = async (fields: API.RegressionItem) => {
  const hide = message.loading('Adding');
  try {
    await addRegression({ ...fields });
    hide();
    message.success('Successfully added!');
    return true;
  } catch (error) {
    hide();
    message.error('Failed to add. Please try again!');
    return false;
  }
};

/**
 * 更新节点
 *
 * @param fields
 */
// const handleUpdate = async (fields: FormValueType) => {
//   const hide = message.loading('正在配置');
//   try {
//     await updateRule({
//       name: fields.name,
//       desc: fields.desc,
//       key: fields.key,
//     });
//     hide();

//     message.success('配置成功');
//     return true;
//   } catch (error) {
//     hide();
//     message.error('配置失败请重试！');
//     return false;
//   }
// };

/**
 * 删除节点
 *
 * @param selectedRows
 */
const handleRemove = async (regressionUuid: string) => {
  const hide = message.loading('Deleting');
  try {
    await removeRegression({
      regressionUuid,
    });
    hide();
    message.success('Deleted successfully, about to refresh!');
    return true;
  } catch (error) {
    hide();
    message.error('Deletion failed, please try again!');
    return false;
  }
};

function withSkeleton(element: JSX.Element | string | number | number | undefined) {
  return (
    element ?? <Skeleton title={{ width: '80px', style: { margin: 0 } }} paragraph={false} active />
  );
}

const TableList: React.FC<{}> = () => {
  const intl = useIntl();
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const columns: ProColumns<API.RegressionItem>[] = [
    {
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 48,
    },
    {
      title: 'regression uuid',
      dataIndex: 'regressionUuid',
      // width: 200,
      render: (_, { regressionUuid }) => {
        return withSkeleton(
          regressionUuid ? (
            <Link
              to={{
                pathname: '/editor',
                search: stringify({
                  regressionUuid,
                }),
              }}
            >
              {regressionUuid}
            </Link>
          ) : (
            '暂无数据'
          ),
        );
      },
      // fixed: 'left',
      // ellipsis: true,
      // tip: '设备ID',
    },
    {
      title: intl.formatMessage({
        id: 'pages.searchTable.projectTable',
        // defaultMessage: '',
      }),
      dataIndex: 'projectFullName',
      // sorter: true,
      // hideInForm: true,
      renderText: (val: string) => `${val} `,
      tip: '所属项目名称',
    },
    // {
    //   title: 'regression status',
    //   dataIndex: 'regressionStatus',
    //   hideInForm: true,
    //   valueEnum: {
    //     0: { text: '未核验', status: 'Processing' },
    //     1: { text: '已核验', status: 'Success' },
    //     2: { text: '存在错误', status: 'Error' },
    //   },
    // },
    {
      title: 'bic',
      dataIndex: 'bic',
      // sorter: true,
      tip: 'bug inducing commit',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: 'work',
      dataIndex: 'work',
      // sorter: true,
      tip: 'a random working commit',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: 'bfc',
      dataIndex: 'bfc',
      // sorter: true,
      // hideInForm: true,
      //  renderText: (val: string) => `${val} `,
      tip: 'bug fixing commit',
      // valueType: 'date',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: 'buggy commit',
      dataIndex: 'buggy',
      // sorter: true,
      tip: 'the parent of bug fixing commit',
      ellipsis: true,
      hideInSearch: true,
    },

    // {
    //   title: 'bug id',
    //   dataIndex: 'bugId',
    //   sorter: true,
    //   // tip: 'bug inducing commit',
    //   ellipsis: true,
    //   hideInSearch: true,
    // },
    {
      title: 'test case',
      dataIndex: 'testcase',
      // sorter: true,
      hideInForm: true,
      renderText: (val: string) => `${val} `,
      hideInSearch: true,
      ellipsis: true,
    },
    // {
    //   title: 'regression status',
    //   dataIndex: 'option',
    //   valueType: 'option',
    //   render: (_, { regressionId, regressionStatus }) => [
    //     <Select
    //       style={{ width: 120 }}
    //       placeholder="修改状态"
    //       value={regressionStatus}
    //       onChange={async (values) => {
    //         await updateStatus({
    //           regressionId,
    //           regressionStatus: +values,
    //         });
    //         actionRef.current?.reload();
    //       }}
    //     >
    //       <Option value={0}>未核验</Option>
    //       <Option value={1}>已核验</Option>
    //       <Option value={2}>出现错误</Option>
    //     </Select>,
    //     <Divider type="vertical" />,
    //     // <Button
    //     //   type="primary"
    //     //   danger
    //     //   onClick={() => {
    //     //     handleRemove(regressionId).then(() => {
    //     //       actionRef.current?.reload();
    //     //     });
    //     //   }}
    //     // >
    //     //   删除
    //     // </Button>,
    //   ],
    // },
    {
      title: 'regression status',
      dataIndex: 'regressionStatus',
      initialValue: 'all',
      filters: true,
      onFilter: true,
      // hideInForm: true,
      valueEnum: {
        0: { text: 'Not verified', status: 'Default' },
        1: { text: 'confirmed', status: 'Success' },
        2: { text: 'rejected', status: 'Error' },
        3: { text: 'undecided', status: 'Processing' },
      },
    },
    {
      title: '',
      hideInForm: true,
      hideInTable: true,
      fixed: 'right',
      render: (_, { regressionUuid: regressionUuid }) => [
        <Divider type="vertical" />,
        <Button
          type="primary"
          danger
          onClick={() => {
            handleRemove(regressionUuid).then(() => {
              actionRef.current?.reload();
            });
          }}
        >
          delete
        </Button>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.RegressionItem>
        headerTitle="regression"
        actionRef={actionRef}
        rowKey="regressionUuid"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button type="primary" onClick={() => handleModalVisible(true)}>
            <PlusOutlined /> add
          </Button>,
        ]}
        // @ts-ignore
        request={(params) =>
          queryRegressionList({
            regression_uuid: params.regressionUuid,
            // regression_status: params.regressionStatus === 'all' ? undefined : undefined,
            // project_full_name: params.projectFullName ?? undefined,
            // sorter,
            // filter,
          })
        }
        columns={columns}
        // rowSelection={{
        //   onChange: (_, selectedRows) => setSelectedRows(selectedRows),
        // }}
      />
      <CreateForm onCancel={() => handleModalVisible(false)} modalVisible={createModalVisible}>
        <ProTable<API.RegressionItem, API.RegressionItem>
          onSubmit={async (value) => {
            const success = await handleAdd(value);
            if (success) {
              handleModalVisible(false);
              if (actionRef.current) {
                actionRef.current.reload();
              }
            }
          }}
          rowKey="key"
          type="form"
          columns={columns}
        />
      </CreateForm>
    </PageContainer>
  );
};

export default TableList;
