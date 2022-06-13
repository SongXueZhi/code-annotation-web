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
} from 'antd';
import React, { useState, useRef } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';

import { queryRegressionList, addRegression, removeRegression } from './service';
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

// dashiboard
const progressContainer = {
  padding: '40px',
  background: '#fff',
  'margin-bottom': '20px',
  // marginBotton: '20px'
};
const DrawerbodyStyle = {
  // 'background-color': '#f5f5f5'
};

interface IProgressInfo {
  totalProgress: number;
  totalRepoNum: number;
  finishedRepoNum: number;
  totalStartTime: number;
  curRepoStartTime: number;
  currentRepoProgress: number;
  currentRepoName: string;
  repoUrl: string;

  potentialBugFoundNum: number;
  potentialBugCompleteNum: number;
  regressionsFoundNum: number;
}
const progressInfo: IProgressInfo = {
  totalProgress: 10,
  currentRepoProgress: 78,
  totalRepoNum: 80,
  totalStartTime: 1654222269037,
  finishedRepoNum: 10,

  curRepoStartTime: 1654222289198,
  currentRepoName: 'Reminer',
  repoUrl: 'https://github.com/SongXueZhi/RegMiner',

  potentialBugFoundNum: 1000,
  potentialBugCompleteNum: 300,
  regressionsFoundNum: 100,
};

const TableList: React.FC<{}> = () => {
  const intl = useIntl();
  const [dashboardvisible, setVisible] = useState<boolean>(false);
  const [distanceTime, setDistanceTime] = useState<string>(
    getDistanceDay(progressInfo.totalStartTime),
  );
  const [repodistanceTime, setRepoDistanceTime] = useState<string>(
    getDistanceDay(progressInfo.curRepoStartTime),
  );
  setInterval(() => {
    const time = getDistanceDay(progressInfo.totalStartTime);
    const repotime = getDistanceDay(progressInfo.curRepoStartTime);
    setDistanceTime(time);
    setRepoDistanceTime(repotime);
    // distanceTime = getDistanceDay(progressInfo.totalStartTime)
  }, 1000);
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();

  return (
    <PageContainer
      header={{
        style: { width: '100%' },
        title: 'Dashboard',
        subTitle: 'process dashboard',
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
            <Step title="Finished" description="10 project repositories are done." />
            <Step
              title="In Progress"
              icon={<SyncOutlined spin />}
              subTitle={distanceTime}
              description="fastjson is processing"
            />
            <Step title="Waiting" description="90 project repositories are in queue" />
          </Steps>
          <Progress
            className="total-progress"
            percent={progressInfo.totalProgress}
            steps={progressInfo.totalRepoNum}
            size="default"
            showInfo={false}
            strokeWidth={12}
            strokeColor="#52c41a"
            trailColor="rgb(233 242 255)"
          />
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
            Current Repository: {progressInfo.currentRepoName}{' '}
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
              {progressInfo.repoUrl} | spend: {repodistanceTime}
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
                  Fastjson:{' '}
                  <Tag className="tag-content" color="processing">
                    {progressInfo.potentialBugFoundNum}
                  </Tag>
                  potential bug-fixing commit found.{' '}
                  <Tag className="tag-content" color="green">
                    {progressInfo.potentialBugCompleteNum}
                  </Tag>
                  of them have been completed and{' '}
                  <Tag className="tag-content" color="#f50">
                    {progressInfo.regressionsFoundNum}
                  </Tag>
                  regressions have been found.
                </span>
              }
            />
          </div>
          <Row gutter={16}>
            <Col span={8}>
              <Card title="somthing finished" hoverable className="progress-card">
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
        </div>
      </div>
      {/* dashboard */}
    </PageContainer>
  );
};

export default TableList;
