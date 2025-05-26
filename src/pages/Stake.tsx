import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Container,
  useColorModeValue,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { Link as RouterLink } from 'react-router-dom';

const Stake = () => {
  const neon = {
    blue: '#00E8FF',
    pink: '#FF2E63',
    purple: '#B026FF',
    green: '#00FF9D',
    panel: '#181A20',
    text: '#FFFFFF',
    border: '#2D3748'
  };

  // Animation for the loading circle
  const spin = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  `;

  // Animation for the pulsing effect
  const pulse = keyframes`
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.1); opacity: 0.7; }
    100% { transform: scale(1); opacity: 1; }
  `;

  return (
    <Box bg="gray.900" minH="100vh" py={20}>
      <Container maxW="container.xl">
        <VStack spacing={12} align="center" justify="center" minH="60vh">
          {/* Loading Animation */}
          <Box
            position="relative"
            w="200px"
            h="200px"
            animation={`${spin} 3s linear infinite`}
          >
            <Box
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              w="180px"
              h="180px"
              borderRadius="full"
              border="4px solid"
              borderColor={`${neon.blue}44`}
              _before={{
                content: '""',
                position: 'absolute',
                top: '-4px',
                left: '-4px',
                right: '-4px',
                bottom: '-4px',
                borderRadius: 'full',
                border: '4px solid',
                borderColor: neon.blue,
                borderTopColor: 'transparent',
                animation: `${spin} 2s linear infinite`,
              }}
            />
            <Box
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              w="140px"
              h="140px"
              borderRadius="full"
              border="4px solid"
              borderColor={`${neon.purple}44`}
              _before={{
                content: '""',
                position: 'absolute',
                top: '-4px',
                left: '-4px',
                right: '-4px',
                bottom: '-4px',
                borderRadius: 'full',
                border: '4px solid',
                borderColor: neon.purple,
                borderTopColor: 'transparent',
                animation: `${spin} 1.5s linear infinite reverse`,
              }}
            />
            <Box
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              w="100px"
              h="100px"
              borderRadius="full"
              border="4px solid"
              borderColor={`${neon.pink}44`}
              _before={{
                content: '""',
                position: 'absolute',
                top: '-4px',
                left: '-4px',
                right: '-4px',
                bottom: '-4px',
                borderRadius: 'full',
                border: '4px solid',
                borderColor: neon.pink,
                borderTopColor: 'transparent',
                animation: `${spin} 1s linear infinite`,
              }}
            />
          </Box>

          {/* Coming Soon Text */}
          <VStack spacing={6} textAlign="center">
            <Heading
              size="2xl"
              bgGradient={`linear(to-r, ${neon.blue}, ${neon.purple})`}
              bgClip="text"
              fontWeight="extrabold"
              animation={`${pulse} 2s ease-in-out infinite`}
            >
              Staking Coming Soon
            </Heading>
            <Text fontSize="xl" color="gray.300" maxW="2xl">
              We're working hard to bring you the best staking experience. Stay tuned for updates!
            </Text>
          </VStack>

          {/* Return Button */}
          <Button
            as={RouterLink}
            to="/"
            size="lg"
            bg={neon.blue}
            color="white"
            _hover={{
              bg: neon.pink,
              boxShadow: `0 0 16px ${neon.pink}88`
            }}
            px={8}
            py={6}
            borderRadius="md"
            border="2px solid"
            borderColor={neon.blue}
            _active={{
              transform: 'scale(0.95)',
            }}
            sx={{
              textShadow: `0 0 10px ${neon.blue}88, 0 0 20px ${neon.blue}44`
            }}
          >
            Return to Home
          </Button>
        </VStack>
      </Container>
    </Box>
  );
};

export default Stake; 