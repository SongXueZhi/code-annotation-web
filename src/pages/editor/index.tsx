import React, { useCallback, useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Descriptions, Menu, Radio, Tag, Tooltip, Typography } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';
import DiffEditorTabs from './components/DiffEditorTabs';
import type { IRouteComponentProps } from 'umi';
import {
  getRegressionConsole,
  queryRegressionCode,
  queryRegressionDetail,
  getRegressionPath,
  regressionCheckout,
} from './service';
import type { CommitItem } from './data';
import { parse } from 'query-string';

const { SubMenu } = Menu;
const { Text } = Typography;

const testMethodList = [
  {
    key: 'testcase',
    tab: 'test cases',
  },
  {
    key: 'features',
    tab: 'features',
  },
];

interface IHistorySearch {
  regressionUuid: string;
}

export type CommitFile = {
  newPath: string;
  oldPath: string;
  newCode: string;
  oldCode: string;
};

export interface FilePaneItem extends CommitFile {
  key: string;
}

// function markMatch(
//   bic: CommitItem[],
//   bfc: CommitItem[],
// ): { bfcMatch: CommitItem[]; bicMatch: CommitItem[] } {
//   for (let i = 0; i < bfc.length; i++) {
//     if(bfc.includes(bic[i]))
//       bic[i].matchStatus = true;
//     }
//   }
// }

// // 轮询函数
// function useInterval(callback: any, delay: number | null | undefined) {
//   // useEffect(() => {
//   savedCallback.current = callback;
//   // });
//   // useEffect(() => {
//   function tick() {
//     savedCallback.current();
//   }
//   if (delay !== null) {
//     const id = setInterval(tick, delay);
//     return () => clearInterval(id);
//   }
//   console.log('end: ' + counter);
//   // }, [delay]);
// }

const EditorPage: React.FC<IRouteComponentProps> = ({ location }) => {
  const HISTORY_SEARCH = parse(location.search) as unknown as IHistorySearch;
  // const savedCallback = useRef<any>();
  const [testCaseName, setTestCaseName] = useState<string>();
  const [testTabKey, setTestTabKey] = useState('testcase');
  const [activeBICKey, setActiveBICKey] = useState<string>();
  const [activeBFCKey, setActiveBFCKey] = useState<string>();
  const [BICConsoleResult, setBICConsoleResult] = useState<string>();
  const [BFCConsoleResult, setBFCConsoleResult] = useState<string>();
  const [panesBIC, setPanesBIC] = useState<FilePaneItem[]>([]);
  const [panesBFC, setPanesBFC] = useState<FilePaneItem[]>([]);
  const [listBIC, setListBIC] = useState<CommitItem[]>([]);
  const [listBFC, setListBFC] = useState<CommitItem[]>([]);
  const [projectFullName, setProjectFullName] = useState<string>();
  const [BIC, setBIC] = useState<string>();
  const [BFC, setBFC] = useState<string>();
  const [BICisRunning, setBICIsRunning] = useState<boolean>(false);
  const [BFCisRunning, setBFCIsRunning] = useState<boolean>(false);

  const contentListNoTitle = {
    testcase: <p style={{ marginRight: 200 }}>{testCaseName}() </p>,
    features: <p>N.A.</p>,
  };

  const bicFile: CommitFile = {
    newPath: 'src/main/java/org/jsoup/parser/Tokeniser.java',
    oldPath: 'src/main/java/org/jsoup/parser/Tokeniser.java',
    newCode: `package org.jsoup.parser;
    import org.jsoup.helper.Validate;
    import org.jsoup.nodes.Entities;

    import java.util.ArrayList;
    import java.util.List;

    /**
     * Readers the input stream into tokens.
     */
    class Tokeniser {
        static final char replacementChar = '\uFFFD'; // replaces null character

        private CharacterReader reader; // html input
        private boolean trackErrors = true;
        private List<ParseError> errors = new ArrayList<ParseError>(); // errors found while tokenising

        private TokeniserState state = TokeniserState.Data; // current tokenisation state
        private Token emitPending; // the token we are about to emit on next read
        private boolean isEmitPending = false;
        private StringBuilder charBuffer = new StringBuilder(); // buffers characters to output as one token
        StringBuilder dataBuffer; // buffers data looking for </script>

        Token.Tag tagPending; // tag we are building up
        Token.Doctype doctypePending; // doctype building up
        Token.Comment commentPending; // comment building up
        private Token.StartTag lastStartTag; // the last start tag emitted, to test appropriate end tag
        private boolean selfClosingFlagAcknowledged = true;

        Tokeniser(CharacterReader reader) {
            this.reader = reader;
        }

        Token read() {
            if (!selfClosingFlagAcknowledged) {
                error("Self closing flag not acknowledged");
                selfClosingFlagAcknowledged = true;
            }
            while (!isEmitPending)
            tate.read(this, reader);

          // if emit is pending, a non-character token was found: return any chars in buffer, and leave token for next read:
          if (charBuffer.length() > 0) {
              String str = charBuffer.toString();
              charBuffer.delete(0, charBuffer.length());
              return new Token.Character(str);
          } else {
              isEmitPending = false;
              return emitPending;
          }
      }

      void emit(Token token) {
          Validate.isFalse(isEmitPending, "There is an unread token pending!");

          emitPending = token;
          isEmitPending = true;

          if (token.type == Token.TokenType.StartTag) {
              Token.StartTag startTag = (Token.StartTag) token;
              lastStartTag = startTag;
              if (startTag.selfClosing)
                  selfClosingFlagAcknowledged = false;
          } else if (token.type == Token.TokenType.EndTag) {
              Token.EndTag endTag = (Token.EndTag) token;
              if (endTag.attributes.size() > 0)
                  error("Attributes incorrectly present on end tag");
          }
      }

      void emit(String str) {
          // buffer strings up until last string token found, to emit only one token for a run of character refs etc.
          // does not set isEmitPending; read checks that
          charBuffer.append(str);
      }

      void emit(char c) {
          charBuffer.append(c);
      }

      TokeniserState getState() {
          return state;
      }`,
    oldCode: ``,
  };
  const bfcFile: CommitFile = {
    newPath: 'src/test/java/org/jsoup/parser/AttributeParseTest.java',
    oldPath: 'src/test/java/org/jsoup/parser/AttributeParseTest.java',
    newCode: `package org.jsoup.parser;
    import org.jsoup.Jsoup;
    import org.jsoup.nodes.Attributes;
    import org.jsoup.nodes.Element;
    import org.jsoup.select.Elements;
    import org.junit.Test;
    import static org.junit.Assert.*;
    /**
     Test suite for attribute parser.
     @author Jonathan Hedley, jonathan@hedley.net */
    public class AttributeParseTest {
        @Test public void parsesRoughAttributeString() {
            String html = "<a id=\"123\" class=\"baz = 'bar'\" style = 'border: 2px'qux zim foo = 12 mux=18 />";
            // should be: <id=123>, <class=baz = 'bar'>, <qux=>, <zim=>, <foo=12>, <mux.=18>
            Element el = Jsoup.parse(html).getElementsByTag("a").get(0);
            Attributes attr = el.attributes();
            assertEquals(7, attr.size());
            assertEquals("123", attr.get("id"));
            assertEquals("baz = 'bar'", attr.get("class"));
            assertEquals("border: 2px", attr.get("style"));
            assertEquals("", attr.get("qux"));
            assertEquals("", attr.get("zim"));
            assertEquals("12", attr.get("foo"));
            assertEquals("18", attr.get("mux"));
        }
        @Test public void handlesNewLinesAndReturns() {
            String html = "<a\r\nfoo='bar\r\nqux'\r\nbar\r\n=\r\ntwo>One</a>";
            Element el = Jsoup.parse(html).select("a").first();
            assertEquals(2, el.attributes().size());
            assertEquals("bar\r\nqux", el.attr("foo")); // currently preserves newlines in quoted attributes. todo confirm if should.
            assertEquals("two", el.attr("bar"));
        }
        @Test public void parsesEmptyString() {
            String html = "<a />";
            Element el = Jsoup.parse(html).getElementsByTag("a").get(0);
            Attributes attr = el.attributes();
            assertEquals(0, attr.size());
        }
        @Test public void canStartWithEq() {
            String html = "<a =empty />";
            Element el = Jsoup.parse(html).getElementsByTag("a").get(0);
            Attributes attr = el.attributes();
            assertEquals(1, attr.size());
            assertTrue(attr.hasKey("=empty"));
            assertEquals("", attr.get("=empty"));
        }
        @Test public void strictAttributeUnescapes() {
            String html = "<a id=1 href='?foo=bar&mid&lt=true'>One</a> <a id=2 href='?foo=bar&lt;qux&lg=1'>Two</a>";
            Elements els = Jsoup.parse(html).select("a");
            assertEquals("?foo=bar&mid&lt=true", els.first().attr("href"));
            assertEquals("?foo=bar<qux&lg=1", els.last().attr("href"));
        }

        @Test public void moreAttributeUnescapes() {
            String html = "<a href='&wr_id=123&mid-size=true&ok=&wr'>Check</a>";
            Elements els = Jsoup.parse(html).select("a");
            assertEquals("&wr_id=123&mid-size=true&ok=&wr", els.first().attr("href"));
        }
    }`,
    oldCode: `package org.jsoup.parser;
    import org.jsoup.Jsoup;
    import org.jsoup.nodes.Attributes;
    import org.jsoup.nodes.Element;
    import org.jsoup.select.Elements;
    import org.junit.Test;
    import static org.junit.Assert.*;
    /**
     Test suite for attribute parser.
     @author Jonathan Hedley, jonathan@hedley.net */
    public class AttributeParseTest {
        @Test public void parsesRoughAttributeString() {
            String html = "<a id=\"123\" class=\"baz = 'bar'\" style = 'border: 2px'qux zim foo = 12 mux=18 />";
            // should be: <id=123>, <class=baz = 'bar'>, <qux=>, <zim=>, <foo=12>, <mux.=18>
            Element el = Jsoup.parse(html).getElementsByTag("a").get(0);
            Attributes attr = el.attributes();
            assertEquals(7, attr.size());
            assertEquals("123", attr.get("id"));
            assertEquals("baz = 'bar'", attr.get("class"));
            assertEquals("border: 2px", attr.get("style"));
            assertEquals("", attr.get("qux"));
            assertEquals("", attr.get("zim"));
            assertEquals("12", attr.get("foo"));
            assertEquals("18", attr.get("mux"));
        }
        @Test public void handlesNewLinesAndReturns() {
            String html = "<a\r\nfoo='bar\r\nqux'\r\nbar\r\n=\r\ntwo>One</a>";
            Element el = Jsoup.parse(html).select("a").first();
            assertEquals(2, el.attributes().size());
            assertEquals("bar\r\nqux", el.attr("foo")); // currently preserves newlines in quoted attributes. todo confirm if should.
            assertEquals("two", el.attr("bar"));
        }
        @Test public void parsesEmptyString() {
            String html = "<a />";
            Element el = Jsoup.parse(html).getElementsByTag("a").get(0);
            Attributes attr = el.attributes();
            assertEquals(0, attr.size());
        }
        @Test public void canStartWithEq() {
            String html = "<a =empty />";
            Element el = Jsoup.parse(html).getElementsByTag("a").get(0);
            Attributes attr = el.attributes();
            assertEquals(1, attr.size());
            assertTrue(attr.hasKey("=empty"));
            assertEquals("", attr.get("=empty"));
        }
        @Test public void strictAttributeUnescapes() {
            String html = "<a id=1 href='?foo=bar&mid&lt=true'>One</a> <a id=2 href='?foo=bar&lt;qux&lg=1'>Two</a>";
            Elements els = Jsoup.parse(html).select("a");
            assertEquals("?foo=bar∣&lt=true", els.first().attr("href")); // &mid gets to ∣ because not tailed by =; lt is so not unescaped
            assertEquals("?foo=bar<qux&lg=1", els.last().attr("href"));
        }

        @Test public void moreAttributeUnescapes() {
            String html = "<a href='&wr_id=123&mid-size=true&ok=&wr'>Check</a>";
            Elements els = Jsoup.parse(html).select("a");
            assertEquals("&wr_id=123&mid-size=true&ok=≀", els.first().attr("href"));
        }
    }`,
  };

  const getFile = async (params: {
    commit: string;
    repoUuid: string;
    bugId: string;
    filename: string;
    newPath: string;
    oldPath: string;
  }) => {
    if (params.commit === 'BFC') {
      return (
        queryRegressionCode({
          regression_uuid: HISTORY_SEARCH.regressionUuid,
          filename: params.filename,
          userToken: '123',
          new_path: params.newPath,
          old_path: params.oldPath,
          revisionFlag: 'bfc',
        }) ?? bicFile
      );
      // return bicFile;
    }
    if (params.commit === 'BIC') {
      return (
        queryRegressionCode({
          regression_uuid: HISTORY_SEARCH.regressionUuid,
          filename: params.filename,
          userToken: '123',
          new_path: params.newPath,
          old_path: params.oldPath,
          revisionFlag: 'bic',
        }) ?? bfcFile
        // return bfcFile;
      );
    }
    return {};
  };

  const getConsoleResult = async (params: {
    regression_uuid: string;
    revisionFlag: string; // work | bic | buggy | bfc
    userToken: string;
  }) => {
    if (params.revisionFlag === 'work') {
      const path = await getRegressionPath({
        regression_uuid: params.regression_uuid,
        revisionFlag: params.revisionFlag,
        userToken: '123',
      }).then((resp) => {
        if (resp !== null && resp !== undefined) {
          return resp;
        } else {
          return null;
        }
      });
      if (path !== null && path !== undefined) {
        setBICIsRunning(true);
        while (true) {
          const data = await getRegressionConsole({ path: path });
          await wait(500);
          setBICConsoleResult(data ?? '');
          if (data && data.includes('REGMINER-TEST-END')) {
            break;
          }
        }
        setBICIsRunning(false);
      }
    }
    if (params.revisionFlag === 'bug introduce') {
      const path = await getRegressionPath({
        regression_uuid: params.regression_uuid,
        revisionFlag: 'bic',
        userToken: '123',
      }).then((resp) => {
        if (resp !== null && resp !== undefined) {
          return resp;
        } else {
          return null;
        }
      });
      if (path !== null && path !== undefined) {
        setBICIsRunning(true);
        while (true) {
          const data = await getRegressionConsole({ path: path });
          await wait(500);
          setBICConsoleResult(data ?? '');
          if (data && data.includes('REGMINER-TEST-END')) {
            break;
          }
        }
        setBICIsRunning(false);
      }
    }

    if (params.revisionFlag === 'buggy') {
      const path = await getRegressionPath({
        regression_uuid: params.regression_uuid,
        revisionFlag: params.revisionFlag,
        userToken: '123',
      }).then((resp) => {
        if (resp !== null && resp !== undefined) {
          return resp;
        } else {
          return null;
        }
      });
      if (path !== null && path !== undefined) {
        setBFCIsRunning(true);
        while (true) {
          const data = await getRegressionConsole({ path: path });
          await wait(500);
          setBFCConsoleResult(data ?? '');
          if (data && data.includes('REGMINER-TEST-END')) {
            break;
          }
        }
        setBFCIsRunning(false);
      }
    }
    if (params.revisionFlag === 'bug fix') {
      const path = await getRegressionPath({
        regression_uuid: params.regression_uuid,
        revisionFlag: 'bfc',
        userToken: '123',
      }).then((resp) => {
        if (resp !== null && resp !== undefined) {
          return resp;
        } else {
          return null;
        }
      });
      if (path !== null && path !== undefined) {
        setBFCIsRunning(true);
        while (true) {
          const data = await getRegressionConsole({ path: path });
          await wait(500);
          setBFCConsoleResult(data ?? '');
          if (data && data.includes('REGMINER-TEST-END')) {
            break;
          }
        }
        setBFCIsRunning(false);
      }
    }
  };

  // 计时器
  function wait(ms: number) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('running');
        resolve(true);
      }, ms);
    });
  }

  const handleMenuClick = useCallback(
    (commit, filename, oldPath, newPath) => {
      const key = `${commit}-${filename}`;
      // const [key, commit] = keyPath;
      // const [_, filename] = key.split(`${commit}-`);
      getFile({
        commit: commit,
        repoUuid: '',
        bugId: '',
        filename: filename,
        newPath: newPath,
        oldPath: oldPath,
      })
        .then((resp: any) => {
          if (commit === 'BIC') {
            if (
              panesBIC.some((data) => {
                return data.key === key;
              })
            ) {
              setPanesBIC(panesBIC);
            } else {
              setPanesBIC(panesBIC.concat({ ...resp, key }));
            }
          }
          if (commit === 'BFC') {
            if (
              panesBFC.some((data) => {
                return data.key === key;
              })
            ) {
              setPanesBFC(panesBFC);
            } else {
              setPanesBFC(panesBFC.concat({ ...resp, key }));
            }
          }
        })
        .then(() => {
          if (commit === 'BIC') {
            setActiveBICKey(key);
          }
          if (commit === 'BFC') {
            setActiveBFCKey(key);
          }
        });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [panesBFC, panesBIC],
  );

  const handleBICRunClick = useCallback(
    async (content, version) => {
      setBICConsoleResult('');
      const consoleResult = getConsoleResult({
        regression_uuid: HISTORY_SEARCH.regressionUuid,
        revisionFlag: version,
        userToken: '123',
      }).then((resp) => resp);
      return consoleResult;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getConsoleResult],
  );

  const handleBFCRunClick = useCallback(
    async (content, version) => {
      setBFCConsoleResult('');
      const consoleResult = getConsoleResult({
        regression_uuid: HISTORY_SEARCH.regressionUuid,
        revisionFlag: version,
        userToken: '123',
      }).then((resp) => resp);
      return consoleResult;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getConsoleResult],
  );

  const onTestTabChange = (key: React.SetStateAction<string>) => {
    setTestTabKey(key);
  };

  useEffect(() => {
    regressionCheckout({ regression_uuid: HISTORY_SEARCH.regressionUuid, userToken: '123' });
    queryRegressionDetail({ regression_uuid: HISTORY_SEARCH.regressionUuid }).then((data) => {
      if (data !== null && data !== undefined) {
        setListBFC(data.bfcChangedFiles);
        setListBIC(data.bicChangedFiles);
        setBFC(data.bfc);
        setBIC(data.bic);
        setProjectFullName(data.projectFullName);
        setTestCaseName(data.testCaseName);
      }
    });
  }, [HISTORY_SEARCH.regressionUuid]);

  return (
    <>
      <PageContainer
        fixedHeader
        header={{
          title: 'Regression verfication',
          subTitle: (
            <Typography.Text>Regression UUID: {HISTORY_SEARCH.regressionUuid}</Typography.Text>
          ),
          footer: (
            <div style={{ display: 'inline-flex', alignItems: 'center' }}>
              <Descriptions column={3} style={{ flex: 1 }}>
                <Descriptions.Item label="Project">
                  <Typography.Text keyboard strong>
                    {projectFullName}
                  </Typography.Text>
                </Descriptions.Item>
                <Descriptions.Item label="Bug Inducing Commit">
                  <div>
                    <Typography.Text keyboard strong>
                      {BIC}
                    </Typography.Text>
                    <br />
                    {/* <Typography.Text type="secondary" strong>
                      2 Jul 2011
                    </Typography.Text> */}
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Bug Fixing Commit">
                  <div>
                    <Typography.Text keyboard strong>
                      {BFC}
                    </Typography.Text>
                    <br />
                    {/* <Typography.Text type="secondary" strong>
                      24 Sep 2012
                    </Typography.Text> */}
                  </div>
                </Descriptions.Item>
              </Descriptions>
              <Radio.Group defaultValue="a" buttonStyle="solid">
                <Radio.Button value="a">confirmed</Radio.Button>
                <Radio.Button value="b">rejected</Radio.Button>
                <Radio.Button value="c">undecided</Radio.Button>
              </Radio.Group>
            </div>
          ),
        }}
      >
        <div style={{ display: 'flex' }}>
          <div>
            <Card
              bordered={false}
              style={{ marginBottom: 10, width: 286, overflow: 'auto' }}
              tabList={testMethodList}
              activeTabKey={testTabKey}
              onTabChange={(key) => {
                onTestTabChange(key);
              }}
            >
              {contentListNoTitle[testTabKey]}
              {/* <Text keyboard >  </Text>  */}
            </Card>
            <Card title="Changed files" bordered={false} bodyStyle={{ padding: 0 }}>
              <Menu
                title="菜单"
                // onClick={handleMenuClick}
                style={{ width: 286, maxHeight: '60vh', overflow: 'auto' }}
                defaultOpenKeys={['BIC', 'BFC']}
                mode="inline"
              >
                {/* 优先显示test，在有match时显示check然后tooltip上加‘recomend to check’。
                （migrate迁移）*/}
                <SubMenu key="BIC" icon={<AppstoreOutlined />} title="Bug Inducing Commit'">
                  {listBIC.map(({ filename, match, oldPath, newPath, type }) => {
                    let mark: any;
                    if (match === 1 && type !== null && type !== undefined) {
                      mark = (
                        <Tooltip title={'type: ' + type}>
                          <Tag color="success">check</Tag>
                        </Tooltip>
                      );
                    } else if (match === 1) {
                      mark = <Tag color="warning">match</Tag>;
                    } else if (type !== null && type !== undefined) {
                      if (
                        type.toLowerCase() === 'test suite' ||
                        type.toLowerCase() === 'test_suite'
                      ) {
                        mark = <Tag color="processing">TEST</Tag>;
                      } else {
                        mark = <Tag color="processing">{type}</Tag>;
                      }
                    }
                    return (
                      <Menu.Item
                        key={`BIC-${filename}`}
                        onClick={() => handleMenuClick('BIC', filename, oldPath, newPath)}
                      >
                        {mark}
                        {filename}
                      </Menu.Item>
                    );
                  })}
                </SubMenu>
                <SubMenu key="BFC" icon={<AppstoreOutlined />} title="Bug Fixing Commit">
                  {listBFC.map(({ filename, match, oldPath, newPath, type }) => {
                    let mark: any;
                    if (match === 1 && type !== null && type !== undefined) {
                      mark = (
                        <Tooltip title={'type: ' + type}>
                          <Tag color="success">check</Tag>
                        </Tooltip>
                      );
                    } else if (match === 1) {
                      mark = <Tag color="warning">match</Tag>;
                    } else if (type !== null && type !== undefined) {
                      if (
                        type.toLowerCase() === 'test suite' ||
                        type.toLowerCase() === 'test_suite'
                      ) {
                        mark = <Tag color="processing">TEST</Tag>;
                      } else {
                        mark = <Tag color="processing">{type}</Tag>;
                      }
                    }
                    return (
                      <Menu.Item
                        key={`BFC-${filename}`}
                        onClick={() => handleMenuClick('BFC', filename, oldPath, newPath)}
                      >
                        {mark}
                        {filename}
                      </Menu.Item>
                    );
                  })}
                </SubMenu>
              </Menu>
            </Card>
          </div>
          {activeBICKey !== undefined && activeBICKey !== '' && (
            <DiffEditorTabs
              commit="BIC"
              activeKey={activeBICKey}
              onActiveKey={setActiveBICKey}
              panes={panesBIC}
              onPanesChange={setPanesBIC}
              oldVersionText="work"
              newVersionText="bug introduce"
              onRunCode={handleBICRunClick}
              isRunning={BICisRunning}
              console={BICConsoleResult}
            />
          )}
          {activeBFCKey !== undefined && activeBFCKey !== '' && (
            <DiffEditorTabs
              commit="BFC"
              activeKey={activeBFCKey}
              onActiveKey={setActiveBFCKey}
              panes={panesBFC}
              onPanesChange={setPanesBFC}
              oldVersionText="buggy"
              newVersionText="bug fix"
              onRunCode={handleBFCRunClick}
              isRunning={BFCisRunning}
              console={BFCConsoleResult}
            />
          )}
        </div>
      </PageContainer>
    </>
  );
};

export default EditorPage;
