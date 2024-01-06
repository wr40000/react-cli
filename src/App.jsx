import React, { Suspense, lazy } from "react";
import { Link, Routes, Route } from "react-router-dom";
import { ConfigProvider, Button, Space, Input } from "antd";
// import Home from "./pages/Home";
// import About from "./pages/About";

const Home = lazy(() => import(/* webpackChunkName: 'home' */ "./pages/Home"));
const About = lazy(() => import(/* webpackChunkName: 'about' */ "./pages/About"));

function App() {
  return (
    <div>
      <ConfigProvider
      theme={{
        components: {
          Button: {
            colorPrimary: '#000000',
            algorithm: true, // 启用算法
          },
          Input: {
            colorPrimary: '#eb2f96',
            algorithm: true, // 启用算法
          }
        },
      }}
    >
      <Space>
        <div style={{ fontSize: 14 }}>开启算法：</div>
        <Input placeholder="Please Input~" />
        <Button type="primary">Submit</Button>
      </Space>
    </ConfigProvider>
      <h1>App</h1>
      <Button type="primary">按钮</Button>
      <ul>
        <li>
          <Link to="/home">Home</Link>
        </li>
        <li>
          <Link to="/about">About</Link>
        </li>
      </ul>
      <Suspense fallback={<div>loading...</div>}>
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
