import { Box, VStack, Text, HStack, Button, Progress } from '@chakra-ui/react';
import { useAccount, useContractRead, useContractWrite } from 'wagmi';
import { MINING_ADDRESS, MINING_ABI } from '../config/contracts';
import { formatEther } from 'viem';
import { motion, AnimatePresence } from 'framer-motion';

const MotionProgress = motion(Progress);
const MotionText = motion(Text);

const MiningRig = () => {
  const { address } = useAccount();

  const neon = {
    blue: '#00f3ff',
    pink: '#ff00ff',
    purple: '#9d00ff',
    green: '#00ff9d'
  };

  // Dynamiczne pobieranie danych co 10 sekund
  const { data: hashRate } = useContractRead({
    address: MINING_ADDRESS as `0x${string}`,
    abi: MINING_ABI,
    functionName: 'playerHashrate',
    args: [address],
    query: { refetchInterval: 10000 },
  });
  const { data: totalHashrate } = useContractRead({
    address: MINING_ADDRESS as `0x${string}`,
    abi: MINING_ABI,
    functionName: 'totalHashrate',
    query: { refetchInterval: 10000 },
  });
  const { data: rewardPerBlock } = useContractRead({
    address: MINING_ADDRESS as `0x${string}`,
    abi: MINING_ABI,
    functionName: 'getEthermaxPerBlock',
    query: { refetchInterval: 10000 },
  });
  // You have mined
  const { data: mined } = useContractRead({
    address: MINING_ADDRESS as `0x${string}`,
    abi: MINING_ABI,
    functionName: 'getUserMined',
    args: [address],
  });

  // Pending rewards to claim
  const { data: pendingRewards } = useContractRead({
    address: MINING_ADDRESS as `0x${string}`,
    abi: MINING_ABI,
    functionName: 'pendingRewards',
    args: [address],
    query: { refetchInterval: 10000 },
  });

  // useContractWrite v2
  const { writeContract, isPending } = useContractWrite();

  const hasMiners = typeof hashRate === 'bigint' && hashRate > 0n;

  // Oblicz MINED PER DAY
  const minedPerDay = (typeof hashRate === 'bigint' && typeof totalHashrate === 'bigint' && typeof rewardPerBlock === 'bigint' && totalHashrate > 0n)
    ? (Number(hashRate) / Number(totalHashrate)) * Number(formatEther(rewardPerBlock)) * 43200
    : 0;

  // Format pending rewards
  const formattedPendingRewards = typeof pendingRewards === 'bigint' 
    ? Number(formatEther(pendingRewards)).toFixed(4)
    : '0';

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
            Mining Rig
          </Text>
        </HStack>

        {!hasMiners ? (
          <Text color="gray.400">You have no miners yet.</Text>
        ) : (
          <>
            <Box>
              <HStack justify="space-between" mb={2}>
                <Text color="gray.400">Your Hash Rate</Text>
                <AnimatePresence mode="wait">
                  <MotionText
                    key={hashRate?.toString()}
                    color={neon.green}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    sx={{
                      textShadow: `0 0 10px ${neon.green}88, 0 0 20px ${neon.green}44`
                    }}
                  >
                    {hashRate?.toString() ?? '...'} GH/s
                  </MotionText>
                </AnimatePresence>
              </HStack>
            </Box>

            <Box>
              <HStack justify="space-between" mb={2}>
                <Text color="gray.400">Mined Per Day</Text>
                <AnimatePresence mode="wait">
                  <MotionText
                    key={minedPerDay.toString()}
                    color={neon.purple}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    sx={{
                      textShadow: `0 0 10px ${neon.purple}88, 0 0 20px ${neon.purple}44`
                    }}
                  >
                    {minedPerDay.toFixed(4)} MAXX
                  </MotionText>
                </AnimatePresence>
              </HStack>
            </Box>

            <Box>
              <HStack justify="space-between" mb={2}>
                <Text color="gray.400">Network Share</Text>
                <AnimatePresence mode="wait">
                  <MotionText
                    key={typeof hashRate === 'bigint' && typeof totalHashrate === 'bigint' && totalHashrate > 0n
                      ? ((Number(hashRate) / Number(totalHashrate)) * 100).toFixed(2)
                      : '0.00'}
                    color={neon.blue}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    sx={{
                      textShadow: `0 0 10px ${neon.blue}88, 0 0 20px ${neon.blue}44`
                    }}
                  >
                    {typeof hashRate === 'bigint' && typeof totalHashrate === 'bigint' && totalHashrate > 0n
                      ? ((Number(hashRate) / Number(totalHashrate)) * 100).toFixed(2)
                      : '0.00'}%
                  </MotionText>
                </AnimatePresence>
              </HStack>
              <MotionProgress
                value={typeof hashRate === 'bigint' && typeof totalHashrate === 'bigint' && totalHashrate > 0n
                  ? (Number(hashRate) / Number(totalHashrate)) * 100
                  : 0}
                size="sm"
                borderRadius="full"
                bg="gray.700"
                sx={{
                  '& > div': {
                    background: `linear-gradient(90deg, ${neon.blue}, ${neon.pink})`,
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: `linear-gradient(90deg, transparent, ${neon.blue}88, transparent)`,
                      animation: 'shine 2s infinite',
                      '@keyframes shine': {
                        '0%': {
                          transform: 'translateX(-100%)',
                          opacity: 0
                        },
                        '50%': {
                          opacity: 1
                        },
                        '100%': {
                          transform: 'translateX(100%)',
                          opacity: 0
                        }
                      }
                    },
                    animation: 'glow 2s infinite',
                    '@keyframes glow': {
                      '0%': {
                        boxShadow: `0 0 5px ${neon.blue}44, 0 0 10px ${neon.blue}22`
                      },
                      '50%': {
                        boxShadow: `0 0 15px ${neon.blue}88, 0 0 30px ${neon.blue}44`
                      },
                      '100%': {
                        boxShadow: `0 0 5px ${neon.blue}44, 0 0 10px ${neon.blue}22`
                      }
                    }
                  }
                }}
              />
            </Box>
          </>
        )}

        <Box display="flex" justifyContent="center">
          <Button
            colorScheme="blue"
            bg={neon.pink}
            color="white"
            _hover={{
              bg: neon.blue,
              boxShadow: `0 0 16px ${neon.blue}`,
              transform: 'scale(1.05)',
            }}
            onClick={() => {
              console.log('Claim mined $MAXX');
              writeContract({
                address: MINING_ADDRESS as `0x${string}`,
                abi: MINING_ABI,
                functionName: 'claimRewards',
              });
            }}
            isLoading={isPending}
            isDisabled={isPending || !hasMiners || Number(formattedPendingRewards) === 0}
            fontFamily="'Press Start 2P', monospace"
            fontSize="xs"
            px={6}
            py={4}
            borderRadius="md"
            border="2px solid"
            borderColor={neon.pink}
            _active={{
              transform: 'scale(0.95)',
            }}
            sx={{
              textShadow: `0 0 10px ${neon.pink}88, 0 0 20px ${neon.pink}44`,
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': {
                  boxShadow: `0 0 5px ${neon.pink}44, 0 0 10px ${neon.pink}22`
                },
                '50%': {
                  boxShadow: `0 0 20px ${neon.pink}88, 0 0 40px ${neon.pink}44`
                },
                '100%': {
                  boxShadow: `0 0 5px ${neon.pink}44, 0 0 10px ${neon.pink}22`
                }
              }
            }}
          >
            CLAIM {formattedPendingRewards} MAXX
          </Button>
        </Box>
      </VStack>
    </Box>
  );
};

export default MiningRig; 