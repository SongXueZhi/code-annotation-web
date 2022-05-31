import CodeEditor from '@/components/CodeEditor';
import Editor from '@/components/Editor';
import { Tabs } from 'antd';
import { useCallback } from 'react';
import type { FilePaneItem } from '..';

export type DiffEditor = {
  origin: string;
  current: string;
};

interface IProps {
  versionText: string;
  // oldVersionText?: string;
  // newVersionText?: string;
  commit: 'BIC' | 'BFC';
  panes: FilePaneItem[];
  paneFlag: 'Old' | 'New'; // display oldCode || NewCode
  activeKey: string;
  consoleString?: string;
  isRunning: boolean;
  onPanesChange: (panes: FilePaneItem[]) => void;
  onActiveKey: (v: string) => void;
  onRunCode?: (v: string, version: string) => void;
}

const DiffEditorTabs: React.FC<IProps> = ({
  commit,
  panes,
  paneFlag,
  activeKey,
  versionText,
  consoleString,
  isRunning,
  onActiveKey,
  onPanesChange,
  onRunCode,
}) => {
  const mockChangedLines_old = [
    [45, 47],
    [50, 58],
  ];
  const mockCriticalChangeLines_old = [50, 58];
  const mockChangedLines_new = [
    [45, 45],
    [48, 49],
  ];
  const mockCriticalChangeLines_new = [48, 49];
  const remove = useCallback(
    (targetKey: string) => {
      let newActiveKey = activeKey;
      let lastIndex = 0;
      panes.forEach((pane, i) => {
        if (pane.key === targetKey) {
          lastIndex = i - 1;
        }
      });
      const newPanes = panes.filter((pane) => pane.key !== targetKey);
      if (newPanes.length && newActiveKey === targetKey) {
        if (lastIndex >= 0) {
          newActiveKey = newPanes[lastIndex].key;
        } else {
          newActiveKey = newPanes[0].key;
        }
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
      {paneFlag === 'Old'
        ? panes.map(({ key, oldCode, newCode }) => {
            return (
              <Tabs.TabPane tab={key.split(`${commit}-`)} key={key}>
                <div style={{ width: '100%', height: '86vh', display: 'flex' }}>
                  <Editor
                    title={commit === 'BIC' ? 'Bug Inducing Commit' : 'Bug Fixing Commit'}
                    darkTheme={false}
                    paneFlag={paneFlag}
                    changedCodeLines={mockChangedLines_old}
                    criticalChangeLines={mockCriticalChangeLines_old}
                    value={oldCode}
                    versionText={versionText}
                    isRunning={isRunning}
                    consoleString={consoleString}
                    onRunCode={onRunCode}
                  />
                </div>
              </Tabs.TabPane>
            );
          })
        : panes.map(({ key, oldCode, newCode }) => {
            return (
              <Tabs.TabPane tab={key.split(`${commit}-`)} key={key}>
                <div style={{ width: '100%', height: '86vh', display: 'flex' }}>
                  <Editor
                    title={commit === 'BIC' ? 'Bug Inducing Commit' : 'Bug Fixing Commit'}
                    darkTheme={false}
                    paneFlag={paneFlag}
                    changedCodeLines={mockChangedLines_new}
                    criticalChangeLines={mockCriticalChangeLines_new}
                    value={newCode}
                    versionText={versionText}
                    isRunning={isRunning}
                    consoleString={consoleString}
                    onRunCode={onRunCode}
                  />
                </div>
              </Tabs.TabPane>
            );
          })}
    </Tabs>
  );
};

export default DiffEditorTabs;
