import React from 'react'
import ReactDOM from 'react-dom/client'
import { Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom'
import { batch, signal } from '@preact/signals-react'
import { ethers } from "ethers";

import Header from './components/Header.jsx'
import Home from './pages/Home.jsx'
import './style.css'

const wallet = signal(null)
const signer = signal(null)
const provider = signal(null)
const contract = signal(null)
const propertyCount = signal(null)
const fee = signal(null)

const propertyLedgerContractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'

const propertyLedgerContractABI = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [],
        "name": "FeeChanged",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [],
        "name": "PropertyRegistered",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_rentalContractId",
                "type": "uint256"
            }
        ],
        "name": "cancelRentalContract",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_propertyId",
                "type": "uint256"
            }
        ],
        "name": "cancelSaleListing",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_fee",
                "type": "uint256"
            }
        ],
        "name": "changeFee",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_rentalContractId",
                "type": "uint256"
            }
        ],
        "name": "confirmRentalContract",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_propertyId",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_price",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_contractDuration",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "_tenant",
                "type": "address"
            }
        ],
        "name": "createRentalContract",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_propertyId",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_price",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "_buyer",
                "type": "address"
            }
        ],
        "name": "createSaleListing",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "fee",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_propertyId",
                "type": "uint256"
            }
        ],
        "name": "getLastRentalContractOfProperty",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint8",
                        "name": "status",
                        "type": "uint8"
                    },
                    {
                        "internalType": "uint256",
                        "name": "propertyId",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "price",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "listingDate",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "startDate",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "contractDuration",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "paymentCount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address",
                        "name": "tenant",
                        "type": "address"
                    },
                    {
                        "internalType": "uint8",
                        "name": "cancellationApprovals",
                        "type": "uint8"
                    }
                ],
                "internalType": "struct PropertyLedger.RentalContract",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_propertyId",
                "type": "uint256"
            }
        ],
        "name": "getLastSaleListingOfProperty",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint8",
                        "name": "status",
                        "type": "uint8"
                    },
                    {
                        "internalType": "uint256",
                        "name": "propertyId",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "price",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "listingDate",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "soldDate",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address",
                        "name": "buyer",
                        "type": "address"
                    }
                ],
                "internalType": "struct PropertyLedger.SaleListing",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_propertyId",
                "type": "uint256"
            }
        ],
        "name": "getRentalContractIdsLengthOfProperty",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_propertyId",
                "type": "uint256"
            }
        ],
        "name": "getRentalContractIdsOfProperty",
        "outputs": [
            {
                "internalType": "uint256[]",
                "name": "",
                "type": "uint256[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getRentalContractsLength",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_propertyId",
                "type": "uint256"
            }
        ],
        "name": "getSaleListingIdsLengthOfProperty",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_propertyId",
                "type": "uint256"
            }
        ],
        "name": "getSaleListingIdsOfProperty",
        "outputs": [
            {
                "internalType": "uint256[]",
                "name": "",
                "type": "uint256[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getSaleListingsLength",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_rentalContractId",
                "type": "uint256"
            }
        ],
        "name": "payRent",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "properties",
        "outputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "propertyCount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_propertyId",
                "type": "uint256"
            }
        ],
        "name": "purchaseProperty",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_propertyOwner",
                "type": "address"
            }
        ],
        "name": "registerProperty",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "rentalContracts",
        "outputs": [
            {
                "internalType": "uint8",
                "name": "status",
                "type": "uint8"
            },
            {
                "internalType": "uint256",
                "name": "propertyId",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "price",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "listingDate",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "startDate",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "contractDuration",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "paymentCount",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "tenant",
                "type": "address"
            },
            {
                "internalType": "uint8",
                "name": "cancellationApprovals",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "saleListings",
        "outputs": [
            {
                "internalType": "uint8",
                "name": "status",
                "type": "uint8"
            },
            {
                "internalType": "uint256",
                "name": "propertyId",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "price",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "listingDate",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "soldDate",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "buyer",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_propertyId",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "_newOwner",
                "type": "address"
            }
        ],
        "name": "transferPropertyOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_rentalContractId",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_price",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_contractDuration",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "_tenant",
                "type": "address"
            }
        ],
        "name": "updateRentalContract",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_propertyId",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_price",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "_buyer",
                "type": "address"
            }
        ],
        "name": "updateSaleListing",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address payable",
                "name": "_to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_amount",
                "type": "uint256"
            }
        ],
        "name": "withdrawEther",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "stateMutability": "payable",
        "type": "receive"
    }
]

const connectionHandler = async () => {
    let _signer, _accounts, _provider;

    if (window.ethereum) {
        _accounts = await window.ethereum.request({ method: 'eth_accounts' });
        _provider = new ethers.BrowserProvider(window.ethereum);

        if (_accounts.length > 0) {
            _signer = await _provider.getSigner();
        }
    }

    batch(async () => {
        window.ethereum && (provider.value = _provider)
        _accounts.length > 0 && (wallet.value = _accounts[0])
        _signer && (signer.value = _signer)
        contract.value = _provider ? new ethers.Contract(propertyLedgerContractAddress, propertyLedgerContractABI, _accounts.length > 0 ? _signer : _provider) : null
        if (contract.value) {
            propertyCount.value = Number(await contract.value.propertyCount())
            fee.value = Number(await contract.value.fee()) / 1000
        }
    })
}

await connectionHandler()

window.ethereum.on("accountsChanged", () => { window.location.reload() })

const router = createBrowserRouter([
    {
        element: <><Header wallet={wallet} contract={contract} connectionHandler={connectionHandler} propertyCount={propertyCount} fee={fee} /><Outlet /></>,
        children: [
            {
                path: '/',
                element: <Home wallet={wallet} provider={provider} contract={contract} propertyCount={propertyCount} fee={fee} />
            }
        ]
    }
])

ReactDOM.createRoot(document.getElementById('root')).render(
    <RouterProvider router={router} />
)