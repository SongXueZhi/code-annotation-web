import React, { useState, useRef, useEffect } from 'react';
import { Row, Col, Button } from 'antd';
import { Link } from 'react-router-dom';
import { stringify } from 'querystring';
import './index.less';
export type TimeLineProps = {
  lineList?: any;
  total?: number;
  indicated: number[];
  currentRegressionUuid: string;
  cur: number;
};

const TimeLine: React.FC<TimeLineProps> = (props) => {
  const { currentRegressionUuid, lineList, indicated, cur } = props;
  let timer;
  const [currentStep, setCurrentStep] = useState<number>(cur);
  const [currentPoint, setCurrentPoint] = useState<any>(0);
  const [arr, setArr] = useState<any>([]);
  const reset = () => {
    setCurrentStep(0);
    setArr([]);
  };
  useEffect(() => {
    reset();
  }, [currentRegressionUuid]);

  // const nowIndex = indicated[currentStep] || 0
  // const [indicated, setIndicated] = useState<any>([0, 1, 2, 3, 4, 5, 8, 9, 15, 14, 13, 12, 11, 10, 7, 6]);
  const forward = () => {
    if (currentStep >= indicated.length - 1) {
      setCurrentStep(0);
      setArr([]);
    } else {
      const narr = arr;
      setArr(narr);
      // if(lineList[indicated[currentStep]]){
      narr.push(lineList[indicated[currentStep]].name);

      // }
      console.log('lineList', lineList, indicated);
      setCurrentPoint(lineList[indicated[currentStep + 1]].id);
      setCurrentStep(currentStep + 1);
    }
  };
  const pre = () => {
    if (currentStep > 0) {
      setCurrentPoint(lineList[indicated[currentStep - 1]].index);
      setCurrentStep(currentStep - 1);
      const narr = arr;
      narr.pop();
      setArr(narr);
    }
  };

  const listName = lineList.map((item: any, key: any) => {
    return (
      <Link
        target="_blank"
        to={{
          pathname: '/detail',
          search: stringify({
            regressionUuid: currentRegressionUuid,
            bic: item.id,
          }),
        }}
      >
        <Col className="col-container">
          <div className="col-container">
            <span className="name">
              {item.name} ({item.firstShow})
            </span>
            {arr.indexOf(item.name) === -1 ? (
              <div className="u-dot"></div>
            ) : (
              <div className="u-dot u-passed-dot"></div>
            )}
            {/* <div className="u-dot"></div> */}

            {indicated[currentStep] === item.index ? (
              <div>
                <div className="u-dot current"></div>
                <img height="16px" src="./projectStageLoc.svg" className="stage-loc" />
              </div>
            ) : (
              <div></div>
            )}
          </div>
        </Col>{' '}
      </Link>
    );
  });

  return (
    <div>
      <div className="op-list">
        <Button onClick={forward}>Next</Button>
        <Button onClick={pre}>Previous</Button>step:{currentStep} | commit index:{' '}
        {lineList && lineList.length ? (
          <span>
            {lineList[indicated[currentStep]]?.name} | id :{' '}
            <Link
              target="_blank"
              to={{
                pathname: '/detail',
                search: stringify({
                  regressionUuid: currentRegressionUuid,
                  bic: lineList[indicated[currentStep]]?.id,
                }),
              }}
            >
              {lineList[indicated[currentStep]]?.id}
            </Link>
          </span>
        ) : null}
      </div>
      <div className="container">
        <div className="u-tail"></div>
        <Row justify="space-around" align="middle" className="row-container">
          {listName}
        </Row>
      </div>
    </div>
  );
};
export default TimeLine;
