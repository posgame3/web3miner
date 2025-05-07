import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress,
  Grid,
  Divider,
} from '@chakra-ui/react';
import { useAccount, useContractRead, useContractWrite } from 'wagmi';
import { useWaitForTransactionReceipt } from 'wagmi';
import { formatEther } from 'viem';
import { MINING_ADDRESS, MINING_ABI } from '../config/contracts';

const Mining = () => {
  const { address, isConnected } = useAccount();
  const toast = useToast();

  // Contract reads
  const { data: totalMiningPower } = useContractRead({
    address: MINING_ADDRESS as `0x${string}`,
    abi: MINING_ABI,
    functionName: 'getTotalMiningPower',
    query: {
      enabled: isConnected,
    },
  });

  const { data: userMiningPower } = useContractRead({
    address: MINING_ADDRESS as `0x${string}`,
    abi: MINING_ABI,
    functionName: 'getUserMiningPower',
    args: [address],
    query: {
      enabled: isConnected,
    },
  });

  const { data: miningEfficiency } = useContractRead({
    address: MINING_ADDRESS as `0x${string}`,
    abi: MINING_ABI,
    functionName: 'getMiningEfficiency',
    args: [address],
    query: {
      enabled: isConnected,
    },
  });

  // Contract writes
  const { writeContract: upgradeMining, data: upgradeData } = useContractWrite({
    abi: MINING_ABI,
    functionName: 'upgradeMining',
  });

  const { isLoading: isUpgrading } = useWaitForTransactionReceipt({
    hash: upgradeData,
  });

  const handleUpgrade = async () => {
    try {
      console.log('Upgrade mining: start', { address });
      const tx = await upgradeMining?.({
        address: MINING_ADDRESS as `0x${string}`,
        abi: MINING_ABI,
        functionName: 'upgradeMining',
      });
      console.log('Upgrade mining: tx sent', tx);
      toast({
        title: 'Mining upgraded',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error('Upgrade mining: error', error);
      toast({
        title: 'Error upgrading mining',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (!isConnected) {
    return (
      <Box textAlign="center" py={10}>
        <Text fontSize="xl">Please connect your wallet to view mining stats</Text>
      </Box>
    );
  }

  const userPower = userMiningPower ? Number(formatEther(userMiningPower)) : 0;
  const totalPower = totalMiningPower ? Number(formatEther(totalMiningPower)) : 0;
  const efficiency = miningEfficiency ? Number(miningEfficiency) / 100 : 0;
  const powerPercentage = totalPower > 0 ? (userPower / totalPower) * 100 : 0;

  return (
    <Box bg="#181A20" minH="100vh" py={10} px={[2, 10]} fontFamily="'Press Start 2P', monospace">
      <Grid templateColumns={["1fr", null, "1fr 1fr"]} gap={8} maxW="1200px" mx="auto">
        <VStack spacing={6} align="stretch">
          <Box p={6} bg="#23272F" borderRadius="md" border="2px solid #00E8FF" boxShadow="0 0 8px #00E8FF55">
            <Stat>
              <StatLabel color="#00E8FF">Your Mining Power</StatLabel>
              <StatNumber color="#fff">{userPower.toFixed(2)} EMAX</StatNumber>
              <StatHelpText color="#888">Your contribution to the network</StatHelpText>
            </Stat>
            <Progress
              value={powerPercentage}
              size="sm"
              colorScheme="cyan"
              mt={4}
              borderRadius="full"
            />
            <Text fontSize="sm" color="#00E8FF" mt={2}>
              {powerPercentage.toFixed(2)}% of total network power
            </Text>
          </Box>

          <Box p={6} bg="#23272F" borderRadius="md" border="2px solid #00E8FF" boxShadow="0 0 8px #00E8FF55">
            <Stat>
              <StatLabel color="#00E8FF">Mining Efficiency</StatLabel>
              <StatNumber color="#fff">{(efficiency * 100).toFixed(2)}%</StatNumber>
              <StatHelpText color="#888">Your mining efficiency rate</StatHelpText>
            </Stat>
          </Box>
        </VStack>

        <VStack spacing={6} align="stretch">
          <Box p={6} bg="#23272F" borderRadius="md" border="2px solid #00E8FF" boxShadow="0 0 8px #00E8FF55">
            <VStack spacing={4}>
              <Text fontSize="lg" fontWeight="bold" color="#00E8FF">
                Mining Upgrades
              </Text>
              <Text color="#888">
                Upgrade your mining equipment to increase your mining power and efficiency.
              </Text>
              <Button
                colorScheme="cyan"
                variant="outline"
                borderColor="#00E8FF"
                color="#00E8FF"
                _hover={{ bg: '#00E8FF22' }}
                onClick={handleUpgrade}
                isLoading={isUpgrading}
                loadingText="Upgrading..."
                fontFamily="'Press Start 2P', monospace"
              >
                Upgrade Mining
              </Button>
            </VStack>
          </Box>

          <Box p={6} bg="#23272F" borderRadius="md" border="2px solid #00E8FF" boxShadow="0 0 8px #00E8FF55">
            <VStack spacing={4}>
              <Text fontSize="lg" fontWeight="bold" color="#00E8FF">
                Network Stats
              </Text>
              <Stat>
                <StatLabel color="#00E8FF">Total Network Power</StatLabel>
                <StatNumber color="#fff">{totalPower.toFixed(2)} EMAX</StatNumber>
                <StatHelpText color="#888">Combined mining power of all miners</StatHelpText>
              </Stat>
            </VStack>
          </Box>
        </VStack>
      </Grid>
    </Box>
  );
};

export default Mining; 