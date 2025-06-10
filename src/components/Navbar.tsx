import React from 'react';
import {
  Box,
  Flex,
  HStack,
  Link,
  IconButton,
  Button,
  useDisclosure,
  useColorModeValue,
  Stack,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { Link as RouterLink } from 'react-router-dom';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

const Links = [
  { name: 'Home', path: '/' },
  { name: 'Mining', path: '/mining' },
  { name: 'Staking', path: '/stake' },
  { name: 'Referral', path: '/referral' },
];

const NavLink = ({ children, to }: { children: React.ReactNode; to: string }) => (
  <Link
    as={RouterLink}
    px={2}
    py={1}
    rounded={'md'}
    to={to}
    fontFamily="'Press Start 2P', monospace"
    fontSize="sm"
    color="white"
    _hover={{
      textDecoration: 'none',
      bg: useColorModeValue('gray.200', 'gray.700'),
      color: '#00E8FF',
      textShadow: '0 0 8px #00E8FF',
    }}
  >
    {children}
  </Link>
);

export default function Navbar() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const neon = {
    blue: '#00E8FF',
    pink: '#FF2E63',
    purple: '#B026FF',
    green: '#00FF9D',
    panel: '#181A20',
    text: '#FFFFFF',
    border: '#2D3748'
  };

  return (
    <Box 
      bg="gray.800"
      px={4}
      position="relative"
      overflow="hidden"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `linear-gradient(45deg, ${neon.blue}22, ${neon.purple}22)`,
        zIndex: 0
      }}
      sx={{
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          border: '1px solid',
          borderColor: `${neon.blue}44`,
          boxShadow: `0 0 10px ${neon.blue}44, 0 0 20px ${neon.blue}22`,
          zIndex: 1,
          pointerEvents: 'none'
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -1,
          left: -1,
          right: -1,
          bottom: -1,
          background: `linear-gradient(45deg, ${neon.blue}44, ${neon.purple}44)`,
          zIndex: -1,
          filter: 'blur(8px)',
          opacity: 0.5
        }
      }}
    >
      <Flex h={16} alignItems={'center'} justifyContent={'space-between'} position="relative" zIndex={2}>
        <Flex alignItems={'center'}>
          <Link
            as={RouterLink}
            to="/"
            fontFamily="'Press Start 2P', monospace"
            fontSize="xl"
            fontWeight="bold"
            color={neon.blue}
            sx={{
              textShadow: `0 0 10px ${neon.blue}88, 0 0 20px ${neon.blue}44`
            }}
            _hover={{
              color: neon.pink,
              textShadow: `0 0 10px ${neon.pink}88, 0 0 20px ${neon.pink}44`
            }}
          >
            PIXELMINER
          </Link>
          <HStack ml={10} spacing={4}>
            <Link
              as={RouterLink}
              to="/room"
              px={3}
              py={2}
              rounded={'md'}
              color={neon.blue}
              sx={{
                textShadow: `0 0 10px ${neon.blue}88, 0 0 20px ${neon.blue}44`
              }}
              _hover={{
                color: neon.pink,
                textShadow: `0 0 10px ${neon.pink}88, 0 0 20px ${neon.pink}44`
              }}
            >
              Room
            </Link>
            <Link
              as={RouterLink}
              to="/trade"
              px={3}
              py={2}
              rounded={'md'}
              color={neon.blue}
              sx={{
                textShadow: `0 0 10px ${neon.blue}88, 0 0 20px ${neon.blue}44`
              }}
              _hover={{
                color: neon.pink,
                textShadow: `0 0 10px ${neon.pink}88, 0 0 20px ${neon.pink}44`
              }}
            >
              Trade
            </Link>
            <Link
              as={RouterLink}
              to="/stake"
              px={3}
              py={2}
              rounded={'md'}
              color={neon.blue}
              sx={{
                textShadow: `0 0 10px ${neon.blue}88, 0 0 20px ${neon.blue}44`
              }}
              _hover={{
                color: neon.pink,
                textShadow: `0 0 10px ${neon.pink}88, 0 0 20px ${neon.pink}44`
              }}
            >
              Stake
            </Link>
            <Link
              as={RouterLink}
              to="/referral"
              px={3}
              py={2}
              rounded={'md'}
              color={neon.blue}
              sx={{
                textShadow: `0 0 10px ${neon.blue}88, 0 0 20px ${neon.blue}44`
              }}
              _hover={{
                color: neon.pink,
                textShadow: `0 0 10px ${neon.pink}88, 0 0 20px ${neon.pink}44`
              }}
            >
              Referral
            </Link>
            <Link
              href="http://localhost:8080"
              target="_blank"
              rel="noopener noreferrer"
              px={3}
              py={2}
              rounded={'md'}
              color={neon.blue}
              sx={{
                textShadow: `0 0 10px ${neon.blue}88, 0 0 20px ${neon.blue}44`
              }}
              _hover={{
                color: neon.pink,
                textShadow: `0 0 10px ${neon.pink}88, 0 0 20px ${neon.pink}44`
              }}
            >
              Docs
            </Link>
            <Link
              href="https://twitter.com/ethermax"
              target="_blank"
              rel="noopener noreferrer"
              px={3}
              py={2}
              rounded={'md'}
              color={neon.blue}
              sx={{
                textShadow: `0 0 10px ${neon.blue}88, 0 0 20px ${neon.blue}44`
              }}
              _hover={{
                color: neon.pink,
                textShadow: `0 0 10px ${neon.pink}88, 0 0 20px ${neon.pink}44`
              }}
            >
              X
            </Link>
          </HStack>
        </Flex>

        <Flex alignItems={'center'}>
          {isConnected ? (
            <Button
              onClick={() => disconnect()}
              bg={neon.blue}
              color="white"
              _hover={{
                bg: neon.pink,
                boxShadow: `0 0 16px ${neon.pink}88`
              }}
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
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </Button>
          ) : (
            <Button
              onClick={() => connect({ connector: injected() })}
              bg={neon.blue}
              color="white"
              _hover={{
                bg: neon.pink,
                boxShadow: `0 0 16px ${neon.pink}88`
              }}
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
              Connect Wallet
            </Button>
          )}
        </Flex>
      </Flex>

      {isOpen ? (
        <Box pb={4} display={{ md: 'none' }}>
          <Stack as={'nav'} spacing={4}>
            {Links.map((link) => (
              <NavLink key={link.name} to={link.path}>
                {link.name}
              </NavLink>
            ))}
          </Stack>
        </Box>
      ) : null}
    </Box>
  );
} 