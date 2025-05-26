import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Box,
  useToast,
  Spinner,
  SimpleGrid,
} from '@chakra-ui/react';
import { TileCoords } from './MiningGrid';
import { useAccount, useBalance, useContractRead, useContractWrite, useWaitForTransactionReceipt } from 'wagmi';
import { MINING_ADDRESS, MINING_ABI, ETHERMAX_ADDRESS, ETHERMAX_ABI } from '../config/contracts';
import { parseEther, formatEther } from 'viem';
import { FaLaptop, FaServer, FaDesktop, FaMicrochip } from 'react-icons/fa';

// Type for miner data from contract
interface MinerData {
  id: bigint;
  x: bigint;
  y: bigint;
  minerIndex: bigint;
  hashrate: bigint;
  powerConsumption: bigint;
  cost: bigint;
  inProduction: boolean;
}

// Przykładowe typy minerów (do pobrania z kontraktu)
const MINER_TYPE_IDS = [0, 1, 2];
const MINER_TYPE_LABELS = ['Gaming PC', 'Hacking PC', 'Master Race'];
const MINER_TYPE_PRICES = [120, 220, 402];
const MINER_TYPE_HASHRATE = [320, 600, 920];
const MINER_TYPE_ENERGY = [12, 18, 22];

interface BuyMinerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTile: TileCoords | null;
  onBuy: (minerIndex: number, tile: TileCoords) => void;
  onSuccess?: () => void;
}

const BuyMinerModal: React.FC<BuyMinerModalProps> = ({ isOpen, onClose, selectedTile, onBuy, onSuccess }) => {
  const [selectedType, setSelectedType] = useState(0);
  const toast = useToast();
  const { address } = useAccount();

  // Saldo MAXX
  const { data: maxxBalance } = useBalance({ address, token: ETHERMAX_ADDRESS });

  // Allowance
  const { data: allowance, refetch: refetchAllowance, isLoading: isAllowanceLoading } = useContractRead({
    address: ETHERMAX_ADDRESS as `0x${string}`,
    abi: ETHERMAX_ABI,
    functionName: 'allowance',
    args: [address, MINING_ADDRESS],
    query: { enabled: !!address },
  });

  // Get miner data for all types
  const { data: minerData1 } = useContractRead({
    address: MINING_ADDRESS as `0x${string}`,
    abi: MINING_ABI,
    functionName: 'miners',
    args: [2], // Gaming PC
    query: { enabled: !!address }
  });

  const { data: minerData2 } = useContractRead({
    address: MINING_ADDRESS as `0x${string}`,
    abi: MINING_ABI,
    functionName: 'miners',
    args: [3], // Hacking PC
    query: { enabled: !!address }
  });

  const { data: minerData3 } = useContractRead({
    address: MINING_ADDRESS as `0x${string}`,
    abi: MINING_ABI,
    functionName: 'miners',
    args: [4], // Master Race
    query: { enabled: !!address }
  });

  // Convert miner data arrays
  const minerArray1 = minerData1 as unknown as [bigint, bigint, bigint, bigint, bigint, bigint, bigint, boolean] | undefined;
  const minerArray2 = minerData2 as unknown as [bigint, bigint, bigint, bigint, bigint, bigint, bigint, boolean] | undefined;
  const minerArray3 = minerData3 as unknown as [bigint, bigint, bigint, bigint, bigint, bigint, bigint, boolean] | undefined;

  // Get current selected miner data
  const currentMinerArray = [minerArray1, minerArray2, minerArray3][selectedType];
  
  // Get cost directly from contract or use default
  const costInWei = currentMinerArray ? currentMinerArray[6] : BigInt(MINER_TYPE_PRICES[selectedType] * 1e18);
  const totalCost = Number(costInWei) / 1e18;
  
  const totalHashrate = currentMinerArray ? Number(currentMinerArray[4]) : MINER_TYPE_HASHRATE[selectedType];
  const totalPower = currentMinerArray ? Number(currentMinerArray[5]) : MINER_TYPE_ENERGY[selectedType];

  // Reset type when modal opens
  useEffect(() => {
    setSelectedType(0);
    if (refetchAllowance) refetchAllowance();
  }, [isOpen]);

  // Cena wybranego minera - use the contract value directly
  const minerPrice = costInWei;
  const hasEnoughBalance = maxxBalance && maxxBalance.value && maxxBalance.value >= minerPrice;
  const hasEnoughAllowance = allowance && typeof allowance === 'bigint' && allowance >= minerPrice;

  // Approve MAXX
  const { writeContract: writeApprove, isPending: isApproving } = useContractWrite();

  // Kupno minera
  const { writeContract, data: hash, isPending: isBuying } = useContractWrite();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const [buyTxHash, setBuyTxHash] = useState<`0x${string}` | undefined>(undefined);
  const { isLoading: isBuyingLoading, isSuccess: isBuyingSuccess } = useWaitForTransactionReceipt({
    hash: buyTxHash,
  });

  const handleApprove = async () => {
    try {
      console.log('Approving MAXX tokens...');
      await writeApprove({
        address: ETHERMAX_ADDRESS as `0x${string}`,
        abi: ETHERMAX_ABI,
        functionName: 'approve',
        args: [MINING_ADDRESS, parseEther('1000000')],
      });
      
      console.log('Approval transaction sent');
      toast({ 
        title: 'Approving MAXX tokens...',
        description: 'Please confirm the transaction in your wallet',
        status: 'info',
        duration: 5000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error('Approval error:', error);
      toast({
        title: 'Approval failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleBuy = async () => {
    if (!selectedTile) {
      toast({ title: 'Select a tile first!', status: 'warning' });
      return;
    }
    if (!hasEnoughBalance) {
      toast({ title: 'Not enough PXL', status: 'error' });
      return;
    }
    if (!hasEnoughAllowance) {
      toast({ title: 'Approve PXL first', status: 'warning' });
      return;
    }

    try {
      const tx = {
        address: MINING_ADDRESS as `0x${string}`,
        abi: MINING_ABI,
        functionName: 'buyMiner',
        args: [selectedType + 2, selectedTile.x, selectedTile.y],
      };
      const hash = await writeContract(tx);
      setBuyTxHash(hash as `0x${string}`);
      toast({
        title: 'Transaction sent!',
        description: 'Waiting for confirmation...',
        status: 'info',
        duration: 5000,
        isClosable: true
      });
    } catch (error: any) {
      console.error('Buy error:', error);
      toast({
        title: 'Purchase failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    if (isBuyingSuccess) {
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    }
  }, [isBuyingSuccess, onClose, onSuccess]);

  const getMinerIcon = (index: number) => {
    switch (index) {
      case 0:
        return <span role="img" aria-label="basic-miner" style={{ fontSize: 32, filter: 'drop-shadow(0 0 6px #00E8FF)' }}>💻</span>;
      case 1:
        return <span role="img" aria-label="advanced-miner" style={{ fontSize: 32, filter: 'drop-shadow(0 0 6px #00E8FF)' }}>🖥️</span>;
      case 2:
        return <span role="img" aria-label="pro-miner" style={{ fontSize: 32, filter: 'drop-shadow(0 0 6px #00E8FF)' }}>⚡</span>;
      default:
        return <span role="img" aria-label="miner" style={{ fontSize: 32, filter: 'drop-shadow(0 0 6px #00E8FF)' }}>💻</span>;
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <>
      {isBuyingLoading && (
        <Box minH="60vh" display="flex" flexDir="column" alignItems="center" justifyContent="center" position="fixed" top={0} left={0} right={0} bottom={0} zIndex={2000} bg="rgba(24,26,32,0.85)">
          <Spinner size="xl" color="#00E8FF" thickness="4px" speed="0.65s" />
          <Text mt={4} fontFamily="'Press Start 2P', monospace">loading</Text>
        </Box>
      )}
      <Modal isOpen={isOpen} onClose={handleClose} isCentered>
        <ModalOverlay backdropFilter="blur(8px)" bg="blackAlpha.800" />
        <ModalContent
          bg="neon.panel"
          borderRadius="lg"
          border="2.5px solid"
          borderColor="neon.blue"
          boxShadow="0 0 16px #00E8FF, 0 0 32px #FF00CC55"
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
          <ModalHeader color="#fff" textShadow="0 0 8px #00E8FF">BUY MINER</ModalHeader>
          <ModalCloseButton color="#fff" _hover={{ color: 'neon.pink' }} />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Box>
                <Text color="#fff" fontSize="sm" mb={2} textShadow="0 0 8px #00E8FF">SELECT MINER TYPE</Text>
                <VStack spacing={2} align="stretch">
                  {MINER_TYPE_IDS.map((id) => {
                    const minerArray = [minerArray1, minerArray2, minerArray3][id];
                    const hashrate = minerArray ? Number(minerArray[4]) : MINER_TYPE_HASHRATE[id];
                    const power = minerArray ? Number(minerArray[5]) : MINER_TYPE_ENERGY[id];
                    const cost = minerArray ? Number(minerArray[6]) / 1e18 : MINER_TYPE_PRICES[id];

                    return (
                      <Box
                        key={id}
                        p={4}
                        borderRadius="md"
                        border="2px solid"
                        borderColor={selectedType === id ? 'neon.blue' : 'gray.600'}
                        bg={selectedType === id ? 'neon.dark' : 'transparent'}
                        cursor="pointer"
                        onClick={() => setSelectedType(id)}
                        _hover={{
                          borderColor: 'neon.blue',
                          boxShadow: '0 0 8px #00E8FF',
                        }}
                        transition="all 0.2s"
                      >
                        <HStack spacing={4} align="center">
                          <Box>
                            {getMinerIcon(id)}
                          </Box>
                          <VStack align="start" spacing={1} flex={1}>
                            <Text color="#fff" fontSize="sm" textShadow="0 0 8px #00E8FF">{MINER_TYPE_LABELS[id]}</Text>
                            <HStack spacing={4}>
                              <Text color="#fff" fontSize="xs">HASHRATE: <span style={{ color: '#00E8FF', textShadow: '0 0 8px #00E8FF' }}>{hashrate} GH/s</span></Text>
                              <Text color="#fff" fontSize="xs">POWER: <span style={{ color: '#00E8FF', textShadow: '0 0 8px #00E8FF' }}>{power} GW</span></Text>
                              <Text color="#fff" fontSize="xs">PRICE: <span style={{ color: '#00E8FF', textShadow: '0 0 8px #00E8FF' }}>{cost} PXL</span></Text>
                            </HStack>
                          </VStack>
                        </HStack>
                      </Box>
                    );
                  })}
                </VStack>
              </Box>

              <Box mt={4}>
                <Text color="#fff" fontSize="sm" mb={2} textShadow="0 0 8px #00E8FF">TOTAL</Text>
                <VStack align="start" spacing={1}>
                  <Text color="#fff" fontSize="sm">
                    TOTAL COST: <span style={{ color: '#00E8FF', textShadow: '0 0 8px #00E8FF' }}>{totalCost} PXL</span>
                  </Text>
                  <Text color="#fff" fontSize="sm">
                    TOTAL HASHRATE: <span style={{ color: '#00E8FF', textShadow: '0 0 8px #00E8FF' }}>{totalHashrate} GH/s</span>
                  </Text>
                  <Text color="#fff" fontSize="sm">
                    TOTAL POWER: <span style={{ color: '#00E8FF', textShadow: '0 0 8px #00E8FF' }}>{totalPower} GW</span>
                  </Text>
                </VStack>
              </Box>

              <Box mt={4}>
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Text color="#00E8FF" fontSize="sm" fontWeight="bold" textShadow="0 0 8px #00E8FF">BALANCE:</Text>
                    <Text color={hasEnoughBalance ? '#00FF99' : '#FF00CC'} fontSize="sm" fontWeight="bold" textShadow="0 0 8px #00E8FF">
                      {maxxBalance ? Number(maxxBalance.formatted).toFixed(2) : '0'} PXL
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color="#00E8FF" fontSize="sm" fontWeight="bold" textShadow="0 0 8px #00E8FF">COST:</Text>
                    <Text color="#00E8FF" fontSize="sm" fontWeight="bold" textShadow="0 0 8px #00E8FF">{totalCost} PXL</Text>
                  </HStack>
                </VStack>
              </Box>

              <Box mt={4}>
                {!hasEnoughAllowance ? (
                  <Button
                    w="full"
                    colorScheme="blue"
                    bg="neon.blue"
                    color="white"
                    _hover={{
                      bg: 'neon.pink',
                      boxShadow: '0 0 16px #FF00CC',
                    }}
                    onClick={handleApprove}
                    isLoading={isApproving}
                    loadingText="Approving..."
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
                    APPROVE PXL
                  </Button>
                ) : (
                  <Button
                    w="full"
                    colorScheme="blue"
                    bg="neon.blue"
                    color="white"
                    _hover={{
                      bg: 'neon.pink',
                      boxShadow: '0 0 16px #FF00CC',
                    }}
                    onClick={handleBuy}
                    isLoading={isBuying || isConfirming}
                    loadingText={isBuying ? "Buying..." : "Confirming..."}
                    isDisabled={!hasEnoughBalance}
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
                    BUY MINER
                  </Button>
                )}
              </Box>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default BuyMinerModal; 