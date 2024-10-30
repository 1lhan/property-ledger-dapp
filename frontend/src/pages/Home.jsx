import { useSignal } from "@preact/signals-react";
import { ethers } from "ethers";

export default function Home({ wallet, provider, contract, propertyCount, fee }) {
    const propertyLedgerContractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
    const contractOwner = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
    const zeroAddress = "0x0000000000000000000000000000000000000000"
    const red = '#ef4444'

    const getPropertyOwnerResult = useSignal(null)
    const getSaleListingsLengthResult = useSignal(null)
    const getRentalContractsLengthResult = useSignal(null)
    const getSaleListingIdsOfPropertyResult = useSignal(null)
    const getRentalContractIdsOfPropertyResult = useSignal(null)
    const getLastSaleListingOfPropertyResult = useSignal(null)
    const getLastRentalContractOfPropertyResult = useSignal(null)
    const getSaleListingResult = useSignal(null)
    const getRentalContractResult = useSignal(null)

    const createSaleListingResult = useSignal(null)
    const updateSaleListingResult = useSignal(null)
    const cancelSaleListingResult = useSignal(null)
    const purchasePropertyResult = useSignal(null)

    const createRentalContractResult = useSignal(null)
    const updateRentalContractResult = useSignal(null)
    const cancelRentalContractResult = useSignal(null)
    const confirmRentalContractResult = useSignal(null)
    const payRentResult = useSignal(null)

    const registerPropertyResult = useSignal(null)
    const changeFeeResult = useSignal(null)
    const withdrawEtherResult = useSignal(null)

    const isPropertyIdValid = async (propertyId, resultState) => {
        try {
            if (propertyId < 0) {
                resultState.value = { success: false, result: 'Invalid property ID.' }
                return false
            }
            const propertyCount = Number(await contract.value.propertyCount())
            if (propertyId >= propertyCount) {
                resultState.value = { success: false, result: 'Invalid property ID.' }
                return false
            }
            return true
        }
        catch (error) {
            resultState.value = { success: false, error: error.reason || 'Error fetching property count.' }
            return false
        }
    }

    const isGreaterThanZero = (value, resultState, text) => {
        if (value <= 0) {
            resultState.value = { success: false, result: `${text} must be greater than zero.` }
            return false
        }
        return true
    }

    const isAddressValid = (address, resultState) => {
        const isInvalid = address.length != 42 || (ethers.getAddress(address) == ethers.getAddress(zeroAddress))
        if (isInvalid) return resultState.value = { success: false, result: 'Invalid address.' }
        return !isInvalid
    }

    const onlyPropertyOwner = async (propertyId, resultState) => {
        try {
            if (propertyId < 0) return resultState.value = { success: false, result: 'Invalid property ID.' }
            const propertyCount = Number(await contract.value.propertyCount())
            if (propertyId >= propertyCount) return resultState.value = { success: false, result: 'Invalid property ID.' }
        }
        catch (error) { return { success: false, error: error.reason || 'Error fetching property count.' } }

        let owner;
        try {
            owner = await contract.value.properties(propertyId)
        }
        catch (error) { return resultState.value = { success: false, result: error.reason || 'Could not fetched property owner.' } }

        const check = ethers.getAddress(wallet.value) == ethers.getAddress(owner)
        if (!check) resultState.value = { success: false, result: 'Only the property owner can call this function.' }
        return check
    }

    const onlyContractOwner = (resultState) => {
        const check = ethers.getAddress(wallet.value) != ethers.getAddress(contractOwner)
        if (check) {
            resultState.value = { success: false, result: 'Only the contract owner can call this function.' }
            return false
        }
        return true
    }

    const _fetchPropertyOwner = async (propertyId) => {
        try {
            if (propertyId < 0) return { success: false, result: 'Invalid property ID.' }
            const propertyCount = Number(await contract.value.propertyCount())
            if (propertyId >= propertyCount) return { success: false, result: 'Invalid property ID.' }
        }
        catch (error) { return { success: false, error: error.reason || 'Error fetching property count.' } }

        try {
            const owner = await contract.value.properties(propertyId)
            return { success: true, result: owner }
        }
        catch (error) { return { success: false, result: error.reason || 'Could not fetched property owner.' } }
    }

    const _fetchLastSaleListingOfProperty = async (propertyId) => {
        try {
            const saleListingIdsLengthOfProperty = await contract.value.getSaleListingIdsLengthOfProperty(propertyId)
            if (saleListingIdsLengthOfProperty == 0) return { success: false, result: 'No sale listing found for this property.' }
        }
        catch (error) { return { success: false, result: error.reason || 'Could not fetched sale listing ids length of property.' } }

        try {
            const lastSaleListingOfProperty = await contract.value.getLastSaleListingOfProperty(propertyId)
            return { success: true, result: lastSaleListingOfProperty }
        }
        catch (error) { return { success: false, result: error.reason || 'Could not fetched last sale listing of property.' } }
    }

    const _fetchSaleListing = async (saleListingId) => {
        try {
            const saleListingsLength = Number(await contract.value.getSaleListingsLength())
            const isInvalid = saleListingsLength == 0 || (+saleListingId >= saleListingsLength)
            if (isInvalid) return { success: false, result: saleListingsLength == 0 ? 'There is not any sale listing.' : "Sale listing id doesn't exist." }
        }
        catch (error) { return { success: false, result: error.reason || 'Error fetching sale listings count.' } }

        try {
            const saleListing = await contract.value.rentalContracts(saleListingId)
            return { success: true, result: saleListing }
        }
        catch (error) { return { success: false, result: error.reason || 'Error fetching sale listing.' } }
    }

    const _fetchRentalContract = async (rentalContractId) => {
        try {
            const rentalContractsLength = Number(await contract.value.getRentalContractsLength())
            const isInvalid = rentalContractsLength == 0 || (+rentalContractId >= rentalContractsLength)
            if (isInvalid) return { success: false, result: rentalContractsLength == 0 ? 'There is not any rental contract.' : "Rental contract id doesn't exist." }
        }
        catch (error) { return { success: false, result: error.reason || 'Error fetching rental contracts count.' } }

        try {
            const rentalContract = await contract.value.rentalContracts(rentalContractId)
            return { success: true, result: rentalContract }
        }
        catch (error) { return { success: false, result: error.reason || 'Error fetching rental contract.' } }
    }

    const _fetchLastRentalContractIdOfProperty = async (propertyId) => {
        try {
            const data = await contract.value.getRentalContractIdsOfProperty(propertyId)
            console.log(data)
            return { success: true, result: data }
        }
        catch (error) { return { success: false, result: error.reason || "Could not fetched rental contract id's of property." } }
    }

    // Search Operations

    const getPropertyOwner = async (e) => {
        const propertyId = e.target.propertyId.value

        if (propertyId < 0 || propertyId >= propertyCount.value) return getPropertyOwnerResult.value = { type: 'error', result: 'Invalid property ID.' }

        try {
            const response = await contract.value.properties(propertyId)
            e.target.reset()
            getPropertyOwnerResult.value = { success: true, result: `${propertyId}: ${response}` }
        }
        catch (error) { getPropertyOwnerResult.value = { success: false, result: error.reason || 'error' } }
    }

    const getSaleListingIdsOfProperty = async (e) => {
        const propertyId = e.target.propertyId.value

        if (!(await isPropertyIdValid(propertyId, getSaleListingIdsOfPropertyResult))) return;

        try {
            let response = await contract.value.getSaleListingIdsOfProperty(propertyId)
            response = response.map(item => { return Number(item) })
            getSaleListingIdsOfPropertyResult.value = { success: !(response.length == 0), result: response.length == 0 ? 'No sale listing found for this property.' : response.join(',') }
        }
        catch (error) { console.log(error); getSaleListingIdsOfPropertyResult.value = { success: false, result: error.reason || 'error' } }
    }

    const getRentalContractIdsOfProperty = async (e) => {
        const propertyId = e.target.propertyId.value

        if (!(await isPropertyIdValid(propertyId, getRentalContractIdsOfPropertyResult))) return;

        try {
            let response = await contract.value.getRentalContractIdsOfProperty(propertyId)
            response = response.map(item => { return Number(item) })
            getRentalContractIdsOfPropertyResult.value = { success: !(response.length == 0), result: response.length == 0 ? 'No rental contract found for this property.' : response.join(',') }
        }
        catch (error) { getRentalContractIdsOfPropertyResult.value = { success: false, result: error.reason || 'error' } }
    }

    const getLastSaleListingOfProperty = async (e) => {
        const propertyId = e.target.propertyId.value

        if (propertyId < 0 || propertyId >= propertyCount.value) return getLastSaleListingOfPropertyResult.value = { type: 'error', result: 'Invalid property ID.' }
        try {
            const response = await contract.value.getLastSaleListingOfProperty(e.target.propertyId.value)
            getLastSaleListingOfPropertyResult.value = {
                success: true, result: [
                    ['Status', Number(response[0]) == 1 ? 'active' : Number(response[0]) == 0 ? 'canceled' : 'sold'],
                    ['Property ID', Number(response[1])],
                    ['Price', `${ethers.formatEther(response[2])} ETH`],
                    ['Listing Date', new Date(Number(response[3]) * 1000).toLocaleDateString()],
                    ['Sold Date', Number(response[4]) == 0 ? '' : new Date(Number(response[4]) * 1000).toLocaleDateString()],
                    ['Buyer', response[5]]
                ]
            }
        }
        catch (error) { console.log(error); getLastSaleListingOfPropertyResult.value = { success: false, result: error.reason || 'error' } }
    }

    const getLastRentalContractOfProperty = async (e) => {
        const propertyId = e.target.propertyId.value

        if (propertyId < 0 || propertyId >= propertyCount.value) return getLastRentalContractOfPropertyResult.value = { type: 'error', result: 'Invalid property ID.' }

        let rentalContractIdsLengthOfProperty;
        try { rentalContractIdsLengthOfProperty = await contract.value.getRentalContractIdsLengthOfProperty(propertyId) }
        catch (error) { getLastRentalContractOfPropertyResult.value = { success: false, result: "Could not fetched rental contract id's length of the property." } }

        if (rentalContractIdsLengthOfProperty == 0) return getLastRentalContractOfPropertyResult.value = { success: false, result: "No rental contract found for this property." }

        try {
            const response = await contract.value.getLastRentalContractOfProperty(propertyId)
            getLastRentalContractOfPropertyResult.value = {
                success: true, result: [
                    ['Status', Number(response[0]) == 1 ? 'active' : Number(response[0]) == 0 ? 'canceled' : 'sold'],
                    ['Property ID', Number(response[1])],
                    ['Price', `${ethers.formatEther(response[2])} ETH`],
                    ['Listing Date', new Date(Number(response[3]) * 1000).toLocaleDateString()],
                    ['Start Date', Number(response[4]) == 0 ? '' : new Date(Number(response[4]) * 1000).toLocaleDateString()],
                    ['Contract Duration', Number(response[5])],
                    ['Payment Count', Number(response[6])],
                    ['Tenant', response[7]],
                    ['Cancellation Approvals', Number(response[8])]
                ]
            }
        }
        catch (error) { console.log(error); getLastRentalContractOfPropertyResult.value = { success: false, result: error.reason || 'error' } }
    }

    const getSaleListingsLength = async () => {
        try {
            const response = Number(await contract.value.getSaleListingsLength())
            getSaleListingsLengthResult.value = { success: true, result: `Sale listings count: ${response}` }
        }
        catch (error) { getSaleListingsLengthResult.value = { success: false, result: error.reason || 'error' } }
    }

    const getRentalContractsLength = async () => {
        try {
            const response = Number(await contract.value.getRentalContractsLength())
            getRentalContractsLengthResult.value = { success: true, result: `Rental contracts count: ${response}` }
        }
        catch (error) { getRentalContractsLengthResult.value = { success: false, result: error.reason || 'error' } }
    }

    const getSaleListing = async (e) => {
        const saleListingId = e.target.saleListingId.value

        let saleListing = await _fetchSaleListing(saleListingId)
        if (!saleListing.success) return getSaleListingResult.value = saleListing
        saleListing = saleListing.result

        getSaleListingResult.value = {
            success: true, result: [
                ['Status', Number(saleListing[0]) == 1 ? 'active' : Number(saleListing[0]) == 0 ? 'canceled' : 'sold'],
                ['Property ID', Number(saleListing[1])],
                ['Price', `${ethers.formatEther(saleListing[2])} ETH`],
                ['Listing Date', new Date(Number(saleListing[3]) * 1000).toLocaleDateString()],
                ['Sold Date', Number(saleListing[4]) == 0 ? '' : new Date(Number(saleListing[4]) * 1000).toLocaleDateString()],
                ['Buyer', saleListing[5]]
            ]
        }
    }

    const getRentalContract = async (e) => {
        const rentalContractId = e.target.rentalContractId.value

        let rentalContract = await _fetchRentalContract(rentalContractId)
        if (!rentalContract.success) return getRentalContractResult.value = rentalContract
        rentalContract = rentalContract.result

        getRentalContractResult.value = {
            success: true, result: [
                ['Status', Number(rentalContract[0]) == 1 ? 'active' : Number(rentalContract[0]) == 0 ? 'canceled' : Number(rentalContract[0]) == 2 ? 'rented' : 'completed'],
                ['Property ID', Number(rentalContract[1])],
                ['Price', `${ethers.formatEther(rentalContract[2])} ETH`],
                ['Listing Date', new Date(Number(rentalContract[3]) * 1000).toLocaleDateString()],
                ['Start Date', Number(rentalContract[4]) == 0 ? '' : new Date(Number(rentalContract[4]) * 1000).toLocaleDateString()],
                ['Contract Duration', Number(rentalContract[5])],
                ['Payment Count', Number(rentalContract[6])],
                ['Tenant', rentalContract[7]],
                ['Cancellation Approvals', Number(rentalContract[8])]
            ]
        }
    }

    // Contract Owner Operations

    const registerProperty = async (e) => {
        const address = e.target.address.value

        if (!isAddressValid(address, registerPropertyResult) || !onlyContractOwner(registerPropertyResult)) return;

        try {
            const currentPropertyCount = propertyCount.value
            const tx = await contract.value.registerProperty(address)
            await tx.wait()

            e.target.reset()
            registerPropertyResult.value = { success: 'true', result: [['The property have been registered.', ''], ['Property ID', currentPropertyCount], ['Transation Hash', tx.hash]] }
        }
        catch (error) { registerPropertyResult.value = { success: 'false', result: error.reason || 'error' } }
    }

    const changeFee = async (e) => {
        const newFee = e.target.fee.value

        if (!onlyContractOwner(changeFeeResult)) return;

        try {
            const oldFee = fee.value
            const tx = await contract.value.changeFee(newFee)
            await tx.wait()

            e.target.reset()
            changeFeeResult.value = { success: 'true', result: `Fee have been changed from ${oldFee} to ${newFee / 1000}.` }
        }
        catch (error) { changeFeeResult.value = { success: 'false', result: error.reason || 'error' } }
    }

    const withdrawEther = async (e) => {
        const { amount, address } = e.target

        if (!onlyContractOwner(withdrawEtherResult) || isGreaterThanZero(amount.value, withdrawEtherResult, 'Amount') || isAddressValid(address.value, withdrawEtherResult)) return;

        let contractBalance;
        try { contractBalance = Number(await provider.value.getBalance(propertyLedgerContractAddress)) }
        catch (error) { contractBalance = false }

        if (contractBalance >= 0 && contractBalance < amount.value) return withdrawEtherResult.value = { type: 'error', result: `Exceeded contract balance. Contract balance: ${contractBalance}` }
        else if (contractBalance == false) return withdrawEtherResult.value = { success: false, result: 'Could not fetched contract balance data.' }

        try {
            const tx = await contract.value.withdrawEther(address.value, amount.value)
            await tx.wait()

            return withdrawEtherResult.value = { success: 'true', result: `Ether withdrawal successfully.` }
        }
        catch (error) { withdrawEtherResult.value = { success: 'false', result: error.reason || 'error' } }
    }

    // Sale Listing And Purchase Operations (ok)

    const createSaleListing = async (e) => {
        const { propertyId, price, buyer } = e.target

        if (!(await onlyPropertyOwner(propertyId.value, createSaleListingResult)) || !isAddressValid(buyer.value, createSaleListingResult) || !isGreaterThanZero(price.value, createSaleListingResult, 'Price')) return;

        if (ethers.getAddress(wallet.value) == ethers.getAddress(buyer.value)) return createSaleListingResult.value = { success: false, result: 'The buyer address cannot be the same as the sender address.' }

        const lastSaleListingOfProperty = await _fetchLastSaleListingOfProperty(propertyId.value)
        if (!lastSaleListingOfProperty.success && lastSaleListingOfProperty.result != 'No sale listing found for this property.') return createSaleListingResult.value = lastSaleListingOfProperty

        if (lastSaleListingOfProperty.success && Number(lastSaleListingOfProperty.result[0]) != 2) {
            return createSaleListingResult.value = { success: false, result: 'You cannot create a sale listing because the property already has an active or canceled sale listing.' }
        }

        try {
            const tx = await contract.value.createSaleListing(propertyId.value, price.value, buyer.value)
            await tx.wait()

            createSaleListingResult.value = { success: true, result: [['Sale listing have been created.', ''], ['Property ID', propertyId.value], ['Transaction hash', tx.hash]] }
            e.target.reset()
        }
        catch (error) { createSaleListingResult.value = { success: false, result: error.reason || 'error' } }
    }

    const updateSaleListing = async (e) => {
        const { propertyId, price, buyer } = e.target

        if (!(await onlyPropertyOwner(propertyId.value, updateSaleListingResult)) || !isAddressValid(buyer.value, updateSaleListingResult) || !isGreaterThanZero(price.value, updateSaleListingResult, 'Price')) return;

        let lastSaleListingOfProperty = await _fetchLastSaleListingOfProperty(propertyId.value)
        if (!lastSaleListingOfProperty.success) return updateSaleListingResult.value = lastSaleListingOfProperty
        else lastSaleListingOfProperty = lastSaleListingOfProperty.result

        if (Number(lastSaleListingOfProperty[0]) == 2) return updateSaleListingResult.value = { success: false, result: 'You can only update your sale listing if its status is not sold.' }
        if (ethers.getAddress(wallet.value) == ethers.getAddress(buyer.value)) return updateSaleListingResult.value = { success: false, result: 'The buyer address cannot be the same as the sender address.' }

        if (Number(lastSaleListingOfProperty[0]) == 1 && price.value == Number(lastSaleListingOfProperty[2]) && ethers.getAddress(lastSaleListingOfProperty[5]) == ethers.getAddress(buyer.value)) {
            return updateSaleListingResult.value = { success: false, result: 'The price and buyer input values are the same as those of the last sale listing.' }
        }

        try {
            const tx = await contract.value.updateSaleListing(propertyId.value, price.value, buyer.value)
            await tx.wait()

            updateSaleListingResult.value = { success: true, result: [['Sale listing have been updated.', ''], ['Property ID', propertyId.value], ['Transaction hash', tx.hash]] }
            e.target.reset()
        }
        catch (error) { updateSaleListingResult.value = { success: false, result: error.reason || 'error' } }
    }

    const cancelSaleListing = async (e) => {
        const propertyId = e.target.propertyId.value

        if (!(await onlyPropertyOwner(propertyId, cancelSaleListingResult))) return;

        const lastSaleListingOfProperty = await _fetchLastSaleListingOfProperty(propertyId)
        if (!lastSaleListingOfProperty.success) return cancelSaleListingResult.value = lastSaleListingOfProperty

        if (Number(lastSaleListingOfProperty.result[0]) != 1) return cancelSaleListingResult.value = { success: false, result: 'Sale Listing cannot be canceled as it is already either sold or canceled.' }

        try {
            const tx = await contract.value.cancelSaleListing(propertyId)
            await tx.wait()

            cancelSaleListingResult.value = { success: true, result: [['Sale listing have been canceled.', ''], ['Property ID', propertyId.value], ['Transaction hash', tx.hash]] }
            e.target.reset()
        }
        catch (error) { cancelSaleListingResult.value = { success: false, result: error.reason || 'error' } }
    }

    const purchaseProperty = async (e) => {
        const propertyId = e.target.propertyId.value

        if (!(await isPropertyIdValid(propertyId, purchasePropertyResult))) return;

        const lastSaleListingOfProperty = await _fetchLastSaleListingOfProperty(propertyId)
        if (!lastSaleListingOfProperty.success) return purchasePropertyResult.value = lastSaleListingOfProperty

        if (Number(lastSaleListingOfProperty.result[0]) != 1) return purchasePropertyResult.value = { success: false, result: 'Property is not for sale.' }
        if (ethers.getAddress(lastSaleListingOfProperty.result[5]) != ethers.getAddress(wallet.value)) return purchasePropertyResult.value = { success: false, result: 'You are not the designated buyer of this sale listing.' }

        try {
            console.log(lastSaleListingOfProperty.result)
            const tx = await contract.value.purchaseProperty(propertyId, { value: ethers.parseUnits(lastSaleListingOfProperty.result[2].toString(), "wei") })
            await tx.wait()

            purchasePropertyResult.value = { success: true, result: [['Sale listing have been purchased.', ''], ['Property ID', propertyId.value], ['Transaction hash', tx.hash]] }
            e.target.reset()
        }
        catch (error) { console.log(error); purchasePropertyResult.value = { success: false, result: error.reason || 'error' } }
    }

    // Rental Contract And Pay Rent Operations (ok)

    const createRentalContract = async (e) => {
        const { propertyId, price, contractDuration, tenant } = e.target

        let _rentalContractIdsLengthOfProperty;
        try { _rentalContractIdsLengthOfProperty = Number(await contract.value.getRentalContractIdsLengthOfProperty(propertyId.value)) }
        catch (error) { return createRentalContractResult.value = { success: false, result: 'Could not fetched rental contract ids length of property.' } }

        let _lastRentalContractOfProperty;

        if (_rentalContractIdsLengthOfProperty > 0) {
            try { _lastRentalContractOfProperty = await contract.value.getLastRentalContractOfProperty(propertyId.value) }
            catch (error) { return createRentalContractResult.value = { success: false, result: 'Could not fetched last rental contract of property.' } }

            if (Number(_lastRentalContractOfProperty[0]) != 3 || !(Number(_lastRentalContractOfProperty[0]) == 0 && Number(_lastRentalContractOfProperty[9]) == 3)) {
                return createRentalContractResult.value = { success: false, result: 'You cannot create a rental contract because the property already has an active or canceled sale listing.' }
            }
        }

        if (ethers.getAddress(wallet.value) == ethers.getAddress(tenant.value)) return createRentalContractResult.value = { success: false, result: 'The tenant address cannot be the same as the sender address.' }

        if (!onlyPropertyOwner(propertyId.value, createRentalContractResult) ||
            !isAddressValid(tenant.value, createRentalContractResult) ||
            !isGreaterThanZero(price.value, createRentalContractResult, 'Price') ||
            !isGreaterThanZero(contractDuration.value, createRentalContractResult, 'Contract duration')) return;

        try {
            const tx = await contract.value.createRentalContract(propertyId.value, price.value, contractDuration.value, tenant.value)
            await tx.wait()

            let rentalContractId = await _fetchLastRentalContractIdOfProperty(propertyId.value)

            createRentalContractResult.value = {
                success: true,
                result: [
                    ['Rental contract have been created.', ''], ['Rental contract ID', rentalContractId.success ? rentalContractId.result : rentalContractId.result],
                    ['Property ID', propertyId.value], ['Transaction Hash', tx.hash]
                ]
            }
            e.target.reset()
        }
        catch (error) { createRentalContractResult.value = { success: false, result: error.reason || 'error' } }
    }

    const updateRentalContract = async (e) => {
        const { rentalContractId, price, contractDuration, tenant } = e.target

        if (!isGreaterThanZero(contractDuration.value, updateRentalContractResult, 'Contract duration') ||
            !isGreaterThanZero(price.value, updateRentalContractResult, 'Price') ||
            !isAddressValid(tenant.value, updateRentalContractResult
            )) return;

        const rentalContract = await _fetchRentalContract()
        if (!rentalContract.success) return updateRentalContractResult.value = rentalContract
        if (Number(rentalContract.result[0]) > 1) return updateRentalContractResult.value = { success: false, result: 'Rental contract cannot be updated as it is already either rented or expired.' }

        try {
            const tx = await contract.value.updateRentalContract(rentalContractId.value, price.value, contractDuration.value, tenant.value)
            await tx.wait()
            updateRentalContractResult.value = { success: true, result: [['Rental contract have been updated.', ''], ['Rental contract id', rentalContractId.value], ['Transaction hash', tx.hash]] }
        }
        catch (error) { updateRentalContractResult.value = { success: false, result: error.reason || 'error' } }
    }

    const cancelRentalContract = async (e) => {
        const rentalContractId = e.target.rentalContractId.value

        let rentalContract = await _fetchRentalContract(rentalContractId)
        if (!rentalContract.success) return cancelRentalContractResult.value = rentalContract
        else rentalContract = rentalContract.result

        let propertyOwner = await _fetchPropertyOwner(Number(rentalContract[1]))
        if (!propertyOwner.success) return cancelRentalContractResult.value = propertyOwner
        else propertyOwner = propertyOwner.result

        if (Number(rentalContract[0]) == 1) {
            if (!onlyPropertyOwner(Number(rentalContract[1]), cancelRentalContractResult)) return;

            try {
                const tx = await contract.value.cancelRentalContract(rentalContractId)
                await tx.wait()
                return cancelRentalContractResult.value = { success: true, result: [['Rental contract have been canceled.', ''], ['Rental contract ID', rentalContractId], ['Transaction hash', tx.hash]] }
            }
            catch (error) { return cancelRentalContractResult.value = { success: false, result: error.reason || 'Transaction failed.' } }
        }
        else if (Number(rentalContract) == 2) {
            const cancellationApprovals = Number(rentalContract[8])
            const isPropertyOwner = ethers.getAddress(wallet.value) == ethers.getAddress(propertyOwner)
            const isTenant = ethers.getAddress(wallet.value) == ethers.getAddress(rentalContract[7])

            if (isPropertyOwner || isTenant) {
                if ((isPropertyOwner && cancellationApprovals < 2) || (isTenant && cancellationApprovals == 0 || cancellationApprovals == 2)) {
                    try {
                        const tx = await contract.value.cancelRentalContract(rentalContractId)
                        await tx.wait()
                        return cancelRentalContractResult.value = {
                            success: true,
                            result: [['You have been gave approval for rental contract cancellation.', ''], ['Rental contract ID', rentalContractId], ['Transaction hash', tx.hash]]
                        }
                    }
                    catch (error) { return cancelRentalContractResult.value = { success: false, result: error.reason || 'Transaction failed.' } }
                }
                else return { success: false, result: 'You already gave approval for rental contract cancellation.' }
            }
            else return { success: false, result: 'Caller is not the property owner or tenant of the property.' }
        }
        else return cancelRentalContractResult.value = { success: false, result: 'Rental contract cannot be canceled as it is already either canceled or completed.' }
    }

    const confirmRentalContract = async (e) => {
        const rentalContractId = e.target.rentalContractId.value

        let rentalContract = await _fetchRentalContract(rentalContractId)
        if (!rentalContract.success) return confirmRentalContractResult.value = rentalContract
        else rentalContract = rentalContract.result

        if (ethers.getAddress(wallet.value) != ethers.getAddress(rentalContract[7])) return confirmRentalContractResult.value = { success: false, result: "You are not designated the tenant for this rental contract." }
        if (Number(rentalContract[0]) != 1) return confirmRentalContractResult.value = { success: false, result: "Rental contract status must be active to confirm." }

        try {
            const tx = await contract.value.confirmRentalContract(rentalContractId)
            await tx.wait()
            confirmRentalContractResult.value = { success: true, result: [['Rental contract have been confirmed.', ''], ['Transaction hash', tx.hash]] }
        }
        catch (error) { confirmRentalContractResult.value = { success: false, result: error.reason || "Could not confirmed rental contract." } }
    }

    const payRent = async (e) => {
        const rentalContractId = e.target.rentalContractId.value

        let rentalContract = await _fetchRentalContract(rentalContractId)
        if (!rentalContract.success) return payRentResult.value = rentalContract
        else rentalContract = rentalContract.result

        if (ethers.getAddress(wallet.value) != ethers.getAddress(rentalContract[7])) return payRentResult.value = { success: false, result: "You are not designated the tenant for this rental contract." }
        if (Number(rentalContract[0]) != 2) return payRentResult.value = { success: false, result: "The rental contract status must be 'rented' to proceed with payment." }

        try {
            const tx = await contract.value.payRent(rentalContractId, { value: ethers.parseUnits(rentalContract[2].toString(), "wei") })
            await tx.wait()

            payRentResult.value = { success: true, result: [['Payment successful', ''], ['Transaction hash', tx.hash]] }
        }
        catch (error) { payRentResult.value = { success: false, result: error.reason || 'Payment failed.' } }
    }

    const Form = ({ title, submitFunction, formResultState, inputs, insideSubmitBtn }) => {
        const _onSubmit = async (e) => {
            e.preventDefault()
            submitFunction(e)
        }

        return (
            <form onSubmit={_onSubmit}>
                <input id={title} type="checkbox" />
                <div className="form-header">
                    <h4>{title}</h4>
                    <label htmlFor={title}>
                        <i className="fa-solid fa-chevron-down" />
                    </label>
                </div>
                <div className="form-body">
                    {inputs && inputs.map(({ name, type }, inputIndex) =>
                        <div className="form-body-item" key={inputIndex}>
                            <span>{name.replace(/([a-z])([A-Z])/g, '$1 $2')}</span>
                            <input name={name} type={type} />
                        </div>
                    )}
                    <button type="submit">{insideSubmitBtn.text || <i className={insideSubmitBtn.className} />}</button>
                    {formResultState.value && <div className="result" style={{ color: formResultState.value.success ? '' : red }}>
                        {Array.isArray(formResultState.value?.result) ?
                            formResultState.value.result.map((resultItem, resulItemIndex) =>
                                <div className="result-item" key={resulItemIndex}>
                                    <span>{resultItem[0]}</span>
                                    <span>{resultItem[1]}</span>
                                </div>
                            ) :
                            <span>{formResultState.value?.result}</span>
                        }
                    </div>}
                </div>
            </form>
        )
    }

    return (
        <div className="home-page container">
            <section>
                <div className="section-item">
                    <h3>Search Operations</h3>
                    <Form title='Get Property Owner' submitFunction={getPropertyOwner} formResultState={getPropertyOwnerResult} inputs={[{ name: 'propertyId', type: 'number' }]}
                        insideSubmitBtn={{ className: "fa-solid fa-magnifying-glass" }} />
                    <Form title='Get Last Sale Listing Of Property' submitFunction={getLastSaleListingOfProperty} formResultState={getLastSaleListingOfPropertyResult} inputs={[{ name: 'propertyId', type: 'number' }]}
                        insideSubmitBtn={{ className: "fa-solid fa-magnifying-glass" }} />
                    <Form title='Get Last Rental Contract Of Property' submitFunction={getLastRentalContractOfProperty} formResultState={getLastRentalContractOfPropertyResult} inputs={[{ name: 'propertyId', type: 'number' }]}
                        insideSubmitBtn={{ className: "fa-solid fa-magnifying-glass" }} />
                    <Form title="Get Sale Listing Id's Of Property" submitFunction={getSaleListingIdsOfProperty} formResultState={getSaleListingIdsOfPropertyResult} inputs={[{ name: 'propertyId', type: 'number' }]}
                        insideSubmitBtn={{ className: "fa-solid fa-magnifying-glass" }} />
                    <Form title="Get Rental Contract Id's Of Property" submitFunction={getRentalContractIdsOfProperty} formResultState={getRentalContractIdsOfPropertyResult} inputs={[{ name: 'propertyId', type: 'number' }]}
                        insideSubmitBtn={{ className: "fa-solid fa-magnifying-glass" }} />
                    <Form title="Get Sale Listing" submitFunction={getSaleListing} formResultState={getSaleListingResult} inputs={[{ name: 'saleListingId', type: 'number' }]}
                        insideSubmitBtn={{ className: "fa-solid fa-magnifying-glass" }} />
                    <Form title="Get Rental Contract" submitFunction={getRentalContract} formResultState={getRentalContractResult} inputs={[{ name: 'rentalContractId', type: 'number' }]}
                        insideSubmitBtn={{ className: "fa-solid fa-magnifying-glass" }} />
                    <Form title='Get Sale Listings Count' submitFunction={getSaleListingsLength} formResultState={getSaleListingsLengthResult} insideSubmitBtn={{ text: "Get Sale Listings Count" }} />
                    <Form title='Get Rental Contracts Count' submitFunction={getRentalContractsLength} formResultState={getRentalContractsLengthResult} insideSubmitBtn={{ text: "Get Rental Contracts Count" }} />
                </div>

                {(wallet.value && (ethers.getAddress(wallet.value) == ethers.getAddress(contractOwner))) &&
                    <div className="section-item">
                        <h3>Contract Owner Operations</h3>
                        <Form title='Register Property' submitFunction={registerProperty} formResultState={registerPropertyResult} inputs={[{ name: 'address', type: 'text' }]} insideSubmitBtn={{ text: "Register Property" }} />
                        <Form title='Change Fee' submitFunction={changeFee} formResultState={changeFeeResult} inputs={[{ name: 'fee', type: 'number' }]} insideSubmitBtn={{ text: "Change Fee" }} />
                        <Form title='Withdraw Ether' submitFunction={withdrawEther} formResultState={withdrawEtherResult} insideSubmitBtn={{ text: "Withdraw" }}
                            inputs={[{ name: 'amount', type: 'number' }, { name: 'address', type: 'text' }]} />
                    </div>
                }

                <div className="section-item">
                    <h3>Sale Listing And Purchase Operations</h3>
                    <Form title='Create Sale Listing' submitFunction={createSaleListing} formResultState={createSaleListingResult} insideSubmitBtn={{ text: "Create Sale Listing" }}
                        inputs={[{ name: 'propertyId', type: 'number' }, { name: 'price', type: 'number' }, { name: 'buyer', type: 'text' }]} />
                    <Form title='Update Sale Listing' submitFunction={updateSaleListing} formResultState={updateSaleListingResult} insideSubmitBtn={{ text: "Update Sale Listing" }}
                        inputs={[{ name: 'propertyId', type: 'number' }, { name: 'price', type: 'number' }, { name: 'buyer', type: 'text' }]} />
                    <Form title='Cancel Sale Listing' submitFunction={cancelSaleListing} formResultState={cancelSaleListingResult} insideSubmitBtn={{ text: "Cancel Sale Listing" }}
                        inputs={[{ name: 'propertyId', type: 'number' }]} />
                    <Form title='Purchase Property' submitFunction={purchaseProperty} formResultState={purchasePropertyResult} insideSubmitBtn={{ text: "Purchase Property" }}
                        inputs={[{ name: 'propertyId', type: 'number' }]} />
                </div>

                <div className="section-item">
                    <h3>Rental Contract And Pay Rent Operations</h3>
                    <Form title='Create Rental Contract' submitFunction={createRentalContract} formResultState={createRentalContractResult} insideSubmitBtn={{ text: "Create Rental Contract" }}
                        inputs={[{ name: 'propertyId', type: 'number' }, { name: 'price', type: 'number' }, { name: 'contractDuration', type: 'number' }, { name: 'tenant', type: 'text' }]} />
                    <Form title='Update Rental Contract' submitFunction={updateRentalContract} formResultState={updateRentalContractResult} insideSubmitBtn={{ text: "Update Rental Contract" }}
                        inputs={[{ name: 'rentalContractId', type: 'number' }, { name: 'price', type: 'number' }, { name: 'contractDuration', type: 'number' }, { name: 'tenant', type: 'text' }]} />
                    <Form title='Cancel Rental Contract' submitFunction={cancelRentalContract} formResultState={cancelRentalContractResult} insideSubmitBtn={{ text: "Cancel Rental Contract" }}
                        inputs={[{ name: 'rentalContractId', type: 'number' }]} />
                    <Form title='Confirm Rental Contract' submitFunction={confirmRentalContract} formResultState={confirmRentalContractResult} insideSubmitBtn={{ text: "Confirm Rental Contract" }}
                        inputs={[{ name: 'rentalContractId', type: 'number' }]} />
                    <Form title='Pay Rent' submitFunction={payRent} formResultState={payRentResult} insideSubmitBtn={{ text: "Pay Rent" }}
                        inputs={[{ name: 'rentalContractId', type: 'number' }]} />
                </div>

            </section>
        </div>
    )
}