import React, { useState, useRef } from 'react';
import { Row, Col, Button } from 'antd';
import './index.less';

const TimeLine: React.FC = (props) => {
  const state: any = {
    list: [
      { name: 'commit1', index: 2500, time: '2022-08-09' },
      { name: 'commit1', index: 1, time: '2021-12-09' },
      { name: 'commit2', index: 2, time: '2021-11-18' },
      { name: 'commit1', index: 3, time: '2021-08-12' },
      { name: 'commit1', index: 4, time: '2020-10-13' },
      { name: 'commit1', index: 5, time: '2020-08-07' },
      { name: 'commit2', index: 6, time: '2020-08-10' },
      { name: 'commit1', index: 7, time: '2020-07-23' },
      { name: 'commit1', index: 8, time: '2020-01-30' },
      { name: 'commit1', index: 9, time: '2020-01-19' },
      { name: 'commit2', index: 10, time: '2019-08-09' },
      { name: 'start', index: 11, time: '2018-08-09' },
      { name: 'commit1', index: 12, time: '2022-08-09' },
      { name: 'commit1', index: 13, time: '2021-12-09' },
      { name: 'commit1', index: 0, time: '2022-08-09' },
      { name: 'commit1', index: 1, time: '2021-12-09' },
      { name: 'commit2', index: 2, time: '2021-11-18' },
      { name: 'commit1', index: 3, time: '2021-08-12' },
      { name: 'commit1', index: 4, time: '2020-10-13' },
      { name: 'commit1', index: 5, time: '2020-08-07' },
      { name: 'commit2', index: 6, time: '2020-08-10' },
      { name: 'commit1', index: 7, time: '2020-07-23' },
      { name: 'commit1', index: 8, time: '2020-01-30' },
      { name: 'commit1', index: 9, time: '2020-01-19' },
      { name: 'commit2', index: 10, time: '2019-08-09' },
      { name: 'start', index: 11, time: '2018-08-09' },
      { name: 'commit1', index: 12, time: '2022-08-09' },
      { name: 'commit1', index: 13, time: '2021-12-09' },
      { name: 'commit1', index: 0, time: '2022-08-09' },
      { name: 'commit1', index: 1, time: '2021-12-09' },
      { name: 'commit2', index: 2, time: '2021-11-18' },
      { name: 'commit1', index: 3, time: '2021-08-12' },
      { name: 'commit1', index: 4, time: '2020-10-13' },
      { name: 'commit1', index: 5, time: '2020-08-07' },
      { name: 'commit2', index: 6, time: '2020-08-10' },
      { name: 'commit1', index: 7, time: '2020-07-23' },
      { name: 'commit1', index: 8, time: '2020-01-30' },
      { name: 'commit1', index: 9, time: '2020-01-19' },
      { name: 'commit2', index: 10, time: '2019-08-09' },
      { name: 'start', index: 11, time: '2018-08-09' },
      { name: 'commit1', index: 12, time: '2022-08-09' },
      { name: 'commit1', index: 13, time: '2021-12-09' },
      { name: 'commit1', index: 0, time: '2022-08-09' },
      { name: 'commit1', index: 1, time: '2021-12-09' },
      { name: 'commit2', index: 2, time: '2021-11-18' },
      { name: 'commit1', index: 3, time: '2021-08-12' },
      { name: 'commit1', index: 4, time: '2020-10-13' },
      { name: 'commit1', index: 5, time: '2020-08-07' },
      { name: 'commit2', index: 6, time: '2020-08-10' },
      { name: 'commit1', index: 7, time: '2020-07-23' },
      { name: 'commit1', index: 8, time: '2020-01-30' },
      { name: 'commit1', index: 9, time: '2020-01-19' },
      { name: 'commit2', index: 10, time: '2019-08-09' },
      { name: 'start', index: 11, time: '2018-08-09' },
      { name: 'commit1', index: 12, time: '2022-08-09' },
      { name: 'commit1', index: 13, time: '2021-12-09' },
      // { name: 'commit2', index: 2, time: '2021-11-18' },
      // { name: 'commit1', index: 3, time: '2021-08-12' },
      // { name: 'commit1', index: 4, time: '2020-10-13' },
      // { name: 'commit1', index: 5, time: '2020-08-07' },
      // { name: 'commit2', index: 6, time: '2020-08-10' },
      // { name: 'commit1', index: 7, time: '2020-07-23' },
      // { name: 'commit1', index: 8, time: '2020-01-30' },
      // { name: 'commit1', index: 9, time: '2020-01-19' },
      // { name: 'commit2', index: 10, time: '2019-08-09' },
      // { name: 'start', index: 11, time: '2018-08-09' },
      // { name: 'commit1', index: 0, time: '2022-08-09' },
      // { name: 'commit1', index: 1, time: '2021-12-09' },
      // { name: 'commit2', index: 2, time: '2021-11-18' },
      // { name: 'commit1', index: 3, time: '2021-08-12' },
      // { name: 'commit1', index: 4, time: '2020-10-13' },
      // { name: 'commit1', index: 5, time: '2020-08-07' },
      // { name: 'commit2', index: 6, time: '2020-08-10' },
      // { name: 'commit1', index: 7, time: '2020-07-23' },
      // { name: 'commit1', index: 8, time: '2020-01-30' },
      // { name: 'commit1', index: 9, time: '2020-01-19' },
      // { name: 'commit2', index: 10, time: '2019-08-09' },
      // { name: 'start', index: 11, time: '2018-08-09' },
    ],
  };
  let timer;
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [arr, setArr] = useState<any>([]);
  const [indicated, setIndicated] = useState<any>([0, 1, 4, 3, 2, 10, 6, 7, 8, 9, 5, 11]);
  const forward = () => {
    if (currentStep >= state.list.length-1) {
      setCurrentStep(0);
      setArr([]);
    } else {
      setCurrentStep(currentStep + 1);
      let dom = document.getElementsByClassName('stage-loc')[0]
      console.log('dom',dom)
      if(dom){
        dom.scrollIntoView({
          behavior: 'smooth'
        })
      }
      let narr = arr;
      setArr(narr);
      narr.push(state.list[currentStep].index);
      console.log('arr', arr);
    }
  };
  const pre = () => {
    if(currentStep> 0){
      setCurrentStep(currentStep - 1);
      let narr = arr;
      narr.pop();
      setArr(narr);
      let dom = document.getElementsByClassName('stage-loc')[0]
      console.log('dom',dom)
      if(dom){
        dom.scrollIntoView({
          behavior: 'smooth'
        })
      }
    }
    
  };
  const play = () => {
    (timer = setInterval(() => {
      let cur = currentStep + 1;
      console.log(cur);
      setCurrentStep(cur);
    })),
      2000;
  };
  let listName = state.list.map((item: any, key: any) => {
    return (
      <Col className="col-container">
      <div className="col-container">
        <span className="name">{item.name}</span>
        {arr.indexOf(item.index) === -1 ? (
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
      </Col>
    );
  });

  return (
    <div>
      <div className="op-list">
      <Button onClick={forward}>Next</Button>
      <Button onClick={pre}>Previous</Button>step:{currentStep + 1} | commit name:{' '}
      {state.list[currentStep].name} | time : {state.list[currentStep].time}
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

// class Cty extends React.Component {
//   constructor(props: any) {
//     super(props);
//     this.state = {
//       list: [
//         { name: 'commit1', index: 0 },
//         { name: 'commit1', index: 1 },
//         { name: 'commit2', index: 2 },
//         { name: 'commit1', index: 3 },
//         { name: 'commit1', index: 0 },
//         { name: 'commit1', index: 1 },
//         { name: 'commit2', index: 2 },
//         { name: 'commit1', index: 3 },
//         { name: 'commit1', index: 0 },
//         { name: 'commit1', index: 1 },
//         { name: 'commit2', index: 2 },
//         { name: 'commit1', index: 3 },
//       ],
//     };
//     const [currentStep, setCurrentStep] = useState<number>(0);

//   }
//   render() {
//     //函数方法里面写，

//     // const goNext () = {

//     // }

//     //@ts-ignore

//     return (
//       <div>
//         <div>Next</div>
//       <div className="container">

//         <div className="u-tail"></div>
//         <Row justify="space-around" align="middle">
//           {listName}
//         </Row>
//       </div></div>
//     );
//   }
// }
export default TimeLine;
