import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaHammer, FaCoins, FaChartLine } from 'react-icons/fa';

const Feature = ({ title, text, icon }: { title: string; text: string; icon: any }) => {
  return (
    <VStack
      p={6}
      bg={useColorModeValue('gray.800', 'gray.700')}
      rounded="lg"
      spacing={4}
      align="start"
    >
      <Icon as={icon} w={10} h={10} color="blue.400" />
      <Heading size="md">{title}</Heading>
      <Text color={useColorModeValue('gray.400', 'gray.300')}>{text}</Text>
    </VStack>
  );
};

const Home = () => {
  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={10}>
        <Box textAlign="center">
          <Heading
            as="h1"
            size="2xl"
            bgGradient="linear(to-r, blue.400, blue.600)"
            bgClip="text"
            mb={4}
          >
            Welcome to Ethermax Mining
          </Heading>
          <Text fontSize="xl" color="gray.400">
            Mine EMAX tokens and earn rewards in the most efficient way
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} w="full">
          <Feature
            icon={FaHammer}
            title="Efficient Mining"
            text="Start mining EMAX tokens with our optimized mining system. Earn rewards based on your mining power."
          />
          <Feature
            icon={FaCoins}
            title="Token Rewards"
            text="Earn EMAX tokens as rewards for your mining efforts. Claim your rewards anytime."
          />
          <Feature
            icon={FaChartLine}
            title="Real-time Stats"
            text="Track your mining power and rewards in real-time. Monitor your progress and earnings."
          />
        </SimpleGrid>

        <Box
          p={8}
          bg={useColorModeValue('gray.800', 'gray.700')}
          rounded="lg"
          w="full"
        >
          <VStack spacing={4} align="start">
            <Heading size="md">Getting Started</Heading>
            <Text color="gray.400">
              1. Connect your wallet using the button in the top right corner
            </Text>
            <Text color="gray.400">
              2. Navigate to the Room page to start mining
            </Text>
            <Text color="gray.400">
              3. Monitor your mining power and rewards
            </Text>
            <Text color="gray.400">
              4. Claim your rewards when you're ready
            </Text>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default Home; 