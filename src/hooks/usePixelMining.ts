import { useContractRead, useContractWrite, useWaitForTransaction } from 'wagmi';
import { MINING_ADDRESS, MINING_ABI } from '../config/contracts';
import { parseEther } from 'viem';

export const usePixelMining = () => {
  const { data: pendingRewards, refetch: refetchPendingRewards } = useContractRead({
    address: MINING_ADDRESS as `0x${string}`,
    abi: MINING_ABI,
    functionName: 'pendingRewards',
  });

  const { data: claimTx, write: claimRewards } = useContractWrite({
    address: MINING_ADDRESS as `0x${string}`,
    abi: MINING_ABI,
    functionName: 'claimRewards',
  });

  const { isLoading: isClaiming } = useWaitForTransaction({
    hash: claimTx?.hash,
  });

  const handleClaimRewards = async () => {
    try {
      await claimRewards();
      await refetchPendingRewards();
    } catch (error) {
      console.error('Error claiming rewards:', error);
    }
  };

  return {
    pendingRewards,
    refetchPendingRewards,
    handleClaimRewards,
    isClaiming,
  };
}; 