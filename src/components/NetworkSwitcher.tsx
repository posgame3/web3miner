import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useChainId, useSwitchChain } from 'wagmi';
import { base } from 'wagmi/chains';

const NetworkSwitcher = () => {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    if (isConnected && chainId && chainId !== base.id) {
      console.log('Switching to Base network...');
      switchChain?.({ chainId: base.id });
    }
  }, [isConnected, chainId, switchChain]);

  return null; // This component doesn't render anything
};

export default NetworkSwitcher; 