import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider, Box } from '@chakra-ui/react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Room from './pages/Room';
import Mining from './pages/Mining';

function App() {
  return (
    <ChakraProvider>
      <Router>
        <Box minH="100vh" bg="gray.900" color="white">
          <Navbar />
          <Box maxW="1200px" mx="auto" px={4} py={8}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/room" element={<Room />} />
              <Route path="/mining" element={<Mining />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ChakraProvider>
  );
}

export default App; 