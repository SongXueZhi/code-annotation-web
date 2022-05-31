import type { RefObject } from 'react';
import React, { createRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import MonacoEditor, { monaco } from 'react-monaco-editor';
import type * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
import type { Directory, Depandency } from './sidebar.d';
import { message } from 'antd';
import type { ResizeEntry } from '@blueprintjs/core';
import { Button, Divider, ResizeSensor } from '@blueprintjs/core';
import EllipsisMiddle from '../EllipsisMiddle';
import './styles.css';

interface IProps {
  title: string;
  extra?: JSX.Element;
  versionText: string;
  darkTheme: boolean;
  dirs?: Directory[];
  depandencies?: Depandency[];
  paneFlag: 'Old' | 'New';
  changedCodeLines?: any[];
  criticalChangeLines?: number[];
  value?: string;
  isRunning: boolean;
  consoleString?: string;
  onRunCode?: (code: string, version: string) => void;
}
interface IState {
  showConsole: boolean;
  showCodeDetails: boolean;
  onCommitFeedback: boolean;
  feedbackContextList: any;
  consoleString?: string | null;
  monacoSize: { width: string | number; height: string | number };
}

const REVEAL_CONSOLE_HEIHGT = 31;
const DEFAULT_HEIGHT = 40;

class Editor extends React.Component<IProps, IState> {
  private options =
    this.props.paneFlag === 'New'
      ? {
          language: 'java',
          minimap: { enabled: false },
          scrollbar: {
            verticalScrollbarSize: 0,
            verticalSliderSize: 14,
            horizontalScrollbarSize: 0,
            horizontalSliderSize: 14,
            alwaysConsumeMouseWheel: false,
          },
          glyphMargin: false,
          folding: false,
          contextmenu: true,
          fontFamily:
            'ui-monospace,SFMono-Regular,SF Mono,Menlo,Consolas,Liberation Mono,monospace',
          fontSize: 14,
          lineHeight: 20,
          extraEditorClassName: 'CodeEditor',
          //+ -指示器
          renderIndicators: false,
          // editor是否可编辑
          readOnly: false,
        }
      : {
          language: 'java',
          minimap: { enabled: false },
          scrollbar: {
            verticalScrollbarSize: 0,
            verticalSliderSize: 14,
            horizontalScrollbarSize: 0,
            horizontalSliderSize: 14,
            alwaysConsumeMouseWheel: false,
          },
          glyphMargin: false,
          folding: false,
          contextmenu: false,
          fontFamily:
            'ui-monospace,SFMono-Regular,SF Mono,Menlo,Consolas,Liberation Mono,monospace',
          fontSize: 14,
          lineHeight: 20,
          extraEditorClassName: 'CodeEditor',
          //+ -指示器
          renderIndicators: true,
          // editor是否可编辑
          readOnly: true,
        };

  private uuid: string = '';
  private editorRef: RefObject<MonacoEditor> = createRef<MonacoEditor>();
  public editor: monacoEditor.editor.IStandaloneCodeEditor | undefined = undefined;
  constructor(props: IProps) {
    super(props);
    this.state = {
      showConsole: false,
      showCodeDetails: false,
      onCommitFeedback: true,
      feedbackContextList: [],
      monacoSize: { width: 0, height: 0 },
    };
  }
  componentDidMount() {
    this.uuid = 'editor' + uuidv4();
    this.editor = this.editorRef.current?.editor;
  }
  private handleResizeMonacoEditor = (entries: ResizeEntry[]) => {
    const e = entries[0] as ResizeEntry;
    const width = e.contentRect.width;
    let height = (e.contentRect.height ?? DEFAULT_HEIGHT) - 40; // 固定减去 TitleView 的 40 高
    if (this.state.showConsole) {
      // 显示全部 ConsoleView
      const consoleView = document.querySelector('.ConsoleView');
      if (consoleView !== null) height -= (consoleView as HTMLElement).offsetHeight;
    } else {
      height -= 30;
    } // 显示部分 ConsoleView，固定为 30px
    this.setState({ monacoSize: { width, height } });
  };
  private handleRunClick = async () => {
    let content: string | undefined = this.editorRef.current?.editor?.getValue();
    const version = this.props.versionText;
    if (typeof content === 'undefined') content = '';
    this.props.onRunCode?.call(this, content, version);
    if (!this.state.showConsole) {
      this.handleShowConsole();
    }
  };
  private handleShowConsole = () => {
    const width = this.state.monacoSize.width as number;
    const height = this.state.monacoSize.height as number;
    const consoleHeight = document.querySelector(`#${this.uuid} .ConsoleView`)?.clientHeight ?? 0;
    let nextH;
    if (this.state.showConsole) nextH = height + consoleHeight - REVEAL_CONSOLE_HEIHGT;
    // true => false
    else nextH = height - consoleHeight + REVEAL_CONSOLE_HEIHGT; // false => true
    this.setState({
      showConsole: !this.state.showConsole,
      monacoSize: { width, height: nextH },
    });
  };

  render() {
    const { darkTheme, value, title, extra, versionText, consoleString, isRunning } = this.props;
    const { showConsole, onCommitFeedback } = this.state;
    const { width, height } = this.state.monacoSize;
    const logs = (
      <pre className="log output" style={{ overflow: 'unset' }}>
        {consoleString}
      </pre>
    );

    return (
      <>
        <ResizeSensor onResize={this.handleResizeMonacoEditor}>
          <div className="EditorRoot" id={this.uuid}>
            <div
              className={darkTheme ? 'TitlebarView flex between dark' : 'TitlebarView flex between'}
              style={{ width: '100%', height: 'auto' }}
            >
              <div className="project-title">
                <EllipsisMiddle suffixCount={12}>{title}</EllipsisMiddle>
                <Button
                  id="commit-feedback-changes"
                  icon="upload"
                  intent="primary"
                  disabled={onCommitFeedback}
                  style={{ marginLeft: '5px' }}
                  onClick={() => {
                    message.info('Feedback Commit success, please wait to update');
                    // message.info(feedbackContextList);
                    this.setState({ onCommitFeedback: true });
                  }}
                >
                  Commit
                </Button>
              </div>

              <div className="run-button" style={{ border: 'solid', borderColor: 'green' }}>
                {extra}
                <Button
                  id="run-code-btn"
                  data-imitate
                  style={{ height: '30px' }}
                  intent="success"
                  icon="play"
                  onClick={this.handleRunClick}
                  loading={isRunning}
                >
                  Run migrate with {versionText}
                </Button>
              </div>
            </div>
            <div className="EditorView">
              <MonacoEditor
                ref={this.editorRef}
                width={width}
                height={height}
                language={'java'}
                theme={darkTheme ? 'vs-dark' : 'vs-light'}
                options={this.options}
                value={value}
                editorDidMount={(editor) => {
                  const changedLines = this.props.changedCodeLines;
                  const critical = this.props.criticalChangeLines ?? 0;
                  if (this.props.paneFlag === 'Old') {
                    changedLines?.map((range) => {
                      editor.deltaDecorations(
                        [],
                        [
                          {
                            range: new monaco.Range(range[0], 1, range[1], 1),
                            options: {
                              className: 'old-code-changed-lines',
                              isWholeLine: true,
                            },
                          },
                        ],
                      );
                    });
                    editor.revealPositionInCenter({ lineNumber: critical[0] - 10, column: 0 });
                  } else {
                    changedLines?.map((range) => {
                      editor.deltaDecorations(
                        [],
                        [
                          {
                            range: new monaco.Range(
                              range ? range[0] : 0,
                              1,
                              range ? range[1] : 0,
                              1,
                            ),
                            options: {
                              className: 'new-code-changed-lines',
                              isWholeLine: true,
                            },
                          },
                        ],
                      );
                    });
                    editor.revealPositionInCenter({ lineNumber: critical[0] - 10, column: 0 });
                    editor.deltaDecorations(
                      [],
                      [
                        {
                          range: new monaco.Range(critical[0], 1, critical[1], 1),
                          options: {
                            isWholeLine: true,
                            linesDecorationsClassName: 'critical-change-lines',
                            hoverMessage: { value: 'Critical Change' },
                          },
                        },
                      ],
                    );
                    editor.addAction({
                      id: 'feedback-reject',
                      label: 'feedback: reject',
                      keybindingContext: undefined,
                      contextMenuGroupId: 'navigation',
                      contextMenuOrder: 2,
                      run: (ed) => {
                        ed.deltaDecorations(
                          [],
                          [
                            {
                              range: new monaco.Range(
                                ed.getPosition()?.lineNumber ?? 0,
                                ed.getPosition()?.column ?? 0,
                                ed.getPosition()?.lineNumber ?? 0,
                                ed.getPosition()?.column ?? 0,
                              ),
                              options: {
                                isWholeLine: true,
                                className: 'feedback-content-class',
                                hoverMessage: { value: 'Feedback: Reject' },
                                // glyphMarginClassName: 'rejectContentClass',
                              },
                            },
                          ],
                        );
                        message.info(
                          'Position ' + ed.getPosition() + ' feedback changed to reject.',
                        );
                        this.setState({ onCommitFeedback: false });
                      },
                    });
                    editor.addAction({
                      id: 'feedback-add',
                      label: 'feedback: add',
                      keybindingContext: undefined,
                      contextMenuGroupId: 'navigation',
                      contextMenuOrder: 1,
                      run: (ed) => {
                        ed.deltaDecorations(
                          [],
                          [
                            {
                              range: new monaco.Range(
                                ed.getPosition()?.lineNumber ?? 0,
                                ed.getPosition()?.column ?? 0,
                                ed.getPosition()?.lineNumber ?? 0,
                                ed.getPosition()?.column ?? 0,
                              ),
                              options: {
                                isWholeLine: true,
                                className: 'feedback-content-class',
                                hoverMessage: { value: 'Feedback: Add' },
                                // glyphMarginClassName: 'rejectContentClass',
                              },
                            },
                          ],
                        );
                        message.info('Position ' + ed.getPosition() + ' feedback changed to add.');
                        this.setState({ onCommitFeedback: false });
                      },
                    });
                    editor.addAction({
                      id: 'feedback-accept',
                      label: 'feedback: accept',
                      keybindingContext: undefined,
                      contextMenuGroupId: 'navigation',
                      contextMenuOrder: 3,
                      run: (ed) => {
                        ed.deltaDecorations(
                          [],
                          [
                            {
                              range: new monaco.Range(
                                ed.getPosition()?.lineNumber ?? 0,
                                ed.getPosition()?.column ?? 0,
                                ed.getPosition()?.lineNumber ?? 0,
                                ed.getPosition()?.column ?? 0,
                              ),
                              options: {
                                isWholeLine: true,
                                className: 'feedback-content-class',
                                hoverMessage: { value: 'Feedback: Accept' },
                                // glyphMarginClassName: 'rejectContentClass',
                              },
                            },
                          ],
                        );
                        message.info(
                          'Position ' + ed.getPosition() + ' feedback changed to accept.',
                        );
                        this.setState({ onCommitFeedback: false });
                      },
                    });
                  }
                }}
                // editorWillMount={(monaco) => {}}
              />
            </div>
            <div
              className={showConsole ? 'ConsoleView open' : 'ConsoleView'}
              style={
                darkTheme
                  ? { backgroundColor: 'var(--dark-console-color)' }
                  : { backgroundColor: 'var(--light-console-color)' }
              }
            >
              <Divider className={darkTheme ? 'divider dark' : 'divider'} />
              <section className="flex vertical" style={{ width: '100%', height: '97%' }}>
                <div className="header flex between none" onClick={this.handleShowConsole}>
                  <div className="title">Console</div>
                  <div className="tools">
                    <Button minimal icon={showConsole ? 'chevron-down' : 'chevron-up'} />
                  </div>
                </div>
                <div id="logsFlow" className="Logs">
                  {logs}
                </div>
              </section>
            </div>
          </div>
        </ResizeSensor>
      </>
    );
  }
}

export default Editor;
