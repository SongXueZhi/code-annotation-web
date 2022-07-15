import type { RefObject } from 'react';
import React, { createRef } from 'react';
import { monaco, MonacoDiffEditor } from 'react-monaco-editor';
import { v4 as uuidv4 } from 'uuid';
import type * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
import type { Directory, Depandency } from './sidebar.d';
import { ResizeSensor, Divider, Button, ResizeEntry } from '@blueprintjs/core';
import './styles.css';
import EllipsisMiddle from '../EllipsisMiddle';
import { message, RadioChangeEvent } from 'antd';
import { Radio, Modal } from 'antd';
import CodeDetails from '../CodeDetails';
import type { DiffEditDetailItems, FeedbackList, HunkEntityItems } from '@/pages/editor/data';

interface IProps {
  title: string;
  regressionUuid: string;
  filename: string;
  extra?: JSX.Element;
  oldVersionText?: string;
  newVersionText?: string;
  newPath: string;
  oldPath: string;
  darkTheme: boolean;
  dirs?: Directory[];
  depandencies?: Depandency[];
  original?: string;
  value?: string;
  diffEditChanges: DiffEditDetailItems[];
  isRunning: boolean;
  consoleString?: string;
  CriticalChange: HunkEntityItems | undefined;
  onRunCode?: (code: string, version: string) => void;
  onFeedbackList?: (feedback: FeedbackList) => void;
}
interface IState {
  showConsole: boolean;
  showCodeDetails: boolean;
  feedbackContextList: FeedbackList;
  version: 'left' | 'right';
  consoleString?: string | null;
  monacoSize: { width: string | number; height: string | number };
  decorationIds: string[];
}

