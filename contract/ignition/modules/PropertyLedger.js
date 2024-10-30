// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("PropertyLedgerModule", (m) => {
  const propertyLedger = m.contract("PropertyLedger", [])
  console.log(propertyLedger)
  return { propertyLedger }
});

// 0x5FbDB2315678afecb367f032d93F642f64180aa3