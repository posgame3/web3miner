import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  Badge,
  SimpleGrid,
} from '@chakra-ui/react';
import { useAccount, useContractRead } from 'wagmi';
import { MINING_ADDRESS, MINING_ABI } from '../config/contracts';
import { formatEther } from 'viem';
import { useSearchParams } from 'react-router-dom';

const ReferralSystem = () => {
  const { address } = useAccount();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const [isCopied, setIsCopied] = useState(false);

  const neon = {
    blue: '#00E8FF',
    pink: '#FF2E63',
    purple: '#B026FF',
    green: '#00FF9D',
    panel: '#181A20',
    text: '#FFFFFF',
    border: '#2D3748'
  };

  // Handle referral code from URL
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      console.log('Saving referral code:', refCode);
      localStorage.setItem('referrer', refCode);
      toast({
        title: 'Referral code detected',
        description: 'Your referral code has been saved',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [searchParams, toast]);

  // Get referral data with proper type checking
  const { data: referralBonusPaid } = useContractRead({
    address: MINING_ADDRESS as `0x${string}`,
    abi: MINING_ABI,
    functionName: 'referralBonusPaid',
    args: [address],
    query: { enabled: !!address },
  });

  const { data: referredUsers } = useContractRead({
    address: MINING_ADDRESS as `0x${string}`,
    abi: MINING_ABI,
    functionName: 'getReferrals',
    args: [address],
    query: { enabled: !!address },
  });

  const { data: referralFee } = useContractRead({
    address: MINING_ADDRESS as `0x${string}`,
    abi: MINING_ABI,
    functionName: 'referralFee',
  });

  // Copy referral link
  const handleCopyReferral = () => {
    const referralLink = `${window.location.origin}?ref=${address}`;
    navigator.clipboard.writeText(referralLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    toast({
      title: 'Copied!',
      description: 'Referral link copied to clipboard',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} w="full">
      {/* Stats Section */}
      <Box
        p={6}
        borderRadius="lg"
        border="2px solid"
        borderColor={neon.blue}
        bg={neon.panel}
        boxShadow={`0 0 16px ${neon.blue}, 0 0 32px ${neon.purple}55`}
        fontFamily="'Press Start 2P', monospace"
        position="relative"
        _before={{
          content: '""',
          position: 'absolute',
          inset: 0,
          borderRadius: "lg",
          boxShadow: `0 0 32px 4px ${neon.blue}, 0 0 64px 8px ${neon.purple}55`,
          pointerEvents: "none",
          opacity: 0.5,
          zIndex: 0,
        }}
      >
        <VStack spacing={6} align="stretch">
          <Text color={neon.blue} fontSize="xl" sx={{ textShadow: `0 0 10px ${neon.blue}88, 0 0 20px ${neon.blue}44` }}>
            YOUR STATS
          </Text>
          <Divider borderColor={neon.blue} />
          <SimpleGrid columns={2} spacing={4}>
            <Stat>
              <StatLabel color={neon.pink}>Total Earnings</StatLabel>
              <StatNumber color={neon.text}>
                {referralBonusPaid ? formatEther(referralBonusPaid as bigint) : '0'} PXL
              </StatNumber>
              <StatHelpText color={neon.blue}>
                {referralFee ? `${Number(referralFee as bigint) / 1e16}%` : '2.5%'} of referrals' rewards
              </StatHelpText>
            </Stat>
            <Stat>
              <StatLabel color={neon.pink}>Total Referrals</StatLabel>
              <StatNumber color={neon.text}>
                {Array.isArray(referredUsers) ? referredUsers.length : '0'}
              </StatNumber>
              <StatHelpText color={neon.blue}>Active referrals</StatHelpText>
            </Stat>
          </SimpleGrid>
        </VStack>
      </Box>

      {/* Referral Link Section */}
      <Box
        p={6}
        borderRadius="lg"
        border="2px solid"
        borderColor={neon.blue}
        bg={neon.panel}
        boxShadow={`0 0 16px ${neon.blue}, 0 0 32px ${neon.purple}55`}
        fontFamily="'Press Start 2P', monospace"
        position="relative"
        _before={{
          content: '""',
          position: 'absolute',
          inset: 0,
          borderRadius: "lg",
          boxShadow: `0 0 32px 4px ${neon.blue}, 0 0 64px 8px ${neon.purple}55`,
          pointerEvents: "none",
          opacity: 0.5,
          zIndex: 0,
        }}
      >
        <VStack spacing={6} align="stretch">
          <Text color={neon.blue} fontSize="xl" sx={{ textShadow: `0 0 10px ${neon.blue}88, 0 0 20px ${neon.blue}44` }}>
            YOUR REFERRAL LINK
          </Text>
          <Divider borderColor={neon.blue} />
          <VStack spacing={4}>
            <Input
              value={`${window.location.origin}?ref=${address}`}
              isReadOnly
              bg={neon.panel}
              borderColor={neon.blue}
              color={neon.text}
              _hover={{ borderColor: neon.pink }}
              _focus={{ borderColor: neon.pink, boxShadow: `0 0 0 1px ${neon.pink}` }}
            />
            <Button
              onClick={handleCopyReferral}
              bg={neon.blue}
              color={neon.text}
              _hover={{
                bg: neon.pink,
                boxShadow: `0 0 16px ${neon.pink}88`
              }}
              isLoading={isCopied}
              w="full"
              fontFamily="'Press Start 2P', monospace"
              fontSize="xs"
              px={6}
              py={4}
              borderRadius="md"
              border="2px solid"
              borderColor={neon.blue}
              _active={{
                transform: 'scale(0.95)',
              }}
              sx={{
                textShadow: `0 0 10px ${neon.blue}88, 0 0 20px ${neon.blue}44`
              }}
            >
              {isCopied ? 'Copied!' : 'Copy Link'}
            </Button>
          </VStack>
        </VStack>
      </Box>

      {/* How It Works Section */}
      <Box
        p={6}
        borderRadius="lg"
        border="2px solid"
        borderColor={neon.blue}
        bg={neon.panel}
        boxShadow={`0 0 16px ${neon.blue}, 0 0 32px ${neon.purple}55`}
        fontFamily="'Press Start 2P', monospace"
        position="relative"
        _before={{
          content: '""',
          position: 'absolute',
          inset: 0,
          borderRadius: "lg",
          boxShadow: `0 0 32px 4px ${neon.blue}, 0 0 64px 8px ${neon.purple}55`,
          pointerEvents: "none",
          opacity: 0.5,
          zIndex: 0,
        }}
        gridColumn={{ base: '1', md: 'span 2' }}
      >
        <VStack spacing={6} align="stretch">
          <Text color={neon.blue} fontSize="xl" sx={{ textShadow: `0 0 10px ${neon.blue}88, 0 0 20px ${neon.blue}44` }}>
            HOW IT WORKS
          </Text>
          <Divider borderColor={neon.blue} />
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <VStack align="start" spacing={4}>
              <HStack>
                <Badge colorScheme="blue" fontSize="sm" bg={neon.blue} color={neon.text}>1</Badge>
                <Text color={neon.text} fontSize="sm">Share your referral link with friends</Text>
              </HStack>
              <HStack>
                <Badge colorScheme="blue" fontSize="sm" bg={neon.blue} color={neon.text}>2</Badge>
                <Text color={neon.text} fontSize="sm">When they start mining, you earn {referralFee ? `${Number(referralFee as bigint) / 1e16}%` : '2.5%'} of their rewards</Text>
              </HStack>
            </VStack>
            <VStack align="start" spacing={4}>
              <HStack>
                <Badge colorScheme="blue" fontSize="sm" bg={neon.blue} color={neon.text}>3</Badge>
                <Text color={neon.text} fontSize="sm">No limit on number of referrals</Text>
              </HStack>
              <HStack>
                <Badge colorScheme="blue" fontSize="sm" bg={neon.blue} color={neon.text}>4</Badge>
                <Text color={neon.text} fontSize="sm">Rewards are paid automatically</Text>
              </HStack>
            </VStack>
          </SimpleGrid>
        </VStack>
      </Box>
    </SimpleGrid>
  );
};

export default ReferralSystem; 