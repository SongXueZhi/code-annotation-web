import CodeEditor from '@/components/CodeEditor';
import { Tabs } from 'antd';
import { useCallback } from 'react';
import type { FilePaneItem } from '..';
import { FeedbackList } from '../data';

export type DiffEditor = {
  origin: string;
  current: string;
};

interface IProps {
  regressionUuid: string;
  oldVersionText?: string;
  newVersionText?: string;
  commit: 'BIC' | 'BFC';
  panes: FilePaneItem[];
  activeKey: string;
  consoleString?: string;
  isRunning: boolean;
  onPanesChange: (panes: FilePaneItem[]) => void;
  onActiveKey: (v: string | undefined) => void;
  onRunCode?: (v: string, version: string) => void;
  onFeedbackList: (feedbacks: FeedbackList) => void;
}

const DiffEditorTabs: React.FC<IProps> = ({
  regressionUuid,
  commit,
  panes,
  activeKey,
  oldVersionText,
  newVersionText,
  consoleString,
  isRunning,
  onActiveKey,
  onPanesChange,
  onRunCode,
  onFeedbackList,
}) => {
  const remove = useCallback(
    (targetKey: string) => {
      let newActiveKey = activeKey || undefined;
      const activeKeyIndex = panes.findIndex((value) => {
        return value.key === activeKey;
      });
      const newPanes = panes.filter((pane) => pane.key !== targetKey);
      if (newPanes.length > 0) {
        if (activeKey === targetKey) {
          newActiveKey = newPanes[Math.max(activeKeyIndex - 1, 0)].key;
        }
      } else {
        newActiveKey = undefined;
      }
      onPanesChange(newPanes);
      onActiveKey(newActiveKey);
    },
    [activeKey, onActiveKey, onPanesChange, panes],
  );

  const onEdit = useCallback(
    (targetKey: any, action: string | number) => {
      if (action === 'remove') remove(targetKey);
    },
    [remove],
  );

  return (
    <Tabs
      style={{ flex: 1, margin: 10 }}
      tabBarStyle={{
        margin: 0,
      }}
      type="editable-card"
      onChange={onActiveKey}
      activeKey={activeKey}
      onEdit={onEdit}
      hideAdd
    >
      {panes.map(({ key, oldCode, newCode, editList }) => {
        return (
          <Tabs.TabPane tab={key.split(`${commit}-`)} key={key}>
            <div style={{ width: '100%', height: '86vh', display: 'flex' }}>
              <CodeEditor
                title={commit === 'BIC' ? 'Bug Inducing Commit' : 'Bug Fixing Commit'}
                regressionUuid={regressionUuid}
                filename={key.slice(4)}
                darkTheme={false}
                original={oldCode}
                value={newCode}
                diffEditChanges={editList}
                oldVersionText={oldVersionText}
                newVersionText={newVersionText}
                isRunning={isRunning}
                consoleString={consoleString}
                onRunCode={onRunCode}
                onFeedbackList={onFeedbackList}
              />
            </div>
          </Tabs.TabPane>
        );
      })}
    </Tabs>
  );
};

export default DiffEditorTabs;
