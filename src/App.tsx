import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider, Box } from '@chakra-ui/react';
import Navbar from './components/Navbar';
import Room from './pages/Room';
import Mining from './pages/Mining';
import Home from './pages/Home';
import Stake from './pages/Stake';

function App() {
  return (
    <ChakraProvider>
      <Router>
        <Box minH="100vh" bg="gray.900" color="white">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/room" element={<Room />} />
            <Route path="/mining" element={<Mining />} />
            <Route path="/stake" element={<Stake />} />
          </Routes>
        </Box>
      </Router>
    </ChakraProvider>
  );
}

export default App; 