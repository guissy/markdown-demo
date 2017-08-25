import { Button, Card, Form, Input, Layout } from 'antd';
import { WrappedFormUtils } from 'antd/es/form/Form';
import { connect } from 'dva';
import * as React from 'react';
import { LangSiteState } from '../lang.model';
import * as styles from './Login.less';
import { LoginState } from './Login.model';

const { Header, Footer, Content } = Layout;

@connect(({ login, lang }) => ({ login, site: lang.site }))
@Form.create()
export default class Login extends React.PureComponent<LoginProps, any> {
  constructor(props) {
    super(props);
    this.state = {};
  }
  public render() {
    const { getFieldDecorator } = this.props.form;
    const { site } = this.props;
    const formItemLayout = { span: 14 };
    const tailFormItemLayout = { span: 14, offset: 6 };
    return (
      <Layout className={styles.page}>
        <Header>后台管理系统</Header>
        <Content>
          <Card
            className="animated zoomIn"
            title="登录后台管理系统"
            bordered={false}
          >
            <Form onSubmit={this.onSubmit}>
              <Form.Item label={site.用户名} {...formItemLayout}>
                {getFieldDecorator('username', {
                  initialValue: '',
                  rules: [{ required: true, message: site.请输入您的用户名 }],
                })(<Input />)}
              </Form.Item>
              <Form.Item label={site.密码} {...formItemLayout}>
                {getFieldDecorator('password', {
                  initialValue: '',
                  rules: [{ required: true, message: site.请输入您的密码 }],
                })(<Input type="password" />)}
              </Form.Item>
              <Form.Item {...tailFormItemLayout}>
                <Button type="primary" htmlType="submit" size="large">登录</Button>
              </Form.Item>
            </Form>
          </Card>
        </Content>
        <Footer/>
      </Layout>
    );
  }

  private onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    this.props.form.validateFields((err, fieldsValue) => {
      if (err) {
        return;
      }
      this.props.dispatch({ type: 'login/login', payload: fieldsValue });
    });
  }
}

export interface LoginProps extends ReduxProps, LangSiteState {
  login?: LoginState;
  form: WrappedFormUtils;
}
