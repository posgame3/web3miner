import React, { useEffect, useState } from 'react';
import { Box, VStack, HStack, Text, Badge, Progress, useColorModeValue } from '@chakra-ui/react';
import { useAccount, useBalance, useContractRead } from 'wagmi';
import { ETHERMAX_ADDRESS, MINING_ADDRESS, MINING_ABI } from '../config/contracts';
import { TileCoords } from './MiningGrid';
import { formatEther } from 'viem';
import { ethers } from 'ethers';
import { motion, AnimatePresence } from 'framer-motion';

const MotionProgress = motion(Progress);
const MotionText = motion(Text);

interface ResourceManagementProps {
  minerTiles: Array<{ x: number; y: number; minerId?: number }>;
}

interface FacilityData {
  facilityIndex: number;
  level: number;
  power: number;
  space: number;
  x: number;
  y: number;
  currMiners: number;
  currPowerOutput: number;
}

interface Miner {
  powerConsumption: bigint;
}

const facilityLevels = [
  { name: 'Lv.1', powerLimit: 24, upgradeCost: 1 },
  { name: 'Lv.2', powerLimit: 72, upgradeCost: 1440 },
  { name: 'Lv.3', powerLimit: 10000, upgradeCost: 1.0 },
  { name: 'Lv.4', powerLimit: 20000, upgradeCost: 2.0 },
  { name: 'Lv.5', powerLimit: 50000, upgradeCost: 5.0 }
];

