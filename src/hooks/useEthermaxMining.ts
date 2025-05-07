import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import { useCallback } from 'react';
import EthermaxMiningABI from '../contracts/EthermaxMining.json';

export function useEthermaxMining(contractAddress: string) {
  const { library, account } = useWeb3React();

  const getContract = useCallback(() => {
    if (!library || !account) return null;
    return new ethers.Contract(contractAddress, EthermaxMiningABI, library.getSigner());
  }, [library, account, contractAddress]);

  const mine = useCallback(async () => {
    const contract = getContract();
    if (!contract) throw new Error('Contract not initialized');
    return contract.mine();
  }, [getContract]);

  const claimRewards = useCallback(async () => {
    const contract = getContract();
    if (!contract) throw new Error('Contract not initialized');
    return contract.claimRewards();
  }, [getContract]);

  const getMiningPower = useCallback(async (address: string) => {
    const contract = getContract();
    if (!contract) throw new Error('Contract not initialized');
    return contract.getMiningPower(address);
  }, [getContract]);

  const getPendingRewards = useCallback(async (address: string) => {
    const contract = getContract();
    if (!contract) throw new Error('Contract not initialized');
    return contract.pendingRewards(address);
  }, [getContract]);

  return {
    mine,
    claimRewards,
    getMiningPower,
    getPendingRewards
  };
} 