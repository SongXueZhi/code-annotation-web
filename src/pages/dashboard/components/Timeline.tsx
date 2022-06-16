import React, { useState, useRef } from 'react';
import { Row, Col, Button } from 'antd';
import './index.less';
export type TimeLineProps = {
  lineList?: any;
  total?: number;
  indicated: number[];
};

const TimeLine: React.FC<TimeLineProps> = (props) => {
  const { lineList, indicated } = props;

  let timer;
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [currentPoint, setCurrentPoint] = useState<any>(0);
  const [arr, setArr] = useState<any>([]);
  // const [indicated, setIndicated] = useState<any>([0, 1, 2, 3, 4, 5, 8, 9, 15, 14, 13, 12, 11, 10, 7, 6]);
  const forward = () => {
    if (currentStep >= lineList.length - 1) {
      setCurrentStep(0);
      setArr([]);
    } else {
      let narr = arr;
      setArr(narr);
      // if(lineList[indicated[currentStep]]){
      narr.push(lineList[indicated[currentStep]].name);

      // }
      setCurrentPoint(lineList[indicated[currentStep + 1]].index);
      setCurrentStep(currentStep + 1);
    }
  };
  const pre = () => {
    if (currentStep > 0) {
      setCurrentPoint(lineList[indicated[currentStep - 1]].index);
      setCurrentStep(currentStep - 1);
      let narr = arr;
      narr.pop();
      setArr(narr);
    }
  };

  let listName = lineList.map((item: any, key: any) => {
    return (
      <Col className="col-container">
        <div className="col-container">
          <span className="name">
            {item.name} ({item.index})
          </span>
          {arr.indexOf(item.name) === -1 ? (
            <div className="u-dot"></div>
          ) : (
            <div className="u-dot u-passed-dot"></div>
          )}
          {/* <div className="u-dot"></div> */}

          {currentPoint === item.index ? (
            <div>
              <div className="u-dot current"></div>
              <img height="16px" src="./projectStageLoc.svg" className="stage-loc" />
            </div>
          ) : (
            <div></div>
          )}
        </div>
      </Col>
    );
  });

  return (
    <div>
      <div className="op-list">
        <Button onClick={forward}>Next</Button>
        <Button onClick={pre}>Previous</Button>step:{currentStep} | commit index:{' '}
        {lineList && lineList.length ? (
          <span>
            {lineList[currentStep].name} | id : {lineList[currentStep].id}
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
