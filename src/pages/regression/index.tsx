import { PlusOutlined } from '@ant-design/icons';
import { Alert, Button, Divider, message, Skeleton } from 'antd';
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
      title: 'No.',
      dataIndex: 'index',
      width: 48,
      render: (_, record) => {
        return record.index + 1;
      },
      search: false,
    },
    {
      title: 'regression uuid',
      dataIndex: 'regressionUuid',
      width: 250,
      render: (_, { regressionUuid, index }) => {
        return withSkeleton(
          regressionUuid ? (
            index <= 49 ? (
              <Link
                to={{
                  pathname: '/editor',
                  search: stringify({ regressionUuid }),
                }}
              >
                {regressionUuid}
              </Link>
            ) : (
              regressionUuid
            )
          ) : (
            '暂无数据'
          ),
        );
      },
    },
    {
      title: intl.formatMessage({
        id: 'pages.searchTable.projectTable',
      }),
      dataIndex: 'projectFullName',
      width: 200,
      search: false,
      renderText: (val: string) => `${val} `,
      // tip: '所属项目名称',
    },
    {
      title: 'bic',
      dataIndex: 'bic',
      tip: 'bug inducing commit',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: 'work',
      dataIndex: 'work',
      tip: 'a random working commit',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: 'bfc',
      dataIndex: 'bfc',
      tip: 'bug fixing commit',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: 'buggy commit',
      dataIndex: 'buggy',
      tip: 'the parent of bug fixing commit',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: 'test case',
      dataIndex: 'testcase',
      // sorter: true,
      hideInForm: true,
      renderText: (val: string) => `${val} `,
      hideInSearch: true,
      ellipsis: true,
    },
    {
      title: 'regression status',
      dataIndex: 'regressionStatus',
      initialValue: 'all',
      width: 150,
      search: false,
      filters: true,
      onFilter: true,
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
      search: false,
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
    <PageContainer
      header={{
        style: { width: '100%' },
        title: 'Regression',
        subTitle: (
          <Alert
            style={{ paddingLeft: '100px', paddingRight: '100px' }}
            type="info"
            message={
              <div style={{ color: 'red', fontSize: '20px', fontWeight: 'bold' }}>
                Note! Due to cloud server limitations, only the first 50 bugs on the list are
                available.
              </div>
            }
          />
        ),
      }}
    >
      <ProTable<API.RegressionItem>
        headerTitle="Regression List"
        actionRef={actionRef}
        rowKey="regressionUuid"
        search={{
          labelWidth: 'auto',
          defaultCollapsed: false,
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
          })
        }
        columns={columns}
        // pagination={{
        //   pageSize: 20,
        //   pageSizeOptions: undefined,
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
