import { useWeb3React } from '@web3-react/core';
import { Box, Button, Grid, Heading, Text, VStack, useToast } from '@chakra-ui/react';
import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import { useEthermaxMining } from '../hooks/useEthermaxMining';

const MINING_CONTRACT_ADDRESS = 'YOUR_DEPLOYED_CONTRACT_ADDRESS';

export default function MiningRoom() {
  const { account, library } = useWeb3React();
  const [isConnected, setIsConnected] = useState(false);
  const [miningPower, setMiningPower] = useState(0);
  const [pendingRewards, setPendingRewards] = useState('0');
  const toast = useToast();

  const { 
    mine,
    claimRewards,
    getMiningPower,
    getPendingRewards
  } = useEthermaxMining(MINING_CONTRACT_ADDRESS);

  useEffect(() => {
    if (account && library) {
      setIsConnected(true);
      loadMiningData();
    } else {
      setIsConnected(false);
    }
  }, [account, library]);

  const loadMiningData = async () => {
    if (!account || !library) return;

    try {
      const power = await getMiningPower(account);
      const rewards = await getPendingRewards(account);
      
      setMiningPower(power);
      setPendingRewards(ethers.utils.formatEther(rewards));
    } catch (error) {
      console.error('Error loading mining data:', error);
    }
  };

  const handleMine = async () => {
    if (!account) return;

    try {
      const tx = await mine();
      await tx.wait();
      
      toast({
        title: 'Mining successful',
        status: 'success',
        duration: 5000,
      });
      
      loadMiningData();
    } catch (error) {
      console.error('Error mining:', error);
      toast({
        title: 'Mining failed',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleClaimRewards = async () => {
    if (!account) return;

    try {
      const tx = await claimRewards();
      await tx.wait();
      
      toast({
        title: 'Rewards claimed successfully',
        status: 'success',
        duration: 5000,
      });
      
      loadMiningData();
    } catch (error) {
      console.error('Error claiming rewards:', error);
      toast({
        title: 'Failed to claim rewards',
        status: 'error',
        duration: 5000,
      });
    }
  };

  if (!isConnected) {
    return (
      <Box textAlign="center" py={10}>
        <Heading>Please connect your wallet to start mining</Heading>
      </Box>
    );
  }

  return (
    <VStack spacing={8} w="full">
      <Heading>Mining Room</Heading>
      
      <Grid templateColumns="repeat(2, 1fr)" gap={6} w="full">
        <Box p={6} borderWidth={1} borderRadius="lg">
          <VStack spacing={4}>
            <Text fontSize="xl">Mining Power</Text>
            <Text fontSize="2xl">{miningPower}</Text>
            <Button colorScheme="blue" onClick={handleMine}>
              Mine
            </Button>
          </VStack>
        </Box>

        <Box p={6} borderWidth={1} borderRadius="lg">
          <VStack spacing={4}>
            <Text fontSize="xl">Pending Rewards</Text>
            <Text fontSize="2xl">{pendingRewards} ETH</Text>
            <Button colorScheme="green" onClick={handleClaimRewards}>
              Claim Rewards
            </Button>
          </VStack>
        </Box>
      </Grid>
    </VStack>
  );
} 