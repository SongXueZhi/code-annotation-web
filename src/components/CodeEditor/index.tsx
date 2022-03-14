import type { RefObject } from 'react';
import React, { createRef } from 'react';
import { MonacoDiffEditor } from 'react-monaco-editor';
import { v4 as uuidv4 } from 'uuid';
import type * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
import type { Directory, Depandency } from './sidebar.d';
import type { ResizeEntry } from '@blueprintjs/core';
import { ResizeSensor, Divider, Button } from '@blueprintjs/core';
import './styles.css';
import EllipsisMiddle from '../EllipsisMiddle';
import type { RadioChangeEvent } from 'antd';
import { Radio } from 'antd';

interface IProps {
  title: string;
  extra?: JSX.Element;
  oldVersionText?: string;
  newVersionText?: string;
  darkTheme: boolean;
  dirs?: Directory[];
  depandencies?: Depandency[];
  original?: string;
  value?: string;
  onRunCode?: (code: string, version: string) => Promise<string>;
}
interface IState {
  isRunning: boolean;
  showConsole: boolean;
  version: 'left' | 'right';
  console?: string;
  monacoSize: { width: string | number; height: string | number };
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
    glyphMargin: false,
    folding: false,
    contextmenu: false,
    fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Menlo,Consolas,Liberation Mono,monospace',
    fontSize: 6,
    lineHeight: 20,
    extraEditorClassName: 'CodeEditor',
    //+ -指示器
    renderIndicators: false,
    // 原来的editor是否可编辑
    originalEditable: true,
  };
  private uuid: string = '';
  private editorRef: RefObject<MonacoDiffEditor> = createRef<MonacoDiffEditor>();
  public editor: monacoEditor.editor.IStandaloneDiffEditor | undefined = undefined;
  constructor(props: IProps) {
    super(props);
    this.state = {
      isRunning: false,
      showConsole: false,
      version: 'left',
      console: '',
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
  private handleVersionChange = ({ target }: RadioChangeEvent) => {
    this.setState({
      version: target.value as 'left' | 'right',
    });
  };
  private handleRunClick = async () => {
    this.setState({
      isRunning: !this.state.isRunning,
    });
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
    const output = await this.props.onRunCode?.call(this, content, version);
    this.setState(
      {
        console: output,
      },
      () => {
        if (!this.state.showConsole) {
          this.handleShowConsole();
        }
      },
    );
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
    const { darkTheme, original, value, title, extra, oldVersionText, newVersionText } = this.props;
    const { isRunning, showConsole, version, console } = this.state;
    const { width, height } = this.state.monacoSize;
    const logs = <pre className="log output">{console}</pre>;
    return (
      <ResizeSensor onResize={this.handleResizeMonacoEditor}>
        <div className="EditorRoot" id={this.uuid}>
          <div
            className={darkTheme ? 'TitlebarView flex between dark' : 'TitlebarView flex between'}
            style={{ width: '100%' }}
          >
            <div className="project-title">
              <EllipsisMiddle suffixCount={12}>{title}</EllipsisMiddle>
            </div>
            <div className="run-button" style={{ border: 'solid', borderColor: 'green' }}>
              {extra}
              <Button
                id="run-code-btn"
                data-imitate
                style={{ height: '30px', marginRight: '10px' }}
                intent="success"
                icon="play"
                onClick={this.handleRunClick}
                loading={isRunning}
              >
                Run migrate with
              </Button>
              <Radio.Group value={version} buttonStyle="solid" onChange={this.handleVersionChange}>
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
              language="javascript"
              theme={darkTheme ? 'vs-dark' : 'vs-light'}
              options={this.options}
              original={original}
              value={value}
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
            <section className="flex vertical" style={{ width: '100%', height: '100%' }}>
              <div className="header flex between none" onClick={this.handleShowConsole}>
                <div className="title">Console</div>
                <div className="tools">
                  <Button minimal icon={showConsole ? 'chevron-down' : 'chevron-up'} />
                </div>
              </div>
              <div className="Logs auto" style={{ overflow: 'auto' }}>
                {logs}
              </div>
            </section>
          </div>
        </div>
      </ResizeSensor>
    );
  }
}

export default CodeEditor;
