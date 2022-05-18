import ProDescriptions from '@ant-design/pro-descriptions';
import { Button, Input } from 'antd';

interface IProps {
  regressionUuid: string;
  criticalChange: string[];
  fileName: string; // index
  beginLine: number[];
  endLine: number[];
}

interface SearchParams {
  feedback: string;
}

const generateParams = (params: SearchParams) => {
  return {
    feedback: params.feedback,
  };
};

const CodeDetails = ({ regressionUuid, criticalChange, fileName, beginLine, endLine }: IProps) => {
  const MockData = {
    regressionUuid: '53e0d50a-766f-4467-814a-ab4d2921d4d4_15dead6f',
    criticalChange: [
      'public boolean apply(String label) {\n            if (excludes != null) {\n                return Arrays.binarySearch(excludes, label) == -1;\n            }\n',
      'return includes != null // \n                    && Arrays.binarySearch(includes, label) >= 0;\n        }\n    }\n',
    ],
    fileName: 'Labels.java',
    revisionFlag: 'bic',
    beginLine: [45, 50],
    endLine: [47, 58],
  };
  return (
    <>
      <ProDescriptions column={2} title={MockData.fileName + ' Code Details'}>
        <ProDescriptions.Item label="Regression Uuid">
          {MockData.regressionUuid}
        </ProDescriptions.Item>
        <ProDescriptions.Item label="Revision Flag">{MockData.revisionFlag}</ProDescriptions.Item>
        {MockData.criticalChange.map((code, index) => {
          return (
            <>
              <ProDescriptions.Item span={2} label="Code Line Range">
                {MockData.beginLine[index]} ~ {MockData.endLine[index]}
              </ProDescriptions.Item>
              <ProDescriptions.Item span={2} label="Critical Change" valueType="code">
                {code}
              </ProDescriptions.Item>
            </>
          );
        })}
        <ProDescriptions.Item span={2} label="feedback">
          <Input.Group compact>
            <Input.TextArea
              rows={3}
              showCount
              allowClear
              maxLength={200}
              style={{ width: 'calc(100% - 200px)' }}
            />
            <Button type="primary" style={{ display: 'flex' }}>
              Submit
            </Button>
          </Input.Group>
        </ProDescriptions.Item>
      </ProDescriptions>
    </>
  );
};

export default CodeDetails;
