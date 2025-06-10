import React from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  useColorModeValue,
  Container,
  Flex,
} from '@chakra-ui/react';
import ReferralSystem from '../components/ReferralSystem';

const Referral = () => {
  const neon = {
    blue: '#00E8FF',
    pink: '#FF2E63',
    purple: '#B026FF',
    green: '#00FF9D',
    panel: '#181A20',
    text: '#FFFFFF',
    border: '#2D3748'
  };

  return (
    <Box
      minH="100vh"
      bg={neon.panel}
      position="relative"
      overflow="hidden"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `linear-gradient(45deg, ${neon.blue}22, ${neon.purple}22)`,
        zIndex: 0
      }}
      sx={{
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          border: '1px solid',
          borderColor: `${neon.blue}44`,
          boxShadow: `0 0 10px ${neon.blue}44, 0 0 20px ${neon.blue}22`,
          zIndex: 1,
          pointerEvents: 'none'
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -1,
          left: -1,
          right: -1,
          bottom: -1,
          background: `linear-gradient(45deg, ${neon.blue}44, ${neon.purple}44)`,
          zIndex: -1,
          filter: 'blur(8px)',
          opacity: 0.5
        }
      }}
    >
      <Container maxW="container.xl" py={10} position="relative" zIndex={2}>
        <VStack spacing={8}>
          <Heading
            as="h1"
            size="2xl"
            bgGradient={`linear(to-r, ${neon.blue}, ${neon.pink})`}
            bgClip="text"
            textAlign="center"
            fontFamily="'Press Start 2P', monospace"
            sx={{
              textShadow: `0 0 10px ${neon.blue}88, 0 0 20px ${neon.blue}44`
            }}
          >
            REFERRAL PROGRAM
          </Heading>

          <Text
            color={neon.text}
            fontSize="lg"
            textAlign="center"
            maxW="800px"
            fontFamily="'Press Start 2P', monospace"
            sx={{
              textShadow: `0 0 10px ${neon.blue}88, 0 0 20px ${neon.blue}44`
            }}
          >
            Invite friends to join PIXELMINER and earn rewards from their mining activities
          </Text>

          <Box
            w="full"
            p={6}
            borderRadius="lg"
            border="2px solid"
            borderColor={neon.blue}
            bg={neon.panel}
            boxShadow={`0 0 16px ${neon.blue}, 0 0 32px ${neon.purple}55`}
            position="relative"
            _before={{
              content: '""',
              position: 'absolute',
              inset: 0,
              borderRadius: "lg",
              boxShadow: `0 0 32px 4px ${neon.blue}, 0 0 64px 8px ${neon.purple}55`,
              pointerEvents: "none",
              opacity: 0.5,
              zIndex: 0,
            }}
          >
            <ReferralSystem />
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default Referral; 