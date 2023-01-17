const { expect } = require('chai')
const { ethers } = require('hardhat')

const tokens = (n) => {
	return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens

describe('RealEstate Test', () => {
	let realEstate, escrow, transaction
	let seller, deployer
	let nftID = 1
	let purchasePrice = ether(100)
	let escrowAmount = ether(20)

	beforeEach(async () => {
		// Setup accounts
		accounts = await ethers.getSigners()
		deployer = accounts[0]
		seller = deployer
		buyer = accounts[1]
		inspector = accounts[2]
		lender = accounts[3]

		// load contracts
		const RealEstate = ethers.getContractFactory('RealEstate')
		const Escrow = ethers.getContractFactory('Escrow')

		// deploy contracts
		realEstate = await (await RealEstate).deploy()
		escrow = await (
			await Escrow
		).deploy(
			realEstate.address,
			nftID,
			purchasePrice,
			escrowAmount,
			seller.address,
			buyer.address,
			inspector.address,
			lender.address
		)

		// Seller approved Nft
		transaction = await realEstate.connect(seller).approve(escrow.address, nftID)
		await transaction.wait()
	})

	describe('Development', async () => {
		it('send NFT to the Buyer / deployer', async () => {
			expect(await realEstate.ownerOf(nftID)).to.equal(seller.address)
		})
	})

	describe('Selling real estate', async () => {
		let transaction, balance
		it('executes a successful transaction', async () => {
			// Expect seller to the NFT owner before the sell
			expect(await realEstate.ownerOf(nftID)).to.equal(seller.address)

			// Check escrow balance
			balance = await escrow.getBalance()
			console.log('escrow balance:', ethers.utils.formatEther(balance))

			// inspector update status
			transaction = await escrow.connect(inspector).updateInspectionStatus(true)
			await transaction.wait()
			console.log('Inspector update status')

			// Buyer Deposits Earnest
			console.log('Buyer deposits earnest money')
			transaction = await escrow.connect(buyer).depositEarnest({ value: escrowAmount })
			await transaction.wait()

			// Buyer approval
			transaction = await escrow.connect(buyer).approvalSale()
			await transaction.wait()

			// seller approval
			transaction = await escrow.connect(seller).approvalSale()
			await transaction.wait()

			transaction = await lender.sendTransaction({ to: escrow.address, value: ether(80) })
			await transaction.wait()

			// lender approval
			transaction = await escrow.connect(lender).approvalSale()
			await transaction.wait()

			// Expect Seller to receive Funds
			balance = await ethers.provider.getBalance(seller.address)
			console.log('Seller balance:', ethers.utils.formatEther(balance))
			expect(balance).to.be.above(ether(10099))

			// finalizeSale function call
			transaction = await escrow.connect(buyer).finalizeSale()
			await transaction.wait()
			console.log('Buyer finalizes sale')

			// Expect buyer to be the NFT owner after the sell
			expect(await realEstate.ownerOf(nftID)).to.equal(buyer.address)
		})
	})
})
