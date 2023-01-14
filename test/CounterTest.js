const { expect } = require('chai')
const { ethers } = require('hardhat')

describe('Counter Test', () => {
	let counter

	beforeEach(async () => {
		const Counter = await ethers.getContractFactory('counter')
		counter = await Counter.deploy('My counter', 1)
	})

	describe('development', () => {
		it('stores the initial counter', async () => {
			const count = await counter.count()
			expect(count).to.equal(1)
		})

		it('stores the initial name', async () => {
			const name = await counter.name()
			expect(name).to.equal('My counter')
		})
	})

	describe('Counting', () => {
		let transaction

		it('read count function', async () => {
			expect(await counter.count()).to.equal(1)
		})

		it('get Count function call', async () => {
			expect(await counter.getCount()).to.equal(1)
		})

		it('increment the count', async () => {
			transaction = await counter.increment()
			await transaction.wait()

			expect(await counter.count()).to.equal(2)

			transaction = await counter.increment()
			await transaction.wait()
			expect(await counter.count()).to.equal(3)
		})

		it('decrement the count', async () => {
			transaction = await counter.decrement()
			await transaction.wait()

			expect(await counter.count()).to.equal(0)
			await expect(counter.decrement()).to.be.reverted
		})

		it('get name function call', async () => {
			expect(await counter.getName()).to.equal('My counter')
		})

		it('update the name or setName function call', async () => {
			transaction = await counter.setName('New name')
			await transaction.wait()
			expect(await counter.name()).to.equal('New name')
		})
	})
})
