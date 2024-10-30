import { ethers } from "ethers";
import ToolTipBox from "./ToolTipBox";
import { useEffect } from "react";

export default function Header({ wallet, contract, connectionHandler, propertyCount, fee }) {
    const orange = '#ea580c'
    const green = '#4ade80'

    const connectWallet = async () => {
        if (window.ethereum) {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            if (accounts.length > 0) await connectionHandler()
        }
        else alert('Metamask could not found.')
    }

    const InsideWalletSection = () => {
        return (
            <>
                <i className="fa-solid fa-wallet" style={{ color: wallet.value ? green : orange }} />
                {wallet.value ? <span>{ethers.getAddress(wallet.value)}</span> : <button className="btn" onClick={() => connectWallet()}>Connect Wallet</button>}
                {wallet.value && <ToolTipBox text='Connected Wallet Address' />}
            </>
        )
    }

    const etherWeiConverter = (_amount) => document.getElementById('converted-wei').value = +_amount * Math.pow(10, 18)

    useEffect(() => {
        if (contract.value) {
            contract.value.on("PropertyRegistered", async () => {
                try {
                    const _propertyCount = await contract.value.propertyCount()
                    propertyCount.value = Number(_propertyCount)
                }
                catch (error) { }
            });

            contract.value.on("FeeChanged", async () => {
                try {
                    const _fee = await contract.value.fee()
                    fee.value = Number(_fee) / 1000
                }
                catch (error) { }
            });

            return () => {
                contract.off("PropertyRegistered");
                contract.off("FeeChanged");
            };
        }
    }, [contract]);

    return (
        <header>
            <div className="header-inner">
                <div className="ether-wei-converter">
                    <span>Ether-Wei Converter</span>
                    <div>
                        <input name="ether" type="number" placeholder="Enter ether amount" onChange={(e) => etherWeiConverter(e.target.value)} />
                        <i className="fa-solid fa-right-left" />
                        <input id="converted-wei" name="wei" type="number" disabled />
                    </div>
                </div>

                <div className="property-count-box">
                    <i className="fa-solid fa-house" />
                    <span>{propertyCount.value}</span>
                    <ToolTipBox text='Property Count' />
                </div>
                <div className="fee-percentage-box">
                    <i className="fa-solid fa-percent" />
                    <span>{fee.value}</span>
                    <ToolTipBox text='Fee Percentage' />
                </div>

                <div className="wallet-section">
                    <InsideWalletSection />
                </div>
            </div>
        </header>
    )
}