const REVEAL_CONSOLE_HEIHGT = 31;
const DEFAULT_HEIGHT = 40;
class CodeEditor extends React.Component<IProps, IState> {
  private options = {
    renderSideBySide: false,
    minimap: { enabled: false },
    scrollbar: {
      verticalScrollbarSize: 0,
      verticalSliderSize: 14,
      horizontalScrollbarSize: 0,
      horizontalSliderSize: 14,
      alwaysConsumeMouseWheel: false,
    },
    glyphMargin: true,
    folding: false,
    contextmenu: true,
    fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Menlo,Consolas,Liberation Mono,monospace',
    fontSize: 14,
    lineHeight: 20,
    extraEditorClassName: 'CodeEditor',
    //+ -指示器
    renderIndicators: true,
    // 原来的editor是否可编辑
    originalEditable: false,
  };
  private uuid: string = '';
  private editorRef: RefObject<MonacoDiffEditor> = createRef<MonacoDiffEditor>();
  public editor: monacoEditor.editor.IStandaloneDiffEditor | undefined = undefined;
  constructor(props: IProps) {
    super(props);
    this.state = {
      showConsole: false,
      showCodeDetails: false,
      feedbackContextList: {
        decorationKey: [],
        revision: 'bic',
        fileName: '',
        feedback: '',
        hunkData: {
          criticalChangeId: 0,
          newPath: '',
          oldPath: '',
          beginA: 0,
          beginB: 0,
          endA: 0,
          endB: 0,
          type: '',
        },
      },
      version: 'left',
      monacoSize: { width: 0, height: 0 },
      decorationIds: [],
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
  private handleVersionChange = ({ target }: RadioChangeEvent) => {
    this.setState({
      version: target.value as 'left' | 'right',
    });
  };
  private handleRunClick = async () => {
    let content: string | undefined = (
      this.state.version === 'left'
        ? this.editorRef.current?.editor?.getOriginalEditor()
        : this.editorRef.current?.editor?.getModifiedEditor()
    )?.getValue();
    const version =
      this.state.version === 'left'
        ? this.props.oldVersionText ?? 'left'
        : this.props.newVersionText ?? 'right';
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
  private handlefeedbackList = async (
    key: string[],
    revision: 'bic' | 'bfc',
    fileName: string,
    feedback: string,
    range: monaco.Selection,
    hunkData: DiffEditDetailItems,
  ) => {
    this.setState({
      feedbackContextList: {
        decorationKey: key,
        revision: revision,
        fileName: fileName,
        feedback: feedback,
        hunkData: {
          newPath: this.props.newPath,
          oldPath: this.props.oldPath,
          beginA: hunkData.beginA ?? range.startLineNumber,
          beginB: hunkData.beginB ?? range.startLineNumber,
          endA: hunkData.endA ?? range.endLineNumber,
          endB: hunkData.endB ?? range.endLineNumber,
          type: hunkData.type ?? '',
        },
      },
    });
    this.props.onFeedbackList?.call(this, this.state.feedbackContextList);
  };
  render() {
    const {
      regressionUuid,
      filename,
      darkTheme,
      original,
      value,
      title,
      extra,
      diffEditChanges,
      oldVersionText,
      newVersionText,
      consoleString,
      isRunning,
      CriticalChange,
    } = this.props;
    const { showConsole, version, showCodeDetails, decorationIds } = this.state;
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
                  id="show-code-details"
                  icon="search"
                  intent="primary"
                  style={{ marginLeft: '5px' }}
                  onClick={() => this.setState({ showCodeDetails: true })}
                >
                  Details
                </Button>
              </div>
              <div className="run-button" style={{ border: 'solid', borderColor: 'green' }}>
                {extra}
                <Button
                  id="run-code-btn"
                  data-imitate
                  style={{ height: '30px', marginRight: '5px' }}
                  intent="success"
                  icon="play"
                  onClick={this.handleRunClick}
                  loading={isRunning}
                >
                  Run
                </Button>
                <Radio.Group
                  value={version}
                  buttonStyle="solid"
                  onChange={this.handleVersionChange}
                >
                  <Radio value="left">{oldVersionText ?? 'left'}</Radio>
                  <Radio value="right">{newVersionText ?? 'right'}</Radio>
                </Radio.Group>
              </div>
            </div>
            <div className="EditorView">
              <MonacoDiffEditor
                ref={this.editorRef}
                width={width}
                height={height}
                language={'java'}
                theme={darkTheme ? 'vs-dark' : 'vs-light'}
                options={this.options}
                original={original}
                value={value}
                editorDidMount={(diffEditor) => {
                  if (CriticalChange !== undefined) {
                    console.log(CriticalChange.beginB);
                    const codeEditor = diffEditor.getModifiedEditor();
                    diffEditor.revealLineInCenter(
                      CriticalChange.beginB - 10 >= 0
                        ? CriticalChange.beginB - 10
                        : CriticalChange.beginB,
                    );
                    codeEditor.deltaDecorations(
                      [],
                      [
                        {
                          range: new monaco.Range(CriticalChange.beginB, 0, CriticalChange.endB, 0),
                          options: {
                            isWholeLine: true,
                            className: 'criticalChangeHintClass',
                          },
                        },
                      ],
                    );
                  } else {
                    console.log('no hunk');
                  }
                  diffEditor.addAction({
                    id: 'feedback-add',
                    label: 'feedback: add',
                    keybindingContext: undefined,
                    contextMenuGroupId: 'navigation',
                    contextMenuOrder: 1,
                    run: (ed) => {
                      const selectionRange = ed.getSelection();
                      if (selectionRange) {
                        const hunkData = diffEditChanges.find((resp) => {
                          if (
                            (selectionRange.startLineNumber <= resp.beginB &&
                              selectionRange.endLineNumber >= resp.beginB) ||
                            (selectionRange.startLineNumber >= resp.beginB &&
                              selectionRange.startLineNumber <= resp.endB)
                          ) {
                            return resp;
                          } else {
                            return undefined;
                          }
                        });
                        const oldDecorations = ed.getDecorationsInRange(selectionRange);
                        if (oldDecorations !== null && hunkData !== undefined) {
                          if (decorationIds.some((d) => d === oldDecorations[0].id)) {
                            const newIdList = decorationIds.filter(
                              (v) => v !== oldDecorations[0].id,
                            );
                            const newDecoration = ed.deltaDecorations(
                              [oldDecorations[0].id],
                              [
                                {
                                  range: selectionRange,
                                  options: {
                                    className: 'addContentClass',
                                    hoverMessage: { value: 'Feedback: Add' },
                                  },
                                },
                              ],
                            );
                            this.setState({
                              decorationIds: newIdList.splice(
                                newIdList.length + 1,
                                0,
                                newDecoration.toString(),
                              ),
                            });
                            this.handlefeedbackList(
                              newDecoration,
                              title === 'Bug Inducing Commit' ? 'bic' : 'bfc',
                              filename,
                              'add',
                              selectionRange,
                              hunkData,
                            );
                          } else {
                            const newDecoration = ed.deltaDecorations(
                              [],
                              [
                                {
                                  range: selectionRange,
                                  options: {
                                    className: 'addContentClass',
                                    hoverMessage: { value: 'Feedback: Add' },
                                  },
                                },
                              ],
                            );
                            this.setState({
                              decorationIds: decorationIds.splice(
                                decorationIds.length + 1,
                                0,
                                newDecoration.toString(),
                              ),
                            });
                            this.handlefeedbackList(
                              newDecoration,
                              title === 'Bug Inducing Commit' ? 'bic' : 'bfc',
                              filename,
                              'add',
                              selectionRange,
                              hunkData,
                            );
                          }
                        } else {
                          message.warning('The code you select does not have hunk information!');
                        }
                      } else {
                        console.log('nothing');
                      }
                    },
                  });
                  diffEditor.addAction({
                    id: 'feedback-reject',
                    label: 'feedback: reject',
                    keybindingContext: undefined,
                    contextMenuGroupId: 'navigation',
                    contextMenuOrder: 2,
                    run: (ed) => {
                      const selectionRange = ed.getSelection();
                      if (selectionRange) {
                        const hunkData = diffEditChanges.find((resp) => {
                          if (
                            (selectionRange.startLineNumber <= resp.beginB &&
                              selectionRange.endLineNumber >= resp.beginB) ||
                            (selectionRange.startLineNumber >= resp.beginB &&
                              selectionRange.startLineNumber <= resp.endB)
                          ) {
                            return resp;
                          } else {
                            return undefined;
                          }
                        });
                        const oldDecorations = ed.getDecorationsInRange(selectionRange);
                        if (oldDecorations !== null && hunkData !== undefined) {
                          if (decorationIds.some((d) => d === oldDecorations[0].id)) {
                            const newIdList = decorationIds.filter(
                              (v) => v !== oldDecorations[0].id,
                            );
                            const newDecoration = ed.deltaDecorations(
                              [oldDecorations[0].id],
                              [
                                {
                                  range: selectionRange,
                                  options: {
                                    className: 'rejectContentClass',
                                    hoverMessage: { value: 'Feedback: Reject' },
                                  },
                                },
                              ],
                            );
                            this.setState({
                              decorationIds: newIdList.splice(
                                newIdList.length + 1,
                                0,
                                newDecoration.toString(),
                              ),
                            });
                            this.handlefeedbackList(
                              newDecoration,
                              title === 'Bug Inducing Commit' ? 'bic' : 'bfc',
                              filename,
                              'reject',
                              selectionRange,
                              hunkData,
                            );
                          } else {
                            const newDecoration = ed.deltaDecorations(
                              [],
                              [
                                {
                                  range: selectionRange,
                                  options: {
                                    className: 'rejectContentClass',
                                    hoverMessage: { value: 'Feedback: Reject' },
                                  },
                                },
                              ],
                            );
                            this.setState({
                              decorationIds: decorationIds.splice(
                                decorationIds.length + 1,
                                0,
                                newDecoration.toString(),
                              ),
                            });
                            this.handlefeedbackList(
                              newDecoration,
                              title === 'Bug Inducing Commit' ? 'bic' : 'bfc',
                              filename,
                              'reject',
                              selectionRange,
                              hunkData,
                            );
                          }
                        } else {
                          message.warning('The code you select does not have hunk information!');
                        }
                      } else {
                        console.log('nothing');
                      }
                    },
                  });
                  diffEditor.addAction({
                    id: 'feedback-confirm-ground-truth',
                    label: 'feedback: confirm',
                    keybindingContext: undefined,
                    contextMenuGroupId: 'navigation',
                    contextMenuOrder: 3,
                    run: (ed) => {
                      const selectionRange = ed.getSelection();
                      if (selectionRange) {
                        const hunkData = diffEditChanges.find((resp) => {
                          if (
                            (selectionRange.startLineNumber <= resp.beginB &&
                              selectionRange.endLineNumber >= resp.beginB) ||
                            (selectionRange.startLineNumber >= resp.beginB &&
                              selectionRange.startLineNumber <= resp.endB)
                          ) {
                            return resp;
                          } else {
                            return undefined;
                          }
                        });
                        const oldDecorations = ed.getDecorationsInRange(selectionRange);
                        if (oldDecorations !== null && hunkData !== undefined) {
                          if (decorationIds.some((d) => d === oldDecorations[0].id)) {
                            const newIdList = decorationIds.filter(
                              (v) => v !== oldDecorations[0].id,
                            );
                            const newDecoration = ed.deltaDecorations(
                              [oldDecorations[0].id],
                              [
                                {
                                  range: selectionRange,
                                  options: {
                                    className: 'confirmContentClass',
                                    hoverMessage: { value: 'Feedback: Confirm' },
                                  },
                                },
                              ],
                            );
                            this.setState({
                              decorationIds: newIdList.splice(
                                newIdList.length + 1,
                                0,
                                newDecoration.toString(),
                              ),
                            });
                          } else {
                            const newDecoration = ed.deltaDecorations(
                              [],
                              [
                                {
                                  range: selectionRange,
                                  options: {
                                    className: 'confirmContentClass',
                                    hoverMessage: { value: 'Feedback: Confirm' },
                                  },
                                },
                              ],
                            );
                            this.setState({
                              decorationIds: decorationIds.splice(
                                decorationIds.length + 1,
                                0,
                                newDecoration.toString(),
                              ),
                            });
                          }
                        } else {
                          message.warning('The code you select does not have hunk information!');
                        }
                      } else {
                        console.log('nothing');
                      }
                    },
                  });
                }}
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
        <Modal
          width="80%"
          visible={showCodeDetails}
          onCancel={() => this.setState({ showCodeDetails: false })}
          footer={null}
        >
          <CodeDetails
            regressionUuid={regressionUuid}
            diffEditDetails={diffEditChanges}
            revisionFlag={title}
            criticalChangeOriginal={original}
            criticalChangeNew={value}
            fileName={filename}
          />
        </Modal>
      </>
    );
  }
}

export default CodeEditor;
