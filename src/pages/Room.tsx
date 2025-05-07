import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Grid,
  VStack,
  HStack,
  Text,
  Button,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  Spinner,
} from '@chakra-ui/react';
import { useAccount, useContractRead, useContractWrite, useChainId } from 'wagmi';
import { useWaitForTransactionReceipt } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { MINING_ADDRESS, MINING_ABI, ETHERMAX_ADDRESS, ETHERMAX_ABI } from '../config/contracts';
import { config } from '../config/wagmi';
import MiningGrid, { TileCoords } from '../components/MiningGrid';
import BuyMinerModal from '../components/BuyMinerModal';
import ResourceManagement from '../components/ResourceManagement';
import NetworkStats from '../components/NetworkStats';
import MiningRig from '../components/MiningRig';
import React from 'react';
import { Interface } from 'ethers';
import * as ethers from 'ethers';
import UpgradeFacilityModal from '../components/UpgradeFacilityModal';
import MinerInfoModal from '../components/MinerInfoModal';

const DEFAULT_STARTER_MINER_TILE = { x: 0, y: 0 };

const Room = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const toast = useToast();
  const [selectedTile, setSelectedTile] = useState<TileCoords | null>(null);
  const [isBuyModalOpen, setBuyModalOpen] = useState(false);
  const [minerTiles, setMinerTiles] = useState<TileCoords[]>([]);
  const [miningPower, setMiningPower] = useState(0);
  const [rewards, setRewards] = useState(0);
  const { writeContract, isPending } = useContractWrite();
  const [starterMinerTile, setStarterMinerTile] = useState<TileCoords | null>(null);
  // Hooki do sprawdzania zajętych pól w gridzie
  const [occupiedCoords, setOccupiedCoords] = useState<{ [key: string]: boolean }>({});
  // Logi do debugowania gridu
  console.log('occupiedCoords:', occupiedCoords);

  // Onboarding: sprawdzanie facility i starter minera
  const { data: facility, isLoading: isFacilityLoading, refetch: refetchFacility } = useContractRead({
    address: MINING_ADDRESS as `0x${string}`,
    abi: MINING_ABI,
    functionName: 'ownerToFacility',
    args: [address],
    query: { enabled: isConnected },
  });

  // Get facility level and calculate grid size
  const facilityLevel = facility && Array.isArray(facility) ? Number(facility[1]) : 1;
  const totalSlots = facility && Array.isArray(facility) ? Number(facility[1]) : 4; // Use maxMiners from contract
  
  // Calculate grid dimensions based on facility level
  const gridSizeX = 2;
  const gridSizeY = Math.ceil(totalSlots / gridSizeX); // Calculate Y based on total slots

  const [hasFacility, setHasFacility] = useState(false);
  useEffect(() => {
    console.log('facility:', facility);
    let has = false;
    if (Array.isArray(facility) && facility.length > 1) {
      has = Number(facility[1]) > 0; // maxMiners > 0
    }
    console.log('hasFacility:', has);
    setHasFacility(has);
  }, [facility]);

  useEffect(() => {
    console.log('address:', address, 'isConnected:', isConnected);
  }, [address, isConnected]);

  const { data: starterMiner, isLoading: isStarterMinerLoading } = useContractRead({
    address: MINING_ADDRESS as `0x${string}`,
    abi: MINING_ABI,
    functionName: 'acquiredStarterMiner',
    args: [address],
    query: { enabled: isConnected && hasFacility },
  });
  const [hasStarterMiner, setHasStarterMiner] = useState(false);
  useEffect(() => {
    setHasStarterMiner(!!starterMiner);
  }, [starterMiner]);

  // Logi do debugowania gridu
  console.log('occupiedCoords:', occupiedCoords);

  useEffect(() => {
    async function fetchOccupiedCoords() {
      if (!address || !hasFacility) return;
      const coords: { [key: string]: boolean } = {};
      const miners: TileCoords[] = [];
      for (let x = 0; x < gridSizeX; x++) {
        for (let y = 0; y < gridSizeY; y++) {
          try {
            const miningIface = new Interface(MINING_ABI);
            const data = miningIface.encodeFunctionData('playerOccupiedCoords', [address, x, y]);
            const res = await (window as any).ethereum.request({
              method: 'eth_call',
              params: [{
                to: MINING_ADDRESS,
                data
              }, 'latest'],
            });
            const occupied = res && res !== '0x' && res !== '0x0' && res !== '0x00' && res !== '0x0000000000000000000000000000000000000000000000000000000000000000';
            coords[`${x},${y}`] = occupied;
            if (occupied) miners.push({ x, y });
          } catch (e) {
            coords[`${x},${y}`] = false;
          }
        }
      }
      setOccupiedCoords(coords);
      setMinerTiles(miners);
    }
    fetchOccupiedCoords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, hasFacility, gridSizeX, gridSizeY]);

  // Dodaj na górze komponentu Room:
  const { data: initialFacilityPrice } = useContractRead({
    address: MINING_ADDRESS as `0x${string}`,
    abi: MINING_ABI,
    functionName: 'initialFacilityPrice',
  });

  // Zakup facility (zgodnie z Ethermax)
  const handleBuyFacility = async () => {
    try {
      if (!initialFacilityPrice) {
        toast({ title: 'Cannot fetch facility price', status: 'error', duration: 4000, isClosable: true });
        return;
      }
      const referrer = localStorage.getItem('referrer') || '0x0000000000000000000000000000000000000000';
      await writeContract({
        address: MINING_ADDRESS as `0x${string}`,
        abi: MINING_ABI,
        functionName: 'purchaseInitialFacility',
        args: [referrer],
        value: initialFacilityPrice as bigint,
      });
      setTimeout(() => {
        refetchFacility();
        window.location.reload();
      }, 2000);
      toast({ title: 'Facility purchased!', status: 'success', duration: 5000, isClosable: true });
    } catch (e: any) {
      toast({ title: 'Error purchasing facility', description: e.message, status: 'error', duration: 5000, isClosable: true });
    }
  };

  // Claim starter minera (zgodnie z Ethermax)
  const handleClaimStarterMiner = async () => {
    if (!starterMinerTile) {
      console.log('[DEBUG] Brak wybranego tile do claimowania starter minera');
      return;
    }
    const key = `${starterMinerTile.x},${starterMinerTile.y}`;
    console.log('[DEBUG] Wybrany tile:', starterMinerTile, 'key:', key);
    console.log('[DEBUG] occupiedCoords:', occupiedCoords);
    if (occupiedCoords[key]) {
      toast({ title: 'This tile is already occupied!', status: 'error', duration: 4000, isClosable: true });
      console.log('[DEBUG] Tile jest już zajęty!');
      return;
    }
    console.log('[DEBUG] hasFacility:', hasFacility);
    console.log('[DEBUG] hasStarterMiner:', hasStarterMiner);
    console.log('[DEBUG] address:', address);
    console.log('[DEBUG] Próbuję wywołać getFreeStarterMiner z:', starterMinerTile.x, starterMinerTile.y);
    try {
      // Dodatkowo: sprawdź mapping acquiredStarterMiner i ownerToFacility
      const miningIface = new Interface(MINING_ABI);
      const dataAcquired = miningIface.encodeFunctionData('acquiredStarterMiner', [address]);
      const dataFacility = miningIface.encodeFunctionData('ownerToFacility', [address]);
      const acquired = await window.ethereum.request({
        method: 'eth_call',
        params: [{ to: MINING_ADDRESS, data: dataAcquired }, 'latest'],
      });
      const facility = await window.ethereum.request({
        method: 'eth_call',
        params: [{ to: MINING_ADDRESS, data: dataFacility }, 'latest'],
      });
      console.log('[DEBUG] acquiredStarterMiner mapping:', acquired);
      console.log('[DEBUG] ownerToFacility mapping:', facility);
      await writeContract({
        address: MINING_ADDRESS as `0x${string}`,
        abi: MINING_ABI,
        functionName: 'getFreeStarterMiner',
        args: [starterMinerTile.x, starterMinerTile.y],
      });
      setTimeout(() => {
        refetchFacility();
      }, 2000);
      toast({ title: 'Free miner claimed!', status: 'success', duration: 5000, isClosable: true });
    } catch (error: any) {
      console.error('[DEBUG] Error claiming free miner:', error);
      toast({ title: 'Error claiming free miner', description: error.message, status: 'error', duration: 5000, isClosable: true });
    }
  };

  // Pobieranie minerów użytkownika z kontraktu (przykład: pętla po gridzie)
  const miners = [] as TileCoords[];
  for (let x = 0; x < gridSizeX; x++) {
    for (let y = 0; y < gridSizeY; y++) {
      // Dla uproszczenia: pobieram czy jest miner na danym polu
      // (w praktyce można użyć multicall lub dedykowanej funkcji getMinersForUser)
      // Tu tylko hooki wagmi mogą być użyte na górze komponentu, więc uproszczony mock:
      // const { data: miner } = useContractRead({ ... });
      // if (miner && miner.owner === address) miners.push({ x, y });
    }
  }
  // TODO: Zastąpić powyższy mock rzeczywistym pobieraniem z kontraktu (np. multicall lub dedykowana funkcja)

  // Contract reads
  const { data: userMiningPower } = useContractRead({
    address: MINING_ADDRESS as `0x${string}`,
    abi: MINING_ABI,
    functionName: 'getUserMiningPower',
    args: [address],
    query: {
      enabled: isConnected,
    },
  });

  const { data: userRewards } = useContractRead({
    address: MINING_ADDRESS as `0x${string}`,
    abi: MINING_ABI,
    functionName: 'getUserRewards',
    args: [address],
    query: {
      enabled: isConnected,
    },
  });

  useEffect(() => {
    if (userMiningPower) {
      setMiningPower(Number(formatEther(userMiningPower as bigint)));
    }
    if (userRewards) {
      setRewards(Number(formatEther(userRewards as bigint)));
    }
  }, [userMiningPower, userRewards]);

  // Sprawdzanie allowance
  const { data: allowance } = useContractRead({
    address: ETHERMAX_ADDRESS as `0x${string}`,
    abi: ETHERMAX_ABI,
    functionName: 'allowance',
    args: [address, MINING_ADDRESS],
    query: {
      enabled: isConnected,
    },
  });

  const handleApproveMAXX = async () => {
    try {
      console.log('Zatwierdzanie tokenów MAXX...');
      const hash = await writeContract({
        address: ETHERMAX_ADDRESS as `0x${string}`,
        abi: ETHERMAX_ABI,
        functionName: 'approve',
        args: [MINING_ADDRESS, parseEther('1000000')], // Duża wartość, żeby nie trzeba było często zatwierdzać
      });
      
      console.log('Transakcja zatwierdzenia wysłana:', hash);
      toast({ 
        title: 'Zatwierdzono tokeny MAXX',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error('Błąd podczas zatwierdzania:', error);
      toast({
        title: 'Błąd podczas zatwierdzania',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Kupowanie minera (zgodnie z Ethermax)
  const handleBuyMiner = async (minerIndex: number, tile: TileCoords) => {
    try {
      if (!allowance || allowance === BigInt(0)) {
        await handleApproveMAXX();
        return;
      }

      writeContract({
        address: MINING_ADDRESS as `0x${string}`,
        abi: MINING_ABI,
        functionName: 'buyMiner',
        args: [minerIndex, tile.x, tile.y],
      });

      toast({ 
        title: 'Confirm purchase in MetaMask', 
        status: 'info', 
        duration: 5000, 
        isClosable: true 
      });

      // Nie odświeżamy strony automatycznie - poczekamy na potwierdzenie transakcji
      // i odświeżymy dane facility po 2 sekundach
      setTimeout(() => {
        refetchFacility();
      }, 2000);

    } catch (error: any) {
      toast({ 
        title: 'Error purchasing miner', 
        description: error.message, 
        status: 'error', 
        duration: 5000, 
        isClosable: true 
      });
    }
  };

  // Kliknięcie kafelka
  const handleSelectTile = (coords: TileCoords) => {
    setSelectedTile(coords);
    const key = `${coords.x},${coords.y}`;
    const isOccupied = occupiedCoords[key];
    
    if (isOccupied) {
      // Jeśli pole jest zajęte, pokaż modal z informacjami o minerze
      setSelectedMinerCoords(coords);
      setMinerInfoModalOpen(true);
    } else {
      // Jeśli pole jest puste, pokaż modal do zakupu
      setBuyModalOpen(true);
    }
  };

  const handleStartMining = async () => {
    try {
      console.log('Start mining: start', { address });
      const hash = await writeContract({
        abi: MINING_ABI,
        address: MINING_ADDRESS as `0x${string}`,
        functionName: 'startMining',
      });
      console.log('Start mining: tx sent', hash);
      toast({
        title: 'Mining started',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error('Start mining: error', error);
      toast({
        title: 'Error starting mining',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Claim rewards (bez zmian, tylko refetch)
  const handleClaimRewards = async () => {
    try {
      await writeContract({
        abi: MINING_ABI,
        address: MINING_ADDRESS as `0x${string}`,
        functionName: 'claimRewards',
      });
      setTimeout(() => {
        refetchFacility();
      }, 2000);
      toast({ title: 'Rewards claimed', status: 'success', duration: 5000, isClosable: true });
    } catch (error: any) {
      toast({ title: 'Error claiming rewards', description: error.message, status: 'error', duration: 5000, isClosable: true });
    }
  };

  // Hook do pobrania starter miner index
  const { data: starterMinerIndex } = useContractRead({
    address: MINING_ADDRESS as `0x${string}`,
    abi: MINING_ABI,
    functionName: 'STARTER_MINER_INDEX',
  });
  // Hook do pobrania danych starter minera
  const { data: starterMinerData } = useContractRead({
    address: MINING_ADDRESS as `0x${string}`,
    abi: MINING_ABI,
    functionName: 'miners',
    args: [starterMinerIndex],
    query: { enabled: !!starterMinerIndex },
  });

  // Wyciągnij power facility i power starter minera
  const totalPowerOutput = facility && Array.isArray(facility) && facility.length > 2 ? BigInt(facility[2]) : 0n;
  const starterMinerPower = starterMinerData && Array.isArray(starterMinerData) && starterMinerData[5] ? BigInt(starterMinerData[5]) : 0n;
  const availablePower = totalPowerOutput > starterMinerPower ? totalPowerOutput - starterMinerPower : 0n;

  // Automatyczna zmiana sieci na Sepolia po połączeniu walleta
  useEffect(() => {
    if (isConnected && window.ethereum && chainId !== 11155111) {
      window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // 0xaa36a7 = 11155111 (Sepolia)
      }).then(() => {
        toast({
          title: 'Switched to Sepolia network',
          status: 'success',
          duration: 4000,
          isClosable: true,
        });
      }).catch((err: any) => {
        toast({
          title: 'Please switch to Sepolia network!',
          description: err?.message || '',
          status: 'error',
          duration: 6000,
          isClosable: true,
        });
      });
    }
  }, [isConnected, chainId, toast]);

  // Wyciągnij statystyki starter minera
  const starterMinerStats = starterMinerData && Array.isArray(starterMinerData)
    ? {
        hashrate: starterMinerData[4]?.toString() || '',
        power: starterMinerData[5]?.toString() || '',
      }
    : null;

  // Sprawdź, czy wybrany tile jest zajęty
  const isSelectedTileOccupied = !!selectedTile && (minerTiles.some(tile => tile.x === selectedTile!.x && tile.y === selectedTile!.y) || (hasStarterMiner && starterMinerTile && selectedTile!.x === starterMinerTile.x && selectedTile!.y === starterMinerTile.y));

  // Funkcja pomocnicza do pobrania statystyk wszystkich minerów użytkownika
  const [minersData, setMinersData] = useState<any[]>([]);
  useEffect(() => {
    async function fetchMinersData() {
      if (!address || !hasFacility) return;
      const miners: any[] = [];
      // Dla każdego zajętego pola pobierz dane minera
      for (let x = 0; x < gridSizeX; x++) {
        for (let y = 0; y < gridSizeY; y++) {
          if (minerTiles.some(tile => tile.x === x && tile.y === y)) {
            // Pobierz dane minera z kontraktu
            try {
              const miningIface = new Interface(MINING_ABI);
              const data = miningIface.encodeFunctionData('getMinerAt', [address, x, y]);
              const res = await (window as any).ethereum.request({
                method: 'eth_call',
                params: [{ to: MINING_ADDRESS, data }, 'latest'],
              });
              // Zakładam, że res to hex z danymi minera (np. index, hashrate, power, itp.)
              // Możesz tu zdekodować dane zgodnie z ABI
              miners.push({ x, y, raw: res });
            } catch (e) {
              // fallback: jeśli nie ma funkcji getMinerAt, użyj starterMinerData dla starter minera
              if (starterMinerTile && starterMinerTile.x === x && starterMinerTile.y === y && starterMinerData) {
                miners.push({ x, y, ...starterMinerData });
              }
            }
          }
        }
      }
      setMinersData(miners);
    }
    fetchMinersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, hasFacility, gridSizeX, gridSizeY, minerTiles, starterMinerTile, starterMinerData]);

  // Stan do modala upgradu
  const [isUpgradeModalOpen, setUpgradeModalOpen] = useState(false);

  // Wyciągnij index obecnego facility użytkownika
  const currentFacilityIndex = facility && Array.isArray(facility) ? Number(facility[0]) : 0;
  const nextFacilityIndex = currentFacilityIndex + 1;

  const [isMinerInfoModalOpen, setMinerInfoModalOpen] = useState(false);
  const [selectedMinerCoords, setSelectedMinerCoords] = useState<TileCoords | null>(null);

  const handleUpgrade = async (nextFacilityIndex: number) => {
    try {
      console.log('Starting facility upgrade...');
      console.log('Next facility index:', nextFacilityIndex);
      
      writeContract({
        address: MINING_ADDRESS as `0x${string}`,
        abi: MINING_ABI,
        functionName: 'buyNewFacility',
        args: [nextFacilityIndex]
      });
      
      console.log('Upgrade transaction sent');
      toast({ 
        title: 'Confirm upgrade in MetaMask', 
        status: 'info', 
        duration: 5000, 
        isClosable: true 
      });
      
      setTimeout(() => {
        refetchFacility();
      }, 2000);
    } catch (e: any) {
      console.error('Upgrade error:', e);
      toast({ 
        title: 'Upgrade failed', 
        description: e.message, 
        status: 'error', 
        duration: 5000, 
        isClosable: true 
      });
    }
  };

  // Loading spinner przy sprawdzaniu facility
  if (isFacilityLoading) {
    return (
      <Box minH="60vh" display="flex" flexDir="column" alignItems="center" justifyContent="center">
        <Spinner size="xl" color="#00E8FF" thickness="4px" speed="0.65s" />
        <Text mt={4} fontFamily="'Press Start 2P', monospace">Checking facility...</Text>
      </Box>
    );
  }
  // Loading spinner przy sprawdzaniu starter minera
  if (!hasFacility && isStarterMinerLoading) {
    return (
      <Box minH="60vh" display="flex" flexDir="column" alignItems="center" justifyContent="center">
        <Spinner size="xl" color="#00E8FF" thickness="4px" speed="0.65s" />
        <Text mt={4} fontFamily="'Press Start 2P', monospace">Checking free miner...</Text>
      </Box>
    );
  }

  // Onboarding UI
  if (!isConnected) {
    return (
      <Box textAlign="center" py={10}>
        <Text fontSize="xl">Please connect your wallet to start mining</Text>
      </Box>
    );
  }
  if (!hasFacility) {
    return (
      <Box bg="#181A20" minH="60vh" display="flex" flexDir="column" alignItems="center" justifyContent="center" borderRadius="md" border="2px solid #00E8FF" boxShadow="0 0 8px #00E8FF55" mt={10}>
        <Text color="#fff" fontFamily="'Press Start 2P', monospace" fontSize="lg" mb={6} textAlign="center">
          YOU DON&apos;T HAVE A SPACE TO MINE!
        </Text>
        <Button
          colorScheme="orange"
          borderColor="#FF9900"
          color="#FF9900"
          variant="outline"
          fontFamily="'Press Start 2P', monospace"
          fontSize="md"
          px={8}
          py={6}
          onClick={handleBuyFacility}
          isLoading={isPending}
        >
          BUY FACILITY
        </Button>
      </Box>
    );
  }
  if (!hasStarterMiner) {
    // Renderuj grid do wyboru pozycji
    return (
      <Box bg="#181A20" minH="60vh" display="flex" flexDir="column" alignItems="center" justifyContent="center" borderRadius="md" border="2px solid #00E8FF" boxShadow="0 0 8px #00E8FF55" mt={10}>
        <Text color="#fff" fontFamily="'Press Start 2P', monospace" fontSize="lg" mb={6} textAlign="center">
          CLAIM YOUR FREE MINER!
        </Text>
        <Box mb={6}>
          <Grid templateColumns={`repeat(${gridSizeX}, 40px)`} gap={2}>
            {[...Array(gridSizeX)].map((_, x) =>
              [...Array(gridSizeY)].map((_, y) => {
                const selected = starterMinerTile && starterMinerTile.x === x && starterMinerTile.y === y;
                const occupied = occupiedCoords[`${x},${y}`];
                return (
                  <Box
                    key={`${x}-${y}`}
                    w="40px"
                    h="40px"
                    border="2px solid #00E8FF"
                    bg={selected ? '#00E8FF' : occupied ? '#444' : '#23272F'}
                    cursor={occupied ? 'not-allowed' : 'pointer'}
                    onClick={() => !occupied && setStarterMinerTile({ x, y })}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontFamily="'Press Start 2P', monospace"
                    color={selected ? '#181A20' : occupied ? '#888' : '#00E8FF'}
                    fontWeight="bold"
                  >
                    {x},{y}
                  </Box>
                );
              })
            )}
          </Grid>
        </Box>
        <Button
          colorScheme="orange"
          borderColor="#FF9900"
          color="#FF9900"
          variant="outline"
          fontFamily="'Press Start 2P', monospace"
          fontSize="md"
          px={8}
          py={6}
          onClick={handleClaimStarterMiner}
          isLoading={isPending}
          isDisabled={!starterMinerTile}
        >
          CLAIM FREE MINER
        </Button>
        {/* Wyświetl info o darmowym minerze */}
        {starterMinerData && Array.isArray(starterMinerData) && (
          <Box mt={4} p={3} bg="#23272F" border="1px solid #00E8FF" borderRadius="md">
            <Text color="#00E8FF" fontWeight="bold" fontSize="sm">FREE STARTER MINER</Text>
            <Text color="#fff" fontSize="xs">Hashrate: <b style={{ color: '#00E8FF' }}>{starterMinerData[4]?.toString()}</b></Text>
            <Text color="#fff" fontSize="xs">Power: <b style={{ color: '#00E8FF' }}>{starterMinerData[5]?.toString()}</b></Text>
            <Text color="#fff" fontSize="xs">In production: <b style={{ color: '#00E8FF' }}>{starterMinerData[7] ? 'Yes' : 'No'}</b></Text>
          </Box>
        ) as any}
      </Box>
    );
  }

  return (
    <Box bg="#181A20" minH="100vh" py={6} px={[2, 10]} fontFamily="'Press Start 2P', monospace" position="relative">
      <Grid templateColumns={["1fr", null, "360px 1fr"]} gap={8} maxW="1200px" mx="auto">
        {/* Lewa kolumna: statystyki */}
        <VStack spacing={6} align="stretch">
          <ResourceManagement minerTiles={minerTiles} />
          <NetworkStats />
          <MiningRig />
        </VStack>
        {/* Prawa kolumna: maszyna, grid, modal */}
        <VStack spacing={6} align="stretch">
          <Box
            bg="neon.panel"
            borderRadius="lg"
            border="2.5px solid"
            borderColor="neon.blue"
            boxShadow="0 0 16px #00E8FF, 0 0 32px #FF00CC55"
            p={6}
            fontFamily="'Press Start 2P', monospace"
            position="relative"
            overflow="hidden"
            display="flex"
            flexDirection="column"
            height="100%"
            _before={{
              content: '""',
              position: 'absolute',
              inset: 0,
              borderRadius: "lg",
              boxShadow: "0 0 32px 4px #00E8FF, 0 0 64px 8px #FF00CC55",
              pointerEvents: "none",
              opacity: 0.5,
              zIndex: 0,
            }}
          >
            <Text color="neon.blue" fontWeight="bold" mb={4} fontSize="md" letterSpacing={1} textShadow="0 0 8px #00E8FF">
              ETHERMAX VIRTUAL MACHINE
            </Text>
            <Box flex="1" overflow="hidden" position="relative">
              <MiningGrid
                selected={selectedTile}
                onSelect={handleSelectTile}
                minerTiles={minerTiles}
                starterMinerTile={hasStarterMiner ? starterMinerTile : null}
                starterMinerStats={starterMinerStats}
                gridSizeX={gridSizeX}
                gridSizeY={gridSizeY}
              />
            </Box>
            <Box display="flex" flexDirection="column" alignItems="center" gap={4} mt={6}>
              <Button
                colorScheme="blue"
                bg="neon.blue"
                color="white"
                _hover={{
                  bg: 'neon.pink',
                  boxShadow: '0 0 16px #FF00CC',
                }}
                fontFamily="'Press Start 2P', monospace"
                fontSize="xs"
                px={6}
                py={4}
                borderRadius="md"
                border="2px solid"
                borderColor="neon.blue"
                _active={{
                  transform: 'scale(0.95)',
                }}
                onClick={() => setUpgradeModalOpen(true)}
              >
                UPGRADE
              </Button>
            </Box>
          </Box>
        </VStack>
      </Grid>
      <BuyMinerModal
        isOpen={isBuyModalOpen}
        onClose={() => setBuyModalOpen(false)}
        selectedTile={selectedTile}
        onBuy={handleBuyMiner}
      />
      <UpgradeFacilityModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        currentFacilityIndex={currentFacilityIndex}
        nextFacilityIndex={nextFacilityIndex}
        onUpgrade={handleUpgrade}
      />
      <MinerInfoModal
        isOpen={isMinerInfoModalOpen}
        onClose={() => setMinerInfoModalOpen(false)}
        coords={selectedMinerCoords}
        address={address}
      />
    </Box>
  );
};

export default Room; 