const ResourceManagement = ({ minerTiles }: ResourceManagementProps) => {
  const { address } = useAccount();
  const [facilityLevel, setFacilityLevel] = useState(1);
  const [maxMiners, setMaxMiners] = useState(4);
  const [totalPowerOutput, setTotalPowerOutput] = useState(0);
  const [currentPowerUsage, setCurrentPowerUsage] = useState(0);

  const neon = {
    blue: '#00E8FF',
    pink: '#FF2E63',
    purple: '#B026FF',
    green: '#00FF9D'
  };

  // ETH balance
  const { data: ethBalance } = useBalance({ address });
  // MAXX balance
  const { data: maxxBalance } = useBalance({ address, token: ETHERMAX_ADDRESS });

  const { data: facilityData } = useContractRead({
    address: MINING_ADDRESS as `0x${string}`,
    abi: MINING_ABI,
    functionName: 'ownerToFacility',
    args: [address],
    query: {
      enabled: !!address,
      refetchInterval: 2000,
    }
  });

  useEffect(() => {
    if (!facilityData) {
      return;
    }

    if (!Array.isArray(facilityData)) {
      return;
    }

    try {
      const [
        facilityIndex,
        maxMiners,
        totalPowerOutput,
        x,
        y,
        currMiners,
        currPowerOutput
      ] = facilityData;
      
      // Konwersja BigInt na liczby
      const parsedData = {
        facilityIndex: Number(facilityIndex),
        maxMiners: Number(maxMiners),
        totalPowerOutput: Number(totalPowerOutput),
        x: Number(x),
        y: Number(y),
        currMiners: Number(currMiners),
        currPowerOutput: Number(currPowerOutput)
      };
      
      // Mapowanie facilityIndex na poziom facility
      // facilityIndex 1 = Level 1
      // facilityIndex 2 = Level 2
      // facilityIndex 3 = Level 3
      // itd.
      const level = parsedData.facilityIndex;
      setFacilityLevel(level);
      
      // Ustawiamy maksymalną liczbę górników
      setMaxMiners(parsedData.maxMiners);
      // Ustawiamy całkowitą moc wyjściową
      setTotalPowerOutput(parsedData.totalPowerOutput);
      // Ustawiamy aktualne zużycie mocy
      setCurrentPowerUsage(parsedData.currPowerOutput);
    } catch (error) {
    }
  }, [facilityData]);

  const powerPercentage = totalPowerOutput > 0 ? (currentPowerUsage / totalPowerOutput) * 100 : 0;
  const minersPercentage = maxMiners > 0 ? (minerTiles.length / maxMiners) * 100 : 0;

  const bgColor = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.700');

  // Get facility level and calculate grid slots
  const facilityLevelIndex = facilityLevel - 1;
  const totalSlots = maxMiners; // Używamy maxMiners z kontraktu
  const usedSlots = minerTiles.length;
  const availableSlots = totalSlots - usedSlots;

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
            PIXELMINER RESOURCE MANAGEMENT
          </Text>
        </HStack>

        <Box>
          <HStack justify="space-between" mb={2}>
            <Text color="gray.400">Facility Level</Text>
            <Text 
              color={neon.blue}
              sx={{
                textShadow: `0 0 10px ${neon.blue}88, 0 0 20px ${neon.blue}44`
              }}
            >
              {facilityLevels[facilityLevel - 1]?.name || `Level ${facilityLevel}`}
            </Text>
          </HStack>
        </Box>

        <Box>
          <HStack justify="space-between" mb={2}>
            <Text color="gray.400">ETH Balance</Text>
            <AnimatePresence mode="wait">
              <MotionText
                key={ethBalance ? Number(ethers.formatEther(ethBalance.value)).toFixed(4) : '0'}
                color={neon.blue}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                sx={{
                  textShadow: `0 0 10px ${neon.blue}88, 0 0 20px ${neon.blue}44`
                }}
              >
                {ethBalance ? Number(ethers.formatEther(ethBalance.value)).toFixed(4) : '0'} ETH
              </MotionText>
            </AnimatePresence>
          </HStack>
        </Box>

        <Box>
          <HStack justify="space-between" mb={2}>
            <Text color="gray.400">PXL Balance</Text>
            <AnimatePresence mode="wait">
              <MotionText
                key={maxxBalance ? Number(ethers.formatEther(maxxBalance.value)).toFixed(2) : '0'}
                color={neon.blue}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                sx={{
                  textShadow: `0 0 10px ${neon.blue}88, 0 0 20px ${neon.blue}44`
                }}
              >
                {maxxBalance ? Number(ethers.formatEther(maxxBalance.value)).toFixed(2) : '0'} PXL
              </MotionText>
            </AnimatePresence>
          </HStack>
        </Box>

        <Box>
          <HStack justify="space-between" mb={2}>
            <Text color="gray.400">Power Usage</Text>
            <AnimatePresence mode="wait">
              <MotionText
                key={currentPowerUsage}
                color={neon.blue}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                sx={{
                  textShadow: `0 0 10px ${neon.blue}88, 0 0 20px ${neon.blue}44`
                }}
              >
                {currentPowerUsage} / {totalPowerOutput} W
              </MotionText>
            </AnimatePresence>
          </HStack>
          <MotionProgress
            value={powerPercentage}
            size="sm"
            borderRadius="full"
            bg="gray.700"
            sx={{
              '& > div': {
                background: `linear-gradient(90deg, ${neon.green}, ${neon.blue})`,
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(90deg, transparent, ${neon.green}88, transparent)`,
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
                    boxShadow: `0 0 5px ${neon.green}44, 0 0 10px ${neon.green}22`
                  },
                  '50%': {
                    boxShadow: `0 0 15px ${neon.green}88, 0 0 30px ${neon.green}44`
                  },
                  '100%': {
                    boxShadow: `0 0 5px ${neon.green}44, 0 0 10px ${neon.green}22`
                  }
                }
              }
            }}
          />
        </Box>

        <Box>
          <HStack justify="space-between" mb={2}>
            <Text color="gray.400">Grid Slots</Text>
            <AnimatePresence mode="wait">
              <MotionText
                key={minerTiles.length}
                color={neon.purple}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                sx={{
                  textShadow: `0 0 10px ${neon.purple}88, 0 0 20px ${neon.purple}44`
                }}
              >
                {minerTiles.length} / {maxMiners}
              </MotionText>
            </AnimatePresence>
          </HStack>
          <MotionProgress
            value={minersPercentage}
            size="sm"
            borderRadius="full"
            bg="gray.700"
            sx={{
              '& > div': {
                background: `linear-gradient(90deg, ${neon.purple}, ${neon.pink})`,
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(90deg, transparent, ${neon.purple}88, transparent)`,
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
                    boxShadow: `0 0 5px ${neon.purple}44, 0 0 10px ${neon.purple}22`
                  },
                  '50%': {
                    boxShadow: `0 0 15px ${neon.purple}88, 0 0 30px ${neon.purple}44`
                  },
                  '100%': {
                    boxShadow: `0 0 5px ${neon.purple}44, 0 0 10px ${neon.purple}22`
                  }
                }
              }
            }}
          />
        </Box>

        {facilityLevel < facilityLevels.length && (
          <Box
            mt={4}
            p={4}
            borderRadius="md"
            bg="gray.700"
            borderWidth="1px"
            borderColor={`${neon.blue}44`}
            position="relative"
            _before={{
              content: '""',
              position: 'absolute',
              inset: 0,
              borderRadius: "md",
              boxShadow: `0 0 16px ${neon.blue}22`,
              pointerEvents: "none",
              opacity: 0.5,
              zIndex: 0,
            }}
          >
            <VStack spacing={2} align="start">
              <Text color={neon.blue} fontSize="sm" fontWeight="bold" sx={{ textShadow: `0 0 8px ${neon.blue}44` }}>
                Next Upgrade: {facilityLevels[facilityLevel]?.name || 'No Facility'}
              </Text>
              <HStack>
                <Text color="gray.400" fontSize="xs">Power Limit:</Text>
                <Text color={neon.green} fontSize="xs" sx={{ textShadow: `0 0 8px ${neon.green}44` }}>
                  {facilityLevels[facilityLevel]?.powerLimit} W
                </Text>
              </HStack>
              <HStack>
                <Text color="gray.400" fontSize="xs">Upgrade Cost:</Text>
                <Text color={neon.pink} fontSize="xs" sx={{ textShadow: `0 0 8px ${neon.pink}44` }}>
                  {facilityLevels[facilityLevel]?.upgradeCost} PXL
                </Text>
              </HStack>
            </VStack>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default ResourceManagement; 

