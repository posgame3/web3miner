import { Box, Container, Flex, Text } from '@chakra-ui/react';

const TokenAddress = () => {
  const neon = {
    blue: '#00E8FF',
    pink: '#FF2E63',
    panel: '#181A20',
  };

  return (
    <Box
      w="full"
      py={2}
      px={6}
      bg={neon.panel}
      borderBottom="2.5px solid"
      borderColor={neon.blue}
      boxShadow="0 0 16px #00E8FF, 0 0 32px #FF00CC55"
      fontFamily="'Press Start 2P', monospace"
      position="relative"
      _before={{
        content: '""',
        position: 'absolute',
        inset: 0,
        boxShadow: "0 0 32px 4px #00E8FF, 0 0 64px 8px #FF00CC55",
        pointerEvents: "none",
        opacity: 0.5,
        zIndex: 0,
      }}
    >
      <Container maxW="container.xl" position="relative" zIndex={2}>
        <Flex justify="center" align="center" gap={2}>
          <Text
            color={neon.blue}
            fontWeight="bold"
            fontSize="xs"
            letterSpacing={1}
            textShadow="0 0 8px #00E8FF"
          >
            TOKEN:
          </Text>
          <Text
            fontSize="xs"
            color="white"
            fontFamily="monospace"
            letterSpacing={0.5}
          >
            Coming Soon
          </Text>
        </Flex>
      </Container>
    </Box>
  );
};

export default TokenAddress; 