import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider, Box } from '@chakra-ui/react';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Room from './pages/Room';
import Mining from './pages/Mining';
import Home from './pages/Home';
import Stake from './pages/Stake';
import Referral from './pages/Referral';

function App() {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refAddress = urlParams.get('ref');
    
    if (refAddress) {
      localStorage.setItem('referrer', refAddress);
    }
  }, []);

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
            <Route path="/referral" element={<Referral />} />
          </Routes>
        </Box>
      </Router>
    </ChakraProvider>
  );
}

export default App; 