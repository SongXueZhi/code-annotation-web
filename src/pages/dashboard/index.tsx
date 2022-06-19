import { PlusOutlined, SyncOutlined, LoadingOutlined, RedoOutlined } from '@ant-design/icons';
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
import { render } from 'react-dom';

declare global {
  interface Window {
    currentProjectName: any;
  }
}

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

function withSkeleton(element: JSX.Element | string | number | number | undefined) {
  return (
    element ?? <Skeleton title={{ width: '80px', style: { margin: 0 } }} paragraph={false} active />
  );
}

// dashiboard
const progressContainer = {
  padding: '30px',
  background: '#fff',
  'margin-bottom': '20px',
  // marginBotton: '20px'
};
const DrawerbodyStyle = {
  // 'background-color': '#f5f5f5'
};

class CodeEditor extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = {
      progressInfo: {
        currentProjectName: 'no data',
        projectQueueNum: 0,
        totalProjectNum: 0,
        totalStartTime: 0,
        projectStatTime: 0,
        totalProgress: 10,
        totalPRFCNum: 4,
        regressionNum: 25,
        prfcdoneNum: 0,
        currentRepoProgress: 0,
        finishedProject: 1,
      },
      distanceTime: '',
      repodistanceTime: '',
    };
  }

  private updateProcessInfo = async (params?: any) => {
    getProcessInfo().then((res: any) => {
      const newData: any = res.data;
      const distanceTime: any = getDistanceDay(Number(res.data.totalStartTime));
      const repodistanceTime: any = getDistanceDay(res.data.projectStatTime);
      window.currentProjectName = res.data.currentProjectName;
      const finishedProject = Number(res.data.totalProjectNum) - Number(res.data.projectQueueNum);
      newData.finishedProject = finishedProject;
      newData.totalProgress = ((finishedProject / res.data.totalProjectNum) * 100).toFixed(2);
      newData.currentRepoProgress = ((res.data.prfcdoneNum / res.data.totalPRFCNum) * 100).toFixed(
        2,
      );
      this.setState({ progressInfo: newData });
      this.setState({ distanceTime: distanceTime });
      this.setState({ repodistanceTime: repodistanceTime });
      setInterval(() => {
        //@ts-ignore
        const time = getDistanceDay(this.state.progressInfo.totalStartTime);
        //@ts-ignore
        const repotime = getDistanceDay(this.state.progressInfo.projectStatTime);
        this.setState({ distanceTime: time });
        this.setState({ repodistanceTime: repotime });
        // distanceTime = getDistanceDay(progressInfo.totalStartTime)
      }, 60 * 1000);
    });
  };
  componentDidMount() {
    this.updateProcessInfo();
  }

  render() {
    //@ts-ignore
    const { progressInfo, distanceTime, repodistanceTime } = this.state;

    const logs = (
      <pre className="log output" style={{ overflow: 'unset' }}>
        {}
      </pre>
    );
    return (
      <>
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
                description={`${window.currentProjectName} is processing`}
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
            <Progress
              className="myResProgress"
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
              trailColor="rgb(238 238 238)"
              percent={progressInfo.totalProgress}
              strokeWidth={10}
            />
          </div>
          <div style={{ marginTop: '-10px' }} className="header-container">
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
              <h6 style={{ marginLeft: '20px', color: '#666' }}>spend: {repodistanceTime}</h6>
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
              percent={progressInfo.currentRepoProgress}
              strokeWidth={12}
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
                    {window.currentProjectName}: totalPRFCNum:
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
                    {/* <Button onClick={showDrawer}>show Regressions</Button> */}
                  </span>
                }
              />
            </div>
            {/* <Row gutter={16}>
              <Col span={12}>
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
                <Card title="-" hoverable className="progress-card">
                  <Tooltip title="3 done / 3 in progress / 4 to do">
                    <Progress percent={60} successPercent={30} type="circle" strokeWidth={15} />
                  </Tooltip>
                </Card>
              </Col>
              <Col span={12}>
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
            </Row> */}
          </div>
        </div>
      </>
    );
  }
}

const TableList: React.FC<{}> = () => {
  const intl = useIntl();

  const [dashboardvisible, setVisible] = useState<boolean>(false);

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

  const timeLineDetail = async (id: any, rid: any, projectFullName: any) => {
    const res: any = await getDeatil({
      regressionUuid: id,
      projectName: projectFullName,
    });
    const arr: any = [];
    const indexList: number[] = [];
    const idList: any = [];
    for (let i = 0; i < res.data.orderList?.length; i++) {
      indexList.push(Number(res.data.orderList[i][0]));
      idList.push(res.data.orderList[i][1]);
    }
    handleIdLists(indexList);
    for (let i = 0; i < Number(res.data.searchSpaceNum) - 1; i++) {
      if (indexList.indexOf(i) !== -1) {
        arr.push({
          index: arr.length,
          name: i,
          firstShow: indexList.indexOf(i),
          time: '',
          id: idList[indexList.indexOf(i)],
        });
      }
    }
    for (let i = 0; i < indexList.length; i++) {
      arr.forEach((item: any, index: any) => {
        if (item.name === indexList[i]) {
          indicated.push(index);
        }
      });
    }

    const sort: any = [];
    for (let i = 0; i < indicated.length; i++) {
      sort.push(indicated.indexOf(i));
    }

    handleIdLists(indicated);
    handleTimeLine(arr);
    timeLineTotal = Number(res.searchSpaceNum);
    setCurRegressionUuid(rid);
    // render()
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
      render: (
        _,
        { bfc: bfc, regressionUuid: regressionUuid, projectFullName: projectFullName },
      ) => [
        <Divider type="vertical" />,
        <Button
          danger
          onClick={() => {
            // handleRemove(regressionUuid).then(() => {
            console.log('regressionUuid', bfc, regressionUuid, projectFullName);
            // });

            timeLineDetail(bfc, regressionUuid, projectFullName);
            onClose();
          }}
        >
          Time line
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
          <div className="sub-title-container">
            <div>process dashboard</div>
            <div>
              <Button className="sub-title-header" type="primary" onClick={showDrawer}>
                Show Finished Regressions
              </Button>
            </div>
          </div>
        ),
      }}
    >
      <CodeEditor />
      <div className="regressionTimeline">
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
          Time Line
        </h2>
        <div> Current RegressionUuid: {currentRegressionUuid}</div>
        <div className="timeline-container">
          <TimeLine
            lineList={timeLineList}
            total={timeLineTotal}
            indicated={idLists}
            currentRegressionUuid={currentRegressionUuid}
            cur={0}
          />
        </div>
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
          // @ts-ignore
          request={(params) =>
            queryRegressionList({
              regression_uuid: params.regressionUuid,
              keyword: params.keyword,
            })
          }
          columns={columns}
          // search={{
          //   optionRender:({})
          // }}
          // pagination={{
          //   pageSize: 20,
          //   pageSizeOptions: undefined,
          // }}
        />
      </Drawer>
      {/* dashboard */}
    </PageContainer>
  );
};

export default TableList;
