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
  Input,
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
import { ArrowForwardIcon } from '@chakra-ui/icons';

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
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimTxHash, setClaimTxHash] = useState<`0x${string}` | undefined>(undefined);
  const { isLoading: isClaimingLoading, isSuccess: isClaimingSuccess } = useWaitForTransactionReceipt({
    hash: claimTxHash,
  });

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
    let has = false;
    if (Array.isArray(facility) && facility.length > 1) {
      has = Number(facility[1]) > 0; // maxMiners > 0
    }
    setHasFacility(has);
  }, [facility]);

  useEffect(() => {
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
  }, [address, hasFacility, gridSizeX, gridSizeY]);

  // Dodaj na górze komponentu Room:
  const { data: initialFacilityPrice } = useContractRead({
    address: MINING_ADDRESS as `0x${string}`,
    abi: MINING_ABI,
    functionName: 'initialFacilityPrice',
  });

  const [facilityTxHash, setFacilityTxHash] = useState<`0x${string}` | undefined>(undefined);
  const [isFacilityConfirmed, setIsFacilityConfirmed] = useState(false);
  const { writeContractAsync } = useContractWrite();
  const { isLoading: isFacilityConfirming, isSuccess: isFacilitySuccess } = useWaitForTransactionReceipt({
    hash: facilityTxHash,
  });

  const [referrerInput, setReferrerInput] = useState('');
  const [isReferrerValid, setIsReferrerValid] = useState(true);

  useEffect(() => {
    const storedRef = localStorage.getItem('referrer');
    if (storedRef) {
      setReferrerInput(storedRef);
      validateReferrer(storedRef);
    }
  }, []);

  const validateReferrer = (address: string) => {
    const isValid = /^0x[a-fA-F0-9]{40}$/.test(address);
    setIsReferrerValid(isValid);
    return isValid;
  };

  const handleBuyFacility = async () => {
    try {
      if (!initialFacilityPrice) {
        toast({ title: 'Cannot fetch facility price', status: 'error', duration: 4000, isClosable: true });
        return;
      }

      let referrerAddress = '0x0000000000000000000000000000000000000000';
      
      if (referrerInput && validateReferrer(referrerInput)) {
        referrerAddress = referrerInput;
      } else {
        const storedReferrer = localStorage.getItem('referrer');
        if (storedReferrer) {
          referrerAddress = storedReferrer;
        }
      }

      const hash = await writeContractAsync({
        address: MINING_ADDRESS as `0x${string}`,
        abi: MINING_ABI,
        functionName: 'purchaseInitialFacility',
        args: [referrerAddress],
        value: initialFacilityPrice as bigint,
        chain: chainId,
        account: address,
      });
      setFacilityTxHash(hash as `0x${string}`);
      toast({
        title: 'Transaction sent!',
        description: 'Waiting for confirmation...',
        status: 'info',
        duration: 5000,
        isClosable: true
      });
    } catch (e: any) {
      toast({
        title: 'Error purchasing facility',
        description: e.message,
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  };

  useEffect(() => {
    if (isFacilitySuccess) {
      setIsFacilityConfirmed(true);
    }
  }, [isFacilitySuccess]);

  // Claim starter minera (zgodnie z Ethermax)
  const handleClaimStarterMiner = async () => {
    if (!starterMinerTile) return;
    const key = `${starterMinerTile.x},${starterMinerTile.y}`;
    if (occupiedCoords[key]) {
      toast({ title: 'This tile is already occupied!', status: 'error', duration: 4000, isClosable: true });
      return;
    }
    try {
      const hash = await writeContractAsync({
        address: MINING_ADDRESS as `0x${string}`,
        abi: MINING_ABI,
        functionName: 'getFreeStarterMiner',
        args: [starterMinerTile.x, starterMinerTile.y],
        chain: chainId,
        account: address,
      });
      setClaimTxHash(hash as `0x${string}`);
      toast({
        title: 'Transaction sent!',
        description: 'Waiting for confirmation...',
        status: 'info',
        duration: 5000,
        isClosable: true
      });
    } catch (error: any) {
      toast({ title: 'Error claiming free miner', description: error.message, status: 'error', duration: 5000, isClosable: true });
    }
  };

  useEffect(() => {
    if (isClaimingSuccess) {
      window.location.reload();
    }
  }, [isClaimingSuccess]);

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
      const hash = await writeContract({
        address: ETHERMAX_ADDRESS as `0x${string}`,
        abi: ETHERMAX_ABI,
        functionName: 'approve',
        args: [MINING_ADDRESS, parseEther('1000000')], // Duża wartość, żeby nie trzeba było często zatwierdzać
      });
      
      toast({ 
        title: 'Zatwierdzono tokeny PXL',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error: any) {
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
    // Reset previous selection
    setSelectedTile(null);
    
    // Set new selection
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
      const hash = await writeContract({
        abi: MINING_ABI,
        address: MINING_ADDRESS as `0x${string}`,
        functionName: 'startMining',
      });
      toast({
        title: 'Mining started',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error: any) {
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
  }, [address, hasFacility, gridSizeX, gridSizeY, minerTiles, starterMinerTile, starterMinerData]);

  // Stan do modala upgradu
  const [isUpgradeModalOpen, setUpgradeModalOpen] = useState(false);

  // Wyciągnij index obecnego facility użytkownika
  const currentFacilityIndex = facility && Array.isArray(facility) ? Number(facility[0]) : 0;
  const nextFacilityIndex = currentFacilityIndex + 1;

  const [isMinerInfoModalOpen, setMinerInfoModalOpen] = useState(false);
  const [selectedMinerCoords, setSelectedMinerCoords] = useState<TileCoords | null>(null);

  const [upgradeTxHash, setUpgradeTxHash] = useState<`0x${string}` | undefined>(undefined);
  const { isLoading: isUpgradeLoading, isSuccess: isUpgradeSuccess } = useWaitForTransactionReceipt({
    hash: upgradeTxHash,
  });

  const handleUpgrade = async (nextFacilityIndex: number) => {
    try {
      const hash = await writeContractAsync({
        address: MINING_ADDRESS as `0x${string}`,
        abi: MINING_ABI,
        functionName: 'buyNewFacility',
        args: [nextFacilityIndex],
        chain: chainId,
        account: address,
      });
      setUpgradeTxHash(hash as `0x${string}`);
      toast({
        title: 'Transaction sent!',
        description: 'Waiting for confirmation...',
        status: 'info',
        duration: 5000,
        isClosable: true
      });
    } catch (e: any) {
      toast({ 
        title: 'Upgrade failed', 
        description: e.message, 
        status: 'error', 
        duration: 5000, 
        isClosable: true 
      });
    }
  };

  // Add refetch function for miners
  const { refetch: refetchMiners } = useContractRead({
    address: MINING_ADDRESS as `0x${string}`,
    abi: MINING_ABI,
    functionName: 'getPlayerMinersPaginated',
    args: [address, 0, 100],
    query: {
      enabled: !!address
    }
  });

  const handleBuyMinerSuccess = () => {
    // Reset states
    setSelectedTile(null);
    setBuyModalOpen(false);
    
    // Refresh data
    refetchFacility();
    refetchMiners();
    
    // Refresh occupied coords with a small delay to ensure blockchain state is updated
    setTimeout(() => {
      fetchOccupiedCoords();
    }, 1000);
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
    if (isFacilityConfirming) {
      return (
        <Box minH="60vh" display="flex" flexDir="column" alignItems="center" justifyContent="center">
          <Spinner size="xl" color="#00E8FF" thickness="4px" speed="0.65s" />
          <Text mt={4} fontFamily="'Press Start 2P', monospace">loading</Text>
        </Box>
      );
    }
    if (isFacilityConfirmed) {
      return (
        <Box minH="60vh" display="flex" flexDir="column" alignItems="center" justifyContent="center">
          <Text fontFamily="'Press Start 2P', monospace" color="#00E8FF" fontSize="lg" mb={6}>
            Facility purchased!
          </Text>
          <Button
            rightIcon={<ArrowForwardIcon />}
            colorScheme="blue"
            bg="neon.blue"
            color="white"
            _hover={{ bg: 'neon.pink', boxShadow: '0 0 16px #FF00CC' }}
            fontFamily="'Press Start 2P', monospace"
            fontSize="md"
            px={8}
            py={6}
            borderRadius="md"
            border="2px solid"
            borderColor="neon.blue"
            _active={{ transform: 'scale(0.95)' }}
            onClick={() => window.location.reload()}
            transition="all 0.2s"
            sx={{ textShadow: '0 0 10px #00E8FF88, 0 0 20px #00E8FF44' }}
          >
            Start mining
          </Button>
        </Box>
      );
    }
    return (
      <Box
        bg="neon.panel"
        minH="60vh"
        display="flex"
        flexDir="column"
        alignItems="center"
        justifyContent="center"
        borderRadius="lg"
        border="2.5px solid"
        borderColor="neon.blue"
        boxShadow="0 0 16px #00E8FF, 0 0 32px #FF00CC55"
        mt={10}
        p={8}
        fontFamily="'Press Start 2P', monospace"
        position="relative"
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
        <Text
          color="#00E8FF"
          fontFamily="'Press Start 2P', monospace"
          fontSize="md"
          mb={2}
          textAlign="center"
          textShadow="0 0 8px #00E8FF"
          letterSpacing={1}
        >
          Buy Facility and start earning!
        </Text>
        <Text
          color="#fff"
          fontFamily="'Press Start 2P', monospace"
          fontSize="lg"
          mb={6}
          textAlign="center"
          textShadow="0 0 8px #00E8FF"
          letterSpacing={1}
        >
          YOU DON&apos;T HAVE A SPACE TO MINE!
        </Text>
        <VStack spacing={4} w="full" maxW="400px">
          <Box
            bg="#0F1117"
            p={4}
            borderRadius="md"
            border="1px solid"
            borderColor="neon.blue"
            w="full"
          >
            <Text color="neon.blue" fontSize="xs" mb={2} textShadow="0 0 8px #00E8FF">
              FREE MINER INCLUDED!
            </Text>
            <Text color="white" fontSize="xs" opacity={0.8}>
              After purchasing a facility, you will receive a free starter miner that will automatically mine tokens for you. No additional costs!
            </Text>
          </Box>
          <Input
            placeholder="Enter referrer address (optional)"
            value={referrerInput}
            onChange={(e) => {
              setReferrerInput(e.target.value);
              if (e.target.value) {
                validateReferrer(e.target.value);
              } else {
                setIsReferrerValid(true);
              }
            }}
            bg="#0F1117"
            borderColor={isReferrerValid ? "neon.blue" : "red.500"}
            color="white"
            _hover={{ borderColor: "neon.pink" }}
            _focus={{ borderColor: "neon.pink", boxShadow: "0 0 0 1px #FF00CC" }}
            fontFamily="'Press Start 2P', monospace"
            fontSize="xs"
            isInvalid={!isReferrerValid}
            _placeholder={{ color: "gray.500" }}
          />
          {!isReferrerValid && (
            <Text color="red.500" fontSize="xs" fontFamily="'Press Start 2P', monospace">
              Invalid Ethereum address
            </Text>
          )}
        </VStack>
        <HStack spacing={4} mt={6}>
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
            onClick={handleBuyFacility}
            isLoading={isPending}
            transition="all 0.2s"
            sx={{
              textShadow: '0 0 10px #00E8FF88, 0 0 20px #00E8FF44'
            }}
          >
            BUY FACILITY
          </Button>
          <Button
            colorScheme="pink"
            bg="neon.pink"
            color="white"
            _hover={{
              bg: 'neon.blue',
              boxShadow: '0 0 16px #00E8FF',
            }}
            fontFamily="'Press Start 2P', monospace"
            fontSize="xs"
            px={6}
            py={4}
            borderRadius="md"
            border="2px solid"
            borderColor="neon.pink"
            _active={{
              transform: 'scale(0.95)',
            }}
            as="a"
            href="https://pixelminer.gitbook.io/pixelminer-docs-1/"
            target="_blank"
            rel="noopener noreferrer"
            transition="all 0.2s"
            sx={{
              textShadow: '0 0 10px #FF00CC88, 0 0 20px #FF00CC44'
            }}
          >
            DOCS
          </Button>
        </HStack>
      </Box>
    );
  }
  if (!hasStarterMiner) {
    if (isClaimingLoading) {
      return (
        <Box minH="60vh" display="flex" flexDir="column" alignItems="center" justifyContent="center">
          <Spinner size="xl" color="#00E8FF" thickness="4px" speed="0.65s" />
          <Text mt={4} fontFamily="'Press Start 2P', monospace">loading</Text>
        </Box>
      );
    }
    if (isClaimingSuccess) {
      return (
        <Box minH="60vh" display="flex" flexDir="column" alignItems="center" justifyContent="center">
          <Text fontFamily="'Press Start 2P', monospace" color="#00E8FF" fontSize="lg" mb={6}>
            Free miner claimed!
          </Text>
          <Button
            rightIcon={<ArrowForwardIcon />}
            colorScheme="blue"
            bg="neon.blue"
            color="white"
            _hover={{ bg: 'neon.pink', boxShadow: '0 0 16px #FF00CC' }}
            fontFamily="'Press Start 2P', monospace"
            fontSize="md"
            px={8}
            py={6}
            borderRadius="md"
            border="2px solid"
            borderColor="neon.blue"
            _active={{ transform: 'scale(0.95)' }}
            onClick={() => window.location.reload()}
            transition="all 0.2s"
            sx={{ textShadow: '0 0 10px #00E8FF88, 0 0 20px #00E8FF44' }}
          >
            Start mining
          </Button>
        </Box>
      );
    }
    return (
      <Box bg="#181A20" minH="100vh" py={6} px={[2, 10]} fontFamily="'Press Start 2P', monospace" position="relative">
        <Grid templateColumns={["1fr", null, "360px 1fr"]} gap={8} maxW="1200px" mx="auto">
          {/* Lewa kolumna: statystyki starter minera */}
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
                STARTER MINER STATS
              </Text>
              {starterMinerData && Array.isArray(starterMinerData) && (
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Text color="gray.400" fontSize="xs">HASHRATE:</Text>
                    <Text color="neon.blue" fontSize="xs" textShadow="0 0 8px #00E8FF">{starterMinerData[4]?.toString()} GH/s</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color="gray.400" fontSize="xs">POWER:</Text>
                    <Text color="neon.blue" fontSize="xs" textShadow="0 0 8px #00E8FF">{starterMinerData[5]?.toString()} GW</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color="gray.400" fontSize="xs">IN PRODUCTION:</Text>
                    <Text color="neon.blue" fontSize="xs" textShadow="0 0 8px #00E8FF">{starterMinerData[7] ? 'YES' : 'NO'}</Text>
                  </HStack>
                </VStack>
              )}
            </Box>
          </VStack>

          {/* Prawa kolumna: grid i przycisk */}
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
                CLAIM YOUR FREE MINER
              </Text>
              <Box flex="1" overflow="hidden" position="relative" display="flex" alignItems="center" justifyContent="center" minH="380px">
                <MiningGrid
                  selected={starterMinerTile}
                  onSelect={setStarterMinerTile}
                  minerTiles={[]}
                  starterMinerTile={starterMinerTile}
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
                  onClick={handleClaimStarterMiner}
                  isLoading={isPending}
                  isDisabled={!starterMinerTile}
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
                  transition="all 0.2s"
                  sx={{
                    textShadow: '0 0 10px #00E8FF88, 0 0 20px #00E8FF44'
                  }}
                >
                  CLAIM FREE MINER
                </Button>
              </Box>
            </Box>
          </VStack>
        </Grid>
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
              PIXELMINER VIRTUAL MACHINE
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
        onSuccess={handleBuyMinerSuccess}
      />
      <UpgradeFacilityModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        currentFacilityIndex={currentFacilityIndex}
        nextFacilityIndex={nextFacilityIndex}
        onUpgrade={handleUpgrade}
      />
      {isUpgradeLoading && (
        <Box minH="60vh" display="flex" flexDir="column" alignItems="center" justifyContent="center" position="fixed" top={0} left={0} right={0} bottom={0} zIndex={2000} bg="rgba(24,26,32,0.85)">
          <Spinner size="xl" color="#00E8FF" thickness="4px" speed="0.65s" />
          <Text mt={4} fontFamily="'Press Start 2P', monospace">loading</Text>
        </Box>
      )}
      {isUpgradeSuccess && (
        <Box minH="60vh" display="flex" flexDir="column" alignItems="center" justifyContent="center" position="fixed" top={0} left={0} right={0} bottom={0} zIndex={2000} bg="rgba(24,26,32,0.85)">
          <Text fontFamily="'Press Start 2P', monospace" color="#00E8FF" fontSize="lg" mb={6}>
            Facility upgraded!
          </Text>
          <Button
            rightIcon={<ArrowForwardIcon />}
            colorScheme="blue"
            bg="neon.blue"
            color="white"
            _hover={{ bg: 'neon.pink', boxShadow: '0 0 16px #FF00CC' }}
            fontFamily="'Press Start 2P', monospace"
            fontSize="md"
            px={8}
            py={6}
            borderRadius="md"
            border="2px solid"
            borderColor="neon.blue"
            _active={{ transform: 'scale(0.95)' }}
            onClick={() => window.location.reload()}
            transition="all 0.2s"
            sx={{ textShadow: '0 0 10px #00E8FF88, 0 0 20px #00E8FF44' }}
          >
            Go to next lvl
          </Button>
        </Box>
      )}
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