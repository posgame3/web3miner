import React, { useMemo } from 'react';
import { Box, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useContractRead, useAccount } from 'wagmi';
import { MINING_ADDRESS, MINING_ABI } from '../config/contracts';
import { neon } from '../styles/neon';

export type TileCoords = { x: number; y: number };

interface StarterMinerStats {
  hashrate: string;
  power: string;
}

interface MiningGridProps {
  selected: TileCoords | null;
  onSelect: (coords: TileCoords) => void;
  minerTiles?: TileCoords[];
  starterMinerTile?: TileCoords | null;
  starterMinerStats?: StarterMinerStats | null;
  gridSizeX: number;
  gridSizeY: number;
}

const MotionBox = motion(Box);

const MiningGrid: React.FC<MiningGridProps> = ({ selected, onSelect, minerTiles = [], starterMinerTile, starterMinerStats, gridSizeX, gridSizeY }) => {
  const { address } = useAccount();

  // Get miner data for each tile
  const { data: miners, refetch: refetchMiners } = useContractRead({
    address: MINING_ADDRESS as `0x${string}`,
    abi: MINING_ABI,
    functionName: 'getPlayerMinersPaginated',
    args: [address, 0, 100],
    query: {
      enabled: !!address,
      refetchInterval: 2000, // Add automatic refresh every 2 seconds
    }
  });

  // Sort miners by minerIndex
  const sortedMiners = useMemo(() => {
    if (!Array.isArray(miners)) {
      return [];
    }
    const sorted = [...miners].sort((a: any, b: any) => Number(a.minerIndex) - Number(b.minerIndex));
    return sorted;
  }, [miners]);

  const getMinerIcon = (x: number, y: number) => {
    // Get miner stats directly
    const stats = getMinerStats(x, y);
    const hashrate = stats?.hashrate ? Number(stats.hashrate) : 0;
    
    // Match icon based on hashrate ranges
    if (hashrate <= 120) {
      return <span role="img" aria-label="starter-miner" style={{ fontSize: 32, filter: 'drop-shadow(0 0 6px #00E8FF)' }}>💎</span>;
    } else if (hashrate <= 320) {
      return <span role="img" aria-label="basic-miner" style={{ fontSize: 32, filter: 'drop-shadow(0 0 6px #00E8FF)' }}>💻</span>;
    } else if (hashrate <= 600) {
      return <span role="img" aria-label="advanced-miner" style={{ fontSize: 32, filter: 'drop-shadow(0 0 6px #00E8FF)' }}>🖥️</span>;
    } else if (hashrate <= 920) {
      return <span role="img" aria-label="pro-miner" style={{ fontSize: 32, filter: 'drop-shadow(0 0 6px #00E8FF)' }}>⚡</span>;
    }
    // Default icon for unknown hashrate
    return <span role="img" aria-label="miner" style={{ fontSize: 32, filter: 'drop-shadow(0 0 6px #00E8FF)' }}>💻</span>;
  };

  const getMinerStyle = (x: number, y: number) => {
    // Starter miner
    if (starterMinerTile && starterMinerTile.x === x && starterMinerTile.y === y) {
      return {
        background: 'linear-gradient(45deg, #00E8FF 0%, #00E8FF55 100%)',
        boxShadow: '0 0 16px #00E8FF',
        index: 0
      };
    }

    // Find miner data for this tile
    if (!Array.isArray(sortedMiners)) {
      return {};
    }

    const miner = sortedMiners.find((m: any) => {
      const match = Number(m.x) === x && Number(m.y) === y;
      return match;
    });

    if (!miner) {
      return {};
    }

    const style = {
      background: 'linear-gradient(45deg, #00E8FF 0%, #00E8FF55 100%)',
      boxShadow: '0 0 16px #00E8FF',
      index: Number(miner.minerIndex)
    };
    return style;
  };

  const getMinerStats = (x: number, y: number) => {
    // Starter miner stats
    if (starterMinerTile && starterMinerTile.x === x && starterMinerTile.y === y) {
      return starterMinerStats;
    }

    // Find miner data for this tile
    if (!Array.isArray(sortedMiners)) return null;
    
    const miner = sortedMiners.find((m: any) => Number(m.x) === x && Number(m.y) === y);
    if (!miner) return null;

    return {
      hashrate: miner.hashrate?.toString() || '0',
      power: miner.powerConsumption?.toString() || '0'
    };
  };

  const isFieldOccupied = (x: number, y: number) => {
    if (!Array.isArray(sortedMiners)) {
      return false;
    }

    const hasMiner = sortedMiners.some((m: any) => {
      const match = Number(m.x) === x && Number(m.y) === y;
      return match;
    });

    const isStarterMiner = starterMinerTile && starterMinerTile.x === x && starterMinerTile.y === y;
    if (isStarterMiner) {
      return true;
    }

    return hasMiner || isStarterMiner;
  };

  return (
    <SimpleGrid
      columns={gridSizeX}
      spacing={4}
      bg="gray.800"
      p={[2, 4]}
      borderRadius="lg"
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
      minH="100%"
      w="100%"
      maxW="100%"
      mx="auto"
      gridTemplateColumns={`repeat(${gridSizeX}, 1fr)`}
      gridAutoRows="1fr"
      gap={4}
    >
      {Array.from({ length: gridSizeX * gridSizeY }).map((_, idx) => {
        const x = idx % gridSizeX;
        const y = Math.floor(idx / gridSizeX);
        const isSelected = selected?.x === x && selected?.y === y;
        const hasMiner = isFieldOccupied(x, y);
        const minerStats = getMinerStats(x, y);
        const minerStyle = getMinerStyle(x, y);

        return (
          <MotionBox
            key={`${x},${y}`}
            whileHover={{ 
              scale: 1.08, 
              boxShadow: `0 0 16px ${neon.blue}, 0 0 32px ${neon.blue}55`,
              borderColor: neon.blue
            }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            w="100%"
            h="100%"
            minH="80px"
            bg={isSelected ? `linear-gradient(135deg, ${neon.blue} 60%, gray.800 100%)` : hasMiner ? 'gray.700' : 'gray.800'}
            borderWidth="1px"
            borderColor={isSelected ? neon.blue : hasMiner ? neon.green : 'gray.700'}
            borderRadius="lg"
            cursor="pointer"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontFamily="'Press Start 2P', monospace"
            fontSize={["md", "lg"]}
            color={isSelected ? 'gray.800' : hasMiner ? neon.green : neon.blue}
            position="relative"
            boxShadow={isSelected ? `0 0 24px ${neon.blue}, 0 0 48px ${neon.blue}55` : hasMiner ? `0 0 8px ${neon.green}55` : 'none'}
            onClick={() => onSelect({ x, y })}
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
                borderColor: hasMiner ? `${neon.green}44` : `${neon.blue}44`,
                boxShadow: hasMiner 
                  ? `0 0 10px ${neon.green}44, 0 0 20px ${neon.green}22`
                  : `0 0 10px ${neon.blue}44, 0 0 20px ${neon.blue}22`,
                opacity: 0.5,
                pointerEvents: 'none'
              }
            }}
          >
            {hasMiner ? (
              <VStack spacing={2}>
                <Box
                  w={["32px", "40px", "48px"]}
                  h={["32px", "40px", "48px"]}
                  borderRadius="md"
                  background={`linear-gradient(45deg, ${neon.green}22, ${neon.blue}22)`}
                  boxShadow={`0 0 16px ${neon.green}44`}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  color="#fff"
                  sx={{
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      borderRadius: 'md',
                      border: '1px solid',
                      borderColor: `${neon.green}44`,
                      boxShadow: `0 0 10px ${neon.green}44, 0 0 20px ${neon.green}22`,
                      opacity: 0.5,
                      pointerEvents: 'none'
                    }
                  }}
                >
                  {getMinerIcon(x, y)}
                </Box>
                {minerStats && (
                  <VStack spacing={0}>
                    <Text 
                      color={neon.green} 
                      fontSize={["2xs", "xs"]}
                      sx={{
                        textShadow: `0 0 10px ${neon.green}88, 0 0 20px ${neon.green}44`
                      }}
                    >
                      H: {minerStats.hashrate}
                    </Text>
                    <Text 
                      color={neon.blue} 
                      fontSize={["2xs", "xs"]}
                      sx={{
                        textShadow: `0 0 10px ${neon.blue}88, 0 0 20px ${neon.blue}44`
                      }}
                    >
                      P: {minerStats.power}W
                    </Text>
                  </VStack>
                )}
              </VStack>
            ) : (
              <Box 
                fontSize={["2xs", "xs", "sm"]} 
                color={neon.blue} 
                opacity={0.7}
                sx={{
                  textShadow: `0 0 10px ${neon.blue}88, 0 0 20px ${neon.blue}44`
                }}
              >
                {x},{y}
              </Box>
            )}
          </MotionBox>
        );
      })}
    </SimpleGrid>
  );
};

export default MiningGrid;