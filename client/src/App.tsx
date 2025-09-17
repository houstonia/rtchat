import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { SocketProvider } from './contexts/ChatContext';
import { Chat } from './pages/Chat';
import Login from './pages/Login';

import './App.css';

function App() {
  return (
    <SocketProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </BrowserRouter>
    </SocketProvider>
  );
}

export default App;
