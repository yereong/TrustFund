import { type Web3AuthContextConfig } from '@web3auth/modal/react'
import { WEB3AUTH_NETWORK, type Web3AuthOptions } from '@web3auth/modal'

const web3AuthOptions: Web3AuthOptions = {
  clientId: 'BDsxnuyLV6tBqPZMmw2VyvDCQqteHq_SvmJ16_HVVwo12awmshyI5GomoU44KeAi1k0VwufGvbjt5S3hQxodegI', 
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET, // or WEB3AUTH_NETWORK.SAPPHIRE_DEVNET
}

const web3AuthContextConfig: Web3AuthContextConfig = {
  web3AuthOptions,
}

export default web3AuthContextConfig