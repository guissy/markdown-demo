import { Button, Tabs } from 'antd';
import { connect } from 'dva';
import * as hightLight from 'highlight.js';
import * as React from 'react';
// tslint:disable-next-line
import * as ReactMarkdown from 'react-markdown';
import * as Remarkable from 'remarkable';
import * as styles from './Markdown.less';

@connect(({ login, lang }) => ({ login, site: lang.site }))
export default class Markdown extends React.PureComponent<MarkdownProps, any> {
  private codes: NodeListOf<HTMLElement>;

  constructor(props: MarkdownProps) {
    super(props);
    this.state = {
      md: '# loading...',
    };
    const url = '/assets/node-style-guide.md';
    fetch(url).then(v => v.text()).then((v: string) => {
      this.setState({ md: v });
    });
  }

  public createMarkup1(md: string) {
    const marked = require('marked');
    marked.setOptions({
      renderer: new marked.Renderer(),
      gfm: true,
      tables: true,
      breaks: false,
      pedantic: false,
      sanitize: false,
      smartLists: true,
      smartypants: false,
      highlight: (code) => hightLight.highlightAuto(code).value,
    });
    return { __html: marked(md) };
  }

  public createMarkup2(md: string) {
    // tslint:disable-next-line
    const remark = new Remarkable();
    return { __html: remark.render(md) };
  }

  public createMarkup3(md: string) {
    // tslint:disable-next-line
    var mdit = require('markdown-it')();
    return { __html: mdit.render(md) };
  }

  public onCopy(text: string) {
    const textArea = document.createElement('textarea');
    try {
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      const successful = document.execCommand('copy');
      if (successful) {
        this.props.dispatch({ type: 'alerts/show', payload: { type: 'success', message: '复制成功' } });
      } else {
        this.props.dispatch({ type: 'alerts/show', payload: { type: 'fail', message: '复制失败' } });
      }
    } catch (err) {
      this.props.dispatch({ type: 'alerts/show', payload: { type: 'fail', message: '复制失败' } });
    } finally {
      document.body.removeChild(textArea);
    }
  }

  public componentDidUpdate(prevProps: Readonly<MarkdownProps>, prevState: Readonly<any>, prevContext: any): void {
    this.codes = document.querySelectorAll('code[class*="lang-"]') as any;
  }

  public render() {
    return (
      <div className={styles.markdownBox}>
        <div className={styles.btns}>
          <Button onClick={() => this.onCopy(this.codes[0].innerText)}>复制code1</Button>
          <Button onClick={() => this.onCopy(this.codes[1].innerText)}>复制code2</Button>
          <Button onClick={() => this.onCopy(this.codes[2].innerText)}>复制code3</Button>
        </div>
        <Tabs>
          <Tabs.TabPane tab="marked" key="1">
            <div className={styles.mdBox}>
              <div dangerouslySetInnerHTML={this.createMarkup1(this.state.md)}/>
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane tab="remarkable" key="2">
            <div className={styles.mdBox}>
              <div dangerouslySetInnerHTML={this.createMarkup2(this.state.md)}/>
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane tab="markdown-it" key="3">
            <div className={styles.mdBox}>
              <div dangerouslySetInnerHTML={this.createMarkup3(this.state.md)}/>
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane tab="react-markdown" key="4">
            <div className={styles.mdBox}>
              <ReactMarkdown source={this.state.md}/>
            </div>
          </Tabs.TabPane>
        </Tabs>
      </div>
    );
  }
}

interface MarkdownProps {
  dispatch: any;
}
