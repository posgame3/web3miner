import { Box, Container, Flex, Text, IconButton, useToast } from '@chakra-ui/react';
import { CopyIcon } from '@chakra-ui/icons';

const TokenAddress = () => {
  const toast = useToast();
  const neon = {
    blue: '#00E8FF',
    pink: '#FF2E63',
    panel: '#181A20',
  };

  const tokenAddress = "0x37d2f0921e4bA6a316118159c218e56F35a9dC06";

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(tokenAddress);
      toast({
        title: "Adres skopiowany!",
        description: "Adres tokenu został skopiowany do schowka",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Błąd kopiowania",
        description: "Nie udało się skopiować adresu",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
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
            ETHERMAX TOKEN:
          </Text>
          <Text
            fontSize="xs"
            color="white"
            fontFamily="monospace"
            letterSpacing={0.5}
            cursor="pointer"
            _hover={{ color: neon.blue }}
            onClick={copyToClipboard}
          >
            {tokenAddress}
          </Text>
          <IconButton
            aria-label="Kopiuj adres"
            icon={<CopyIcon />}
            size="xs"
            variant="ghost"
            color={neon.blue}
            _hover={{ 
              bg: 'transparent',
              color: neon.pink,
              transform: 'scale(1.1)'
            }}
            onClick={copyToClipboard}
            transition="all 0.2s"
          />
        </Flex>
      </Container>
    </Box>
  );
};

export default TokenAddress; 