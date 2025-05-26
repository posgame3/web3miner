import React, { useEffect } from 'react';
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
  Center,
} from '@chakra-ui/react';
import { useAccount, useBalance, useContractRead, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { MINING_ADDRESS, MINING_ABI, ETHERMAX_ADDRESS, ETHERMAX_ABI } from '../config/contracts';
import { formatEther, parseEther } from 'viem';
import { writeContract } from '@wagmi/core';

interface UpgradeFacilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFacilityIndex: number;
  nextFacilityIndex: number;
  onUpgrade: (nextFacilityIndex: number) => void;
}

interface Facility {
  facilityIndex: bigint;
  maxMiners: bigint;
  totalPowerOutput: bigint;
  x: bigint;
  y: bigint;
  currMiners: bigint;
  currPowerOutput: bigint;
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

const UpgradeFacilityModal: React.FC<UpgradeFacilityModalProps> = ({ 
  isOpen, 
  onClose, 
  currentFacilityIndex, 
  nextFacilityIndex,
  onUpgrade 
}) => {
  const toast = useToast();
  const { address } = useAccount();

  // Fix contract write hook
  const { writeContractAsync, data: hash, isPending: isUpgrading } = useWriteContract();

  // Add transaction receipt hook
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Current facility data
  const { data: currentFacility } = useContractRead({
    address: MINING_ADDRESS as `0x${string}`,
    abi: MINING_ABI,
    functionName: 'ownerToFacility',
    args: [address],
    query: { enabled: isOpen },
  }) as { data: [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint] | undefined };

  // Log facility data
  useEffect(() => {
    if (currentFacility) {
      const facilityData: FacilityData = {
        facilityIndex: Number(currentFacility[0]),
        level: Number(currentFacility[1]),
        power: Number(currentFacility[2]),
        space: Number(currentFacility[3]),
        x: Number(currentFacility[4]),
        y: Number(currentFacility[5]),
        currMiners: Number(currentFacility[6]),
        currPowerOutput: Number(currentFacility[7])
      };
    }
  }, [currentFacility]);

  // Next level facility data
  const { data: nextFacility } = useContractRead({
    address: MINING_ADDRESS as `0x${string}`,
    abi: MINING_ABI,
    functionName: 'facilities',
    args: [nextFacilityIndex],
    query: { enabled: isOpen },
  }) as { data: Facility | undefined };

  // MAXX balance
  const { data: maxxBalance } = useBalance({ address, token: ETHERMAX_ADDRESS });

  // Fixed cost for level 2 upgrade
  const fixedUpgradeCost = BigInt(1440 * 10**18); // 1440 MAXX in wei
  const hasEnoughBalance = maxxBalance && maxxBalance.value >= fixedUpgradeCost;

  const { data: allowance, refetch: refetchAllowance } = useContractRead({
    address: ETHERMAX_ADDRESS as `0x${string}`,
    abi: ETHERMAX_ABI,
    functionName: 'allowance',
    args: [address, MINING_ADDRESS],
    query: { enabled: !!address },
  });
  const { writeContractAsync: writeApprove, isPending: isApproving } = useWriteContract();
  const hasEnoughAllowance = allowance && typeof allowance === 'bigint' && allowance >= fixedUpgradeCost;

  const handleApprove = async () => {
    try {
      await writeApprove({
        address: ETHERMAX_ADDRESS as `0x${string}`,
        abi: ETHERMAX_ABI,
        functionName: 'approve',
        args: [MINING_ADDRESS, parseEther('1000000')],
      });
      toast({
        title: 'Approving MAXX tokens...',
        description: 'Please confirm the transaction in your wallet',
        status: 'info',
        duration: 5000,
        isClosable: true,
      });
      if (refetchAllowance) refetchAllowance();
    } catch (error: any) {
      toast({
        title: 'Approval failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleUpgrade = async () => {
    if (!hasEnoughBalance) {
      toast({ title: 'Not enough MAXX', status: 'error' });
      return;
    }

    try {
      if (!writeContractAsync) {
        toast({ 
          title: 'Cannot prepare transaction', 
          status: 'error', 
          duration: 5000, 
          isClosable: true 
        });
        return;
      }

      const tx = {
        address: MINING_ADDRESS as `0x${string}`,
        abi: MINING_ABI,
        functionName: 'buyNewFacility',
        args: []
      };
      
      const hash = await writeContractAsync(tx);
      
      toast({ 
        title: 'Confirm upgrade in MetaMask', 
        status: 'info', 
        duration: 5000, 
        isClosable: true 
      });

      // Wait for transaction to be mined
      const receipt = await window.ethereum.request({
        method: 'eth_getTransactionReceipt',
        params: [hash],
      });

      if (receipt) {
        onUpgrade(nextFacilityIndex);
        onClose();
        // Force page reload after successful upgrade
        window.location.reload();
      }
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

  // Remove the useEffect for isSuccess since we handle it in handleUpgrade
  useEffect(() => {
  }, [currentFacilityIndex, nextFacilityIndex]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
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
        <ModalHeader color="#fff" textShadow="0 0 8px #00E8FF">UPGRADE FACILITY</ModalHeader>
        <ModalCloseButton color="#fff" _hover={{ color: 'neon.pink' }} />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Box>
              <Text color="#fff" fontSize="sm" mb={2} textShadow="0 0 8px #00E8FF">CURRENT FACILITY</Text>
              <Box
                p={4}
                borderRadius="md"
                border="2px solid"
                borderColor="neon.blue"
                bg="neon.dark"
              >
                <Text color="#fff" fontSize="xs" mb={2} textShadow="0 0 8px #00E8FF">LEVEL {currentFacilityIndex}</Text>
                <Text color="#fff" fontSize="xs">POWER: <span style={{ color: '#00E8FF', textShadow: '0 0 8px #00E8FF' }}>28 W</span></Text>
                <Text color="#fff" fontSize="xs">SPACE: <span style={{ color: '#00E8FF', textShadow: '0 0 8px #00E8FF' }}>4 UNITS</span></Text>
              </Box>
            </Box>

            <Box>
              <Text color="#fff" fontSize="sm" mb={2} textShadow="0 0 8px #00E8FF">NEXT LEVEL</Text>
              <Box
                p={4}
                borderRadius="md"
                border="2px solid"
                borderColor="neon.blue"
                bg="neon.dark"
              >
                <Text color="#fff" fontSize="xs" mb={2} textShadow="0 0 8px #00E8FF">LEVEL {nextFacilityIndex + 1}</Text>
                <Text color="#fff" fontSize="xs">POWER: <span style={{ color: '#00E8FF', textShadow: '0 0 8px #00E8FF' }}>72 W</span></Text>
                <Text color="#fff" fontSize="xs">SPACE: <span style={{ color: '#00E8FF', textShadow: '0 0 8px #00E8FF' }}>8 UNITS</span></Text>
              </Box>
            </Box>

            <Box>
              <Text color="#fff" fontSize="sm" mb={2} textShadow="0 0 8px #00E8FF">UPGRADE COST</Text>
              <Text color="gray.400" fontSize="sm">
                TOTAL COST: {formatEther(fixedUpgradeCost)} PXL
              </Text>
            </Box>

            <Box>
              <Text color="#fff" fontSize="sm" mb={2} textShadow="0 0 8px #00E8FF">YOUR BALANCE</Text>
              <Text color="#fff" fontSize="sm">
                PXL BALANCE: <span style={{ color: '#00E8FF', textShadow: '0 0 8px #00E8FF' }}>{maxxBalance ? Number(maxxBalance.formatted).toFixed(2) : '0'}</span>
              </Text>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Center w="100%">
            {!hasEnoughAllowance ? (
              <Button
                colorScheme="blue"
                bg="neon.blue"
                color="white"
                _hover={{ bg: 'neon.pink', boxShadow: '0 0 16px #FF00CC' }}
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
                _active={{ transform: 'scale(0.95)' }}
                transition="all 0.2s"
                sx={{ textShadow: '0 0 10px #00E8FF88, 0 0 20px #00E8FF44' }}
                isDisabled={!hasEnoughBalance}
              >
                APPROVE PXL
              </Button>
            ) : (
              <Button
                colorScheme="blue"
                bg="neon.blue"
                color="white"
                _hover={{ bg: 'neon.pink', boxShadow: '0 0 16px #FF00CC' }}
                onClick={handleUpgrade}
                isLoading={isUpgrading || isConfirming}
                loadingText={isUpgrading ? "CONFIRMING..." : "UPGRADING..."}
                fontFamily="'Press Start 2P', monospace"
                fontSize="xs"
                px={6}
                py={4}
                borderRadius="md"
                border="2px solid"
                borderColor="neon.blue"
                _active={{ transform: 'scale(0.95)' }}
                transition="all 0.2s"
                sx={{ textShadow: '0 0 10px #00E8FF88, 0 0 20px #00E8FF44' }}
                isDisabled={!hasEnoughBalance}
              >
                UPGRADE TO LEVEL {nextFacilityIndex}
              </Button>
            )}
          </Center>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UpgradeFacilityModal; 