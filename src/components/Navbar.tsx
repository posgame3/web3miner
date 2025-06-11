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
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  Text,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { Link as RouterLink } from 'react-router-dom';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

const Links = [
  { name: 'Room', path: '/room' },
  { name: 'Trade', href: 'https://dexscreener.com/base/' },
  { name: 'Stake', path: '/stake' },
  { name: 'Referral', path: '/referral' },
  { name: 'Docs', href: 'https://pixelminer.gitbook.io/pixelminer-docs-1/' },
  { name: 'X', href: 'https://twitter.com/ethermax' },
];

const NavLink = ({ children, to, href }: { children: React.ReactNode; to?: string; href?: string }) => {
  const neon = {
    blue: '#00E8FF',
    pink: '#FF2E63',
  };

  if (href) {
    return (
      <Link
        href={href}
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
        {children}
      </Link>
    );
  }

  return (
    <Link
      as={RouterLink}
      to={to || '/'}
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
      {children}
    </Link>
  );
};

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
            fontSize={{ base: "md", md: "xl" }}
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
          <HStack ml={10} spacing={4} display={{ base: 'none', md: 'flex' }}>
            {Links.map((link) => (
              <NavLink key={link.name} to={link.path} href={link.href}>
                {link.name}
              </NavLink>
            ))}
          </HStack>
        </Flex>

        <HStack spacing={4}>
          {isConnected ? (
            <Button
              onClick={() => disconnect()}
              bg={neon.blue}
              color="white"
              _hover={{
                bg: neon.pink,
                boxShadow: `0 0 16px ${neon.pink}88`
              }}
            >
              {`${address?.slice(0, 6)}...${address?.slice(-4)}`}
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
            >
              Connect
            </Button>
          )}

          <IconButton
            size={'md'}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={'Open Menu'}
            display={{ base: 'flex', md: 'none' }}
            onClick={isOpen ? onClose : onOpen}
            bg={neon.blue}
            color="white"
            _hover={{
              bg: neon.pink,
              boxShadow: `0 0 16px ${neon.pink}88`
            }}
          />
        </HStack>
      </Flex>

      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg={neon.panel}>
          <DrawerCloseButton color={neon.blue} />
          <DrawerHeader borderBottomWidth="1px" borderColor={`${neon.blue}44`}>
            <Text color={neon.blue} fontFamily="'Press Start 2P', monospace">Menu</Text>
          </DrawerHeader>

          <DrawerBody>
            <VStack spacing={4} align="stretch">
              {Links.map((link) => (
                <NavLink key={link.name} to={link.path} href={link.href}>
                  {link.name}
                </NavLink>
              ))}
              {isConnected ? (
                <Button
                  onClick={() => {
                    disconnect();
                    onClose();
                  }}
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
                  onClick={() => {
                    connect({ connector: injected() });
                    onClose();
                  }}
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
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
} 