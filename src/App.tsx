import React from 'react';
import { Layout } from 'antd';
import DrawingSpace from './components/DrawingSpace';

const { Header, Content, Footer } = Layout;

function App() : React.ReactElement {
  return (
    <Layout style={{minHeight: "100vh"}}>
      <Header style={{display: "flex", alignItems: "center"}}>
        <img src="/logo.svg" height="48" style={{paddingRight: "24px"}} alt="Montagsmaler Logo" />
        <div style={{color: "white", fontSize: '24px'}}>Montagsmaler</div>
      </Header>
      <Content style={{padding: '12px 48px'}}>
        <div style={{padding: '12px', backgroundColor: 'white'}}>
          <DrawingSpace />
        </div>
      </Content>
      <Footer>
        Montagsmaler ©2021 Created by Tobias Ganzhorn
      </Footer>
    </Layout>
    
  );
}

export default App;
