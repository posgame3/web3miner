import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Box,
} from '@chakra-ui/react';
import { useContractRead } from 'wagmi';
import { MINING_ADDRESS, MINING_ABI } from '../config/contracts';

interface MinerInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  coords: { x: number; y: number } | null;
  address: `0x${string}` | undefined;
}

const MinerInfoModal = ({ isOpen, onClose, coords, address }: MinerInfoModalProps) => {
  console.log('MinerInfoModal - coords:', coords);
  console.log('MinerInfoModal - address:', address);

  const { data: isOccupied } = useContractRead({
    address: MINING_ADDRESS as `0x${string}`,
    abi: MINING_ABI,
    functionName: 'playerOccupiedCoords',
    args: [address, coords?.x, coords?.y],
    query: {
      enabled: !!address && coords?.x !== undefined && coords?.y !== undefined,
    },
  });

  const { data: miners } = useContractRead({
    address: MINING_ADDRESS as `0x${string}`,
    abi: MINING_ABI,
    functionName: 'getPlayerMinersPaginated',
    args: [address, 0, 100],
    query: {
      enabled: !!address && isOccupied === true,
    },
  });

  console.log('MinerInfoModal - isOccupied:', isOccupied);
  console.log('MinerInfoModal - miners:', miners);
  
  if (miners) {
    console.log('MinerInfoModal - miners array length:', miners.length);
    miners.forEach((miner: any, index: number) => {
      console.log(`MinerInfoModal - miner ${index}:`, {
        x: miner.x.toString(),
        y: miner.y.toString(),
        hashrate: miner.hashrate.toString(),
        powerConsumption: miner.powerConsumption.toString(),
        inProduction: miner.inProduction
      });
    });
  }

  const currentMiner = miners?.find(
    (miner: any) => {
      const match = miner.x.toString() === coords?.x?.toString() && 
                   miner.y.toString() === coords?.y?.toString();
      console.log('MinerInfoModal - comparing:', {
        minerX: miner.x.toString(),
        minerY: miner.y.toString(),
        coordsX: coords?.x?.toString(),
        coordsY: coords?.y?.toString(),
        match
      });
      return match;
    }
  );

  console.log('MinerInfoModal - currentMiner:', currentMiner);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent
        bg="neon.panel"
        borderRadius="lg"
        border="2.5px solid"
        borderColor="neon.blue"
        boxShadow="0 0 16px #00E8FF, 0 0 32px #FF00CC55"
        fontFamily="'Press Start 2P', monospace"
      >
        <ModalHeader color="#fff" textShadow="0 0 8px #00E8FF">
          MINER INFORMATION
        </ModalHeader>
        <ModalCloseButton color="#fff" />
        <ModalBody pb={6}>
          {isOccupied && currentMiner ? (
            <VStack spacing={4} align="start">
              <HStack>
                <Text color="white" fontSize="xs">POSITION:</Text>
                <Text color="white" fontSize="xs" fontWeight="bold" textShadow="0 0 8px #00E8FF">
                  X: {coords?.x}, Y: {coords?.y}
                </Text>
              </HStack>
              <HStack>
                <Text color="white" fontSize="xs">HASHRATE:</Text>
                <Text color="white" fontSize="xs" fontWeight="bold" textShadow="0 0 8px #00E8FF">
                  {currentMiner.hashrate.toString()} GH/s
                </Text>
              </HStack>
              <HStack>
                <Text color="white" fontSize="xs">POWER USAGE:</Text>
                <Text color="white" fontSize="xs" fontWeight="bold" textShadow="0 0 8px #00E8FF">
                  {currentMiner.powerConsumption.toString()} GW
                </Text>
              </HStack>
              <HStack>
                <Text color="white" fontSize="xs">STATUS:</Text>
                <Text color="white" fontSize="xs" fontWeight="bold" textShadow="0 0 8px #00E8FF">
                  {currentMiner.inProduction ? 'ACTIVE' : 'INACTIVE'}
                </Text>
              </HStack>
            </VStack>
          ) : (
            <Text color="white" fontSize="xs">No miner at this position</Text>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default MinerInfoModal; 