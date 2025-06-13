import {
  Box,
  VStack,
  Heading,
  Text,
  SimpleGrid,
  Icon,
  Container,
  Button,
  useColorModeValue,
  Flex,
  Link,
  Image,
} from '@chakra-ui/react';
import { FaDiscord, FaTwitter, FaGithub } from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';

const Home = () => {
  const neon = {
    blue: '#00E8FF',
    pink: '#FF2E63',
    purple: '#B026FF',
    green: '#00FF9D',
    panel: '#181A20',
    text: '#FFFFFF',
    border: '#2D3748'
  };

  const Feature = ({ title, text }: { title: string; text: string }) => {
    return (
      <Box
        p={6}
        bg={neon.panel}
        borderRadius="lg"
        border="2px solid"
        borderColor={neon.blue}
        boxShadow={`0 0 16px ${neon.blue}44`}
        _hover={{
          transform: 'translateY(-5px)',
          boxShadow: `0 0 20px ${neon.blue}88`,
        }}
        transition="all 0.3s ease"
      >
        <Heading size="md" mb={4} color={neon.blue}>
          {title}
        </Heading>
        <Text color="gray.300">{text}</Text>
      </Box>
    );
  };

  return (
    <Box 
      minH="100vh" 
      position="relative"
      overflow="hidden"
      sx={{
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, #0A0B0E 0%, #1A1B1F 100%)',
          zIndex: 0
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 50% 50%, ${neon.blue}11 0%, transparent 50%)`,
          zIndex: 1,
          pointerEvents: 'none',
          animation: 'pulse 4s infinite ease-in-out'
        }
      }}
    >
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 0.5; }
            50% { opacity: 0.8; }
            100% { opacity: 0.5; }
          }
        `}
      </style>
      <Container maxW="container.xl" position="relative" zIndex={2} py={20}>
        {/* Hero Section */}
        <VStack spacing={8} mb={20} textAlign="center">
          <Box
            position="relative"
            w="300px"
            h="300px"
            mb={8}
            _hover={{
              transform: 'scale(1.05)',
              filter: 'brightness(1.2)',
            }}
            transition="all 0.3s ease"
            sx={{
              '&::after': {
                content: '""',
                position: 'absolute',
                top: '-10px',
                left: '-10px',
                right: '-10px',
                bottom: '-10px',
                borderRadius: 'full',
                background: `linear-gradient(45deg, ${neon.blue}44, ${neon.purple}44)`,
                filter: 'blur(20px)',
                zIndex: -1,
                opacity: 0.5,
                animation: 'pulse 4s infinite ease-in-out'
              }
            }}
          >
            <Image
              src="/pixelminer.png"
              alt="PixelMiner Logo"
              w="100%"
              h="100%"
              objectFit="contain"
              filter="drop-shadow(0 0 20px rgba(0, 232, 255, 0.5))"
            />
          </Box>
          <Heading
            size="2xl"
            bgGradient={`linear(to-r, ${neon.blue}, ${neon.purple})`}
            bgClip="text"
            fontWeight="extrabold"
            letterSpacing="tight"
            sx={{
              textShadow: `0 0 20px ${neon.blue}44`
            }}
          >
            PIXELMINER
          </Heading>
          <Text fontSize="xl" color="gray.300" maxW="2xl">
            Build your mining empire, earn PXL tokens, and become a part of the future of decentralized gaming.
          </Text>
          <Flex gap={4}>
            <Button
              as={RouterLink}
              to="/room"
              size="lg"
              bg={neon.blue}
              color="white"
              _hover={{
                bg: neon.pink,
                boxShadow: `0 0 16px ${neon.pink}88`
              }}
              sx={{
                animation: 'glow 2s infinite alternate'
              }}
            >
              Start Mining
            </Button>
            <Button
              as="a"
              href="https://pixelminer.gitbook.io/pixelminer-docs-1/"
              target="_blank"
              size="lg"
              variant="outline"
              borderColor={neon.blue}
              color={neon.blue}
              _hover={{
                bg: `${neon.blue}22`,
                borderColor: neon.pink,
                color: neon.pink
              }}
            >
              Read Docs
            </Button>
          </Flex>
        </VStack>

        {/* Features Section */}
        <VStack spacing={12} mb={20}>
          <Heading color={neon.blue}>Key Features</Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8} w="full">
            <Feature
              title="Play-to-Earn Gaming"
              text="Build and manage your own mining facilities, purchase and upgrade miners, and earn PXL tokens through active gameplay."
            />
            <Feature
              title="Token Economy"
              text="PXL token as the primary in-game currency with real-time mining rewards and staking opportunities for passive income."
            />
            <Feature
              title="Technical Innovation"
              text="Built on Base L2 for low gas fees, with smart contract-based mining operations and transparent reward systems."
            />
          </SimpleGrid>
        </VStack>

        {/* Getting Started Section */}
        <VStack spacing={8} mb={20}>
          <Heading color={neon.blue}>Getting Started</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} w="full">
            <Box
              p={6}
              bg={neon.panel}
              borderRadius="lg"
              border="2px solid"
              borderColor={neon.blue}
              boxShadow={`0 0 16px ${neon.blue}22`}
              _hover={{
                boxShadow: `0 0 20px ${neon.blue}88`,
                transform: 'translateY(-5px)',
              }}
              transition="all 0.3s ease"
            >
              <VStack align="start" spacing={4}>
                <Heading size="md" color={neon.blue}>1. Connect Your Wallet</Heading>
                <Text color="gray.300">Connect your Web3 wallet to start your mining journey.</Text>
              </VStack>
            </Box>
            <Box
              p={6}
              bg={neon.panel}
              borderRadius="lg"
              border="2px solid"
              borderColor={neon.blue}
              boxShadow={`0 0 16px ${neon.blue}22`}
              _hover={{
                boxShadow: `0 0 20px ${neon.blue}88`,
                transform: 'translateY(-5px)',
              }}
              transition="all 0.3s ease"
            >
              <VStack align="start" spacing={4}>
                <Heading size="md" color={neon.blue}>2. Buy Your First Miner</Heading>
                <Text color="gray.300">Purchase your first mining facility and start earning PXL tokens.</Text>
              </VStack>
            </Box>
            <Box
              p={6}
              bg={neon.panel}
              borderRadius="lg"
              border="2px solid"
              borderColor={neon.blue}
              boxShadow={`0 0 16px ${neon.blue}22`}
              _hover={{
                boxShadow: `0 0 20px ${neon.blue}88`,
                transform: 'translateY(-5px)',
              }}
              transition="all 0.3s ease"
            >
              <VStack align="start" spacing={4}>
                <Heading size="md" color={neon.blue}>3. Start Mining</Heading>
                <Text color="gray.300">Your miners will automatically start producing PXL tokens.</Text>
              </VStack>
            </Box>
            <Box
              p={6}
              bg={neon.panel}
              borderRadius="lg"
              border="2px solid"
              borderColor={neon.blue}
              boxShadow={`0 0 16px ${neon.blue}22`}
              _hover={{
                boxShadow: `0 0 20px ${neon.blue}88`,
                transform: 'translateY(-5px)',
              }}
              transition="all 0.3s ease"
            >
              <VStack align="start" spacing={4}>
                <Heading size="md" color={neon.blue}>4. Upgrade & Expand</Heading>
                <Text color="gray.300">Upgrade your facilities and expand your mining operation.</Text>
              </VStack>
            </Box>
          </SimpleGrid>
        </VStack>

        {/* Free Miner Info Box */}
        <Box
          p={6}
          bg={neon.panel}
          borderRadius="lg"
          border="2px solid"
          borderColor={neon.blue}
          boxShadow={`0 0 16px ${neon.blue}22`}
          mb={20}
          _hover={{
            boxShadow: `0 0 20px ${neon.blue}88`,
            transform: 'translateY(-5px)',
          }}
          transition="all 0.3s ease"
        >
          <VStack align="start" spacing={4}>
            <Heading size="md" color={neon.blue}>FREE MINER INCLUDED!</Heading>
            <Text color="gray.300">After purchasing a facility, you'll receive a free starter miner that will automatically mine tokens for you, with no additional costs.</Text>
          </VStack>
        </Box>

        {/* Community Section */}
        <VStack spacing={8}>
          <Heading color={neon.blue}>Join Our Community</Heading>
          <Flex gap={4} justify="center" mt={8}>
            <Link
              href="https://discord.gg/pixelminer"
              isExternal
              _hover={{ transform: 'scale(1.1)' }}
              transition="all 0.2s"
            >
              <Icon as={FaDiscord} w={8} h={8} color={neon.blue} />
            </Link>
            <Link
              href="https://x.com/pixelminerfun"
              isExternal
              _hover={{ transform: 'scale(1.1)' }}
              transition="all 0.2s"
            >
              <Icon as={FaTwitter} w={8} h={8} color={neon.blue} />
            </Link>
            <Link
              href="https://github.com/posgame3/web3miner"
              isExternal
              _hover={{ transform: 'scale(1.1)' }}
              transition="all 0.2s"
            >
              <Icon as={FaGithub} w={8} h={8} color={neon.blue} />
            </Link>
          </Flex>
        </VStack>
      </Container>
    </Box>
  );
};

export default Home; 