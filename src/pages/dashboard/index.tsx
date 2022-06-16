import { PlusOutlined, SyncOutlined, LoadingOutlined } from '@ant-design/icons';
import {
  Alert,
  Button,
  Col,
  Divider,
  message,
  Row,
  Skeleton,
  Tooltip,
  Progress,
  Drawer,
  Spin,
  Card,
  Tag,
  Steps,
  Table,
} from 'antd';
import React, { useState, useRef } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import TimeLine from './components/Timeline';

import {
  queryRegressionList,
  addRegression,
  removeRegression,
  getProcessInfo,
  getDeatil,
} from './service';
import { Link } from 'react-router-dom';
import { stringify } from 'query-string';
import { useIntl } from 'umi';
import './index.less';
import { getDistanceDay } from './utils';

const { Step } = Steps;

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
let progressInfo: any = {
  currentProjectName: 'univocity-parser',
  projectQueueNum: 1,
  totalProjectNum: 2,
  totalStartTime: 1654222269037,
  projectStatTime: 1654222289198,
  totalProgress: 10,
  totalPRFCNum: 4,
  regressionNum: 25,
  prfcdoneNum: 4,
  currentRepoProgress: 78,
  finishedProject: 1,
  // currentRepoName: 'Reminer',
  // repoUrl: 'https://github.com/SongXueZhi/RegMiner',
  currentCommitName: 'current commit',
};

/**
 * 更新节点
 *
 * @param fields
 */
const updateProcessInfo = async (params: any) => {
  getProcessInfo().then((res: any) => {
    const newData = res.data;
    newData.totalProgress = res.data.totalProjectNum;
    newData.finishedProject = Number(res.data.totalProjectNum) - Number(res.data.projectQueueNum);
    progressInfo = newData;
  });
};
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

// dashiboard
const progressContainer = {
  padding: '40px',
  background: '#fff',
  'margin-bottom': '20px',
  'padding-bottom': '300px',
  // marginBotton: '20px'
};
const DrawerbodyStyle = {
  // 'background-color': '#f5f5f5'
};

const TableList: React.FC<{}> = () => {
  const intl = useIntl();

  const [dashboardvisible, setVisible] = useState<boolean>(false);
  const [distanceTime, setDistanceTime] = useState<string>(
    getDistanceDay(progressInfo.totalStartTime),
  );
  const [repodistanceTime, setRepoDistanceTime] = useState<string>(
    getDistanceDay(progressInfo.projectStatTime),
  );
  setInterval(() => {
    const time = getDistanceDay(progressInfo.totalStartTime);
    const repotime = getDistanceDay(progressInfo.projectStatTime);
    setDistanceTime(time);
    setRepoDistanceTime(repotime);
    // distanceTime = getDistanceDay(progressInfo.totalStartTime)
  }, 1000);
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  const [currentRegressionUuid, setCurRegressionUuid] = useState<string>('');
  const actionRef = useRef<ActionType>();

  const showDrawer = () => {
    setVisible(true);
  };
  const onClose = () => {
    setVisible(false);
  };
  const [timeLineList, handleTimeLine] = useState<any>([]);
  const [idLists, handleIdLists] = useState<any>([]);
  let timeLineTotal: number = 0;
  const indicated: any = [];

  const timeLineDetail = async (id: any) => {
    const res: any = await getDeatil({ regressionUuid: id });
    const arr: any = [];
    const indexList: number[] = [];
    const idList: any = [];
    for (let i = 0; i < res.data.orderList.length; i++) {
      indexList.push(Number(res.data.orderList[i][0]));
      idList.push(res.data.orderList[i][1]);
    }
    handleIdLists(indexList);
    for (let i = 0; i < Number(res.data.searchSpaceNum) - 1; i++) {
      if (indexList.indexOf(i) !== -1) {
        arr.push({
          index: indexList.indexOf(i),
          name: i,
          time: '',
          id: idList[indexList.indexOf(i)],
        });
        indicated.push(indexList.indexOf(i));
      }
    }
    const sort: any = [];
    for (let i = 0; i < indicated.length; i++) {
      sort.push(indicated.indexOf(i));
    }
    handleIdLists(sort);
    handleTimeLine(arr);
    timeLineTotal = Number(res.searchSpaceNum);
    setCurRegressionUuid(id);
  };

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
      width: 100,
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
      title: 'actions',
      hideInForm: true,
      // hideInTable: true,
      search: false,
      // fixed: 'right',
      render: (_, { regressionUuid: regressionUuid }) => [
        <Divider type="vertical" />,
        <Button
          type="primary"
          danger
          onClick={() => {
            // handleRemove(regressionUuid).then(() => {
            console.log('regressionUuid', regressionUuid);
            // });
            timeLineDetail(regressionUuid);
            onClose();
          }}
        >
          show Time line
        </Button>,
      ],
    },
  ];

  return (
    <PageContainer
      header={{
        style: { width: '100%' },
        title: 'Dashboard',
        subTitle: (
          <div>
            process dashboard <Button onClick={updateProcessInfo}>refresh</Button>
          </div>
        ),
      }}
    >
      <div style={progressContainer}>
        <div className="header-container">
          {/* <Spin size="small" /> */}
          <h2 style={{ marginBottom: '20px' }}>
            <div
              style={{
                display: 'inline-block',
                width: '5px',
                height: '12px',
                background: '#722ED1',
                marginRight: '10px',
              }}
            ></div>
            Total Progress <span>({progressInfo.totalProgress}%)</span>
          </h2>
        </div>
        <div style={{ padding: '0 20px' }}>
          <Steps current={1} size="small">
            <Step
              title="Finished"
              description={`${progressInfo.finishedProject} project repositories are done.`}
            />
            <Step
              title="In Progress"
              icon={<SyncOutlined spin />}
              subTitle={distanceTime}
              description="fastjson is processing"
            />
            <Step
              title="Waiting"
              description={`${progressInfo.projectQueueNum} project repositories are in queue`}
            />
          </Steps>
          {/* <Progress
            className="total-progress"
            percent={progressInfo.totalProgress}
            steps={progressInfo.totalProjectNum}
            size="default"
            showInfo={false}
            strokeWidth={12}
            strokeColor="#52c41a"
            trailColor="rgb(233 242 255)"
          /> */}
        </div>
        <div style={{ marginTop: '20px' }} className="header-container">
          {/* <Spin size="small" /> */}
          <h2>
            <div
              style={{
                display: 'inline-block',
                width: '5px',
                height: '12px',
                background: '#722ED1',
                marginRight: '10px',
              }}
            ></div>
            current project: {progressInfo.currentProjectName}
            <span>
              {' '}
              {/* <SyncOutlined
                  style={{
                    fontSize: '20px',
                    marginTop: '-16px',
                    marginLeft: '10px',
                    marginRight: '4px',
                    color: '#722ED1',
                  }}
                  spin
                /> */}
              ({progressInfo.currentRepoProgress}%)
            </span>
            <h6 style={{ marginLeft: '20px', color: '#666' }}>
              Current Commit Name: {progressInfo.currentCommitName} | spend: {repodistanceTime}
            </h6>
          </h2>
        </div>
        {/* <Alert
            showIcon
            message="100 project repositories are in queue, 10 are done and fastjson is processing."
            type="info"
          /> */}
        <div style={{ padding: '0 20px', display: 'flex', alignItems: 'center', height: '40px' }}>
          {/* <Spin size="small" style={{ marginTop: '-10px', marginRight: '10px' }} /> */}

          <Progress
            className="myResProgress"
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
            trailColor="rgb(238 238 238)"
            percent={79.9}
            strokeWidth={15}
            showInfo={false}
          />
        </div>
        {/* <Progress
          strokeColor={{
            from: '#108ee9',
            to: '#87d068',
          }}
          percent={99.9}
          status="active"
        /> */}
        <div style={{ padding: '0 20px' }}>
          <div className="tips-container">
            <Alert
              type="info"
              showIcon
              className="dashboard-alert"
              message={
                <span className="content">
                  Fastjson: totalPRFCNum:
                  <Tag className="tag-content" color="processing">
                    {progressInfo.totalPRFCNum}
                  </Tag>
                  prfcdoneNum:
                  <Tag className="tag-content" color="green">
                    {progressInfo.prfcdoneNum}
                  </Tag>
                  regressionNum:
                  <Tag className="tag-content" color="#f50">
                    {progressInfo.regressionNum}
                  </Tag>
                  <Button onClick={showDrawer}>show Regressions</Button>
                </span>
              }
            />
          </div>
          <Drawer
            bodyStyle={DrawerbodyStyle}
            title="Finished Regressions List"
            placement={'right'}
            closable={false}
            onClose={onClose}
            visible={dashboardvisible}
            key={'right'}
            width={450}
          >
            <ProTable<API.RegressionItem>
              headerTitle="Regression List"
              actionRef={actionRef}
              rowKey="regressionUuid"
              search={false}
              // search={{
              //   labelWidth: 'auto',
              //   defaultCollapsed: false,
              // }}
              // toolBarRender={() => [
              //   <Button type="primary" onClick={() => handleModalVisible(true)}>
              //     <PlusOutlined /> add
              //   </Button>,
              // ]}
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
          </Drawer>
          <Row gutter={16}>
            <Col span={8}>
              <Card
                title={`${progressInfo.regressionNum} regressions have been found`}
                hoverable
                className="progress-card"
              >
                <Progress
                  type="circle"
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                  percent={100}
                  strokeWidth={15}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card title="3 done / 3 in progress / 4 to do" hoverable className="progress-card">
                <Tooltip title="3 done / 3 in progress / 4 to do">
                  <Progress percent={60} successPercent={30} type="circle" strokeWidth={15} />
                </Tooltip>
              </Card>
            </Col>
            <Col span={8}>
              <Card title="something processing" hoverable className="progress-card">
                <Progress
                  type="circle"
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                  percent={90}
                  strokeWidth={15}
                />
              </Card>
            </Col>
          </Row>
          <div className="regressionTimeline">
            <div> current: {currentRegressionUuid}</div>
            <div className="timeline-container">
              <TimeLine lineList={timeLineList} total={timeLineTotal} indicated={idLists} />
            </div>
          </div>
        </div>
      </div>
      {/* dashboard */}
    </PageContainer>
  );
};

export default TableList;
