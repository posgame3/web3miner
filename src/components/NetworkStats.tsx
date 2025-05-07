import { Box, VStack, Text, HStack } from '@chakra-ui/react';
import { useAccount, useContractRead } from 'wagmi';
import { MINING_ADDRESS, MINING_ABI, ETHERMAX_ADDRESS, ETHERMAX_ABI } from '../config/contracts';
import { formatEther } from 'viem';
import { motion, AnimatePresence } from 'framer-motion';

const MotionText = motion(Text);

const NetworkStats = () => {
  const { address } = useAccount();

  const neon = {
    blue: '#00f3ff',
    pink: '#ff00ff',
    purple: '#9d00ff',
    green: '#00ff9d'
  };

  // Total network hashrate
  const { data: totalHashrate } = useContractRead({
    address: MINING_ADDRESS,
    abi: MINING_ABI,
    functionName: 'totalHashrate',
  });

  // Total burned
  const { data: totalBurned } = useContractRead({
    address: ETHERMAX_ADDRESS,
    abi: ETHERMAX_ABI,
    functionName: 'amtBurned',
  });

  // Next halving
  const { data: blocksUntilNextHalving } = useContractRead({
    address: MINING_ADDRESS,
    abi: MINING_ABI,
    functionName: 'blocksUntilNextHalving',
  });

  const timeUntilNextHalving = blocksUntilNextHalving ? Number(blocksUntilNextHalving) * 12 : 0;

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <Box
      p={6}
      borderRadius="lg"
      bg="gray.800"
      borderWidth="1px"
      borderColor="gray.700"
      boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
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
          borderRadius: 'lg',
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
          borderRadius: 'lg',
          background: `linear-gradient(45deg, ${neon.blue}44, ${neon.purple}44)`,
          zIndex: -1,
          filter: 'blur(8px)',
          opacity: 0.5
        }
      }}
    >
      <VStack spacing={4} align="stretch" position="relative" zIndex={2}>
        <HStack justify="space-between">
          <Text 
            fontSize="xl" 
            fontWeight="bold" 
            color={neon.blue}
            sx={{
              textShadow: `0 0 10px ${neon.blue}88, 0 0 20px ${neon.blue}44`
            }}
          >
            Network Stats
          </Text>
        </HStack>

        <Box>
          <HStack justify="space-between" mb={2}>
            <Text color="gray.400">Next Halving</Text>
            <AnimatePresence mode="wait">
              <MotionText
                key={blocksUntilNextHalving?.toString()}
                color={neon.green}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                sx={{
                  textShadow: `0 0 10px ${neon.green}88, 0 0 20px ${neon.green}44`
                }}
              >
                {typeof blocksUntilNextHalving === 'bigint' 
                  ? `${blocksUntilNextHalving.toString()} BLOCKS`
                  : '...'}
              </MotionText>
            </AnimatePresence>
          </HStack>
        </Box>

        <Box>
          <HStack justify="space-between" mb={2}>
            <Text color="gray.400">Total Network Hashrate</Text>
            <AnimatePresence mode="wait">
              <MotionText
                key={totalHashrate?.toString()}
                color={neon.pink}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                sx={{
                  textShadow: `0 0 10px ${neon.pink}88, 0 0 20px ${neon.pink}44`
                }}
              >
                {totalHashrate?.toString() ?? '...'} GH/s
              </MotionText>
            </AnimatePresence>
          </HStack>
        </Box>

        <Box>
          <HStack justify="space-between" mb={2}>
            <Text color="gray.400">Total Burned</Text>
            <AnimatePresence mode="wait">
              <MotionText
                key={totalBurned?.toString()}
                color={neon.purple}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                sx={{
                  textShadow: `0 0 10px ${neon.purple}88, 0 0 20px ${neon.purple}44`
                }}
              >
                {typeof totalBurned === 'bigint' ? formatEther(totalBurned) : '0'} MAXX
              </MotionText>
            </AnimatePresence>
          </HStack>
        </Box>

        <Box>
          <HStack justify="space-between" mb={2}>
            <Text color="gray.400">Block Reward</Text>
            <Text 
              color={neon.blue}
              sx={{
                textShadow: `0 0 10px ${neon.blue}88, 0 0 20px ${neon.blue}44`
              }}
            >
              50 MAXX
            </Text>
          </HStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default NetworkStats; 