# PixelMiner Deployment Guide

## Bezpieczna konfiguracja klucza prywatnego

### 1. Utwórz plik .env (NIE COMMITUJ GO!)
```bash
# Private Key (NIE COMMITUJ TEGO PLIKU!)
PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE

# RPC URLs
BASE_RPC_URL=https://mainnet.base.org
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY

# API Keys
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY
BASE_SCAN_API_KEY=YOUR_BASESCAN_API_KEY
```

### 2. Dodaj .env do .gitignore
```bash
echo ".env" >> .gitignore
```

### 3. Deployment na Base Mainnet
```bash
# Ustaw zmienną środowiskową
export PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE

# Deploy
npx hardhat run scripts/deploy-base.cjs --network base
```

### 4. Deployment na Base Sepolia (testnet)
```bash
# Ustaw zmienną środowiskową
export PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE

# Deploy
npx hardhat run scripts/deploy-base-sepolia.cjs --network baseSepolia
```

### 5. Weryfikacja kontraktów
```bash
# Ustaw zmienną środowiskową
export PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE

# Verify na Base
npx hardhat run scripts/verify-base.cjs --network base
```

## WAŻNE: Bezpieczeństwo

1. **NIGDY nie commituj pliku .env**
2. **NIGDY nie hardkoduj klucza prywatnego w kodzie**
3. **Używaj zmiennych środowiskowych**
4. **Sprawdź czy .env jest w .gitignore**

## Sprawdzenie konfiguracji

Przed deploymentem sprawdź czy wszystko jest skonfigurowane:

```bash
# Sprawdź czy klucz jest ustawiony
echo $PRIVATE_KEY

# Sprawdź czy .env jest w .gitignore
grep ".env" .gitignore
``` 