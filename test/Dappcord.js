const { expect } = require("chai")

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe("Dappcord", function () {
  let deployer, user
  let dappcord

  const NAME = "Dappcord"
  const SYMBOL = "DC"
  const CHANNEL_NAME = "general"

  beforeEach(async () => {
    [deployer, user] = await ethers.getSigners()
    // Deploy contract
    const Dappcord = await ethers.getContractFactory("Dappcord")
    dappcord = await Dappcord.deploy(NAME, SYMBOL)

    // Create a channel
    const transaction = await dappcord.connect(deployer).createChannel(CHANNEL_NAME, tokens(1))
    await transaction.wait()
  })

  describe('Deployment', () => {
    it('Sets the name', async () => {
      let name = await dappcord.name()
      expect(name).to.equal(NAME)

    })
    it('Sets the  symbol', async () => {
      let symbol = await dappcord.symbol()
      expect(symbol).to.equal(SYMBOL)
    })


    it("Sets the owner", async () => {
      const result = await dappcord.owner()
      expect(result).to.equal(deployer.address)
    })
  })

  describe('Creating channels', () => {
    it('Return the total channels', async () => {
      let totalChannels = await dappcord.totalChannels()
      expect(totalChannels).to.equal(1)

    })
    it('Returns channel attributes', async () => {
      let channel = await dappcord.channels(1)
      expect(channel.id).to.equal(1)
      expect(channel.name).to.equal(CHANNEL_NAME)
      // expect(channels.cost).to.equal(0)
    })
  })

  describe("Joining Channels", () => {
    const ID = 1
    const AMOUNT = ethers.utils.parseUnits("1", 'ether')

    beforeEach(async () => {
      const transaction = await dappcord.connect(user).mint(ID, { value: AMOUNT })
      await transaction.wait()
    })

    it('Joins the user', async () => {
      const result = await dappcord.hasJoined(ID, user.address)
      expect(result).to.be.equal(true)
    })

    it('Increases total supply', async () => {
      const result = await dappcord.totalSupply()
      expect(result).to.be.equal(1)
    })

    it('Updates the contract balance', async () => {
      const result = await ethers.provider.getBalance(dappcord.address)
      expect(result).to.be.equal(AMOUNT)
    })
  })

  describe("Withdrawing", () => {
    const ID = 1
    const AMOUNT = ethers.utils.parseUnits("10", 'ether')
    let balanceBefore

    beforeEach(async () => {
      balanceBefore = await ethers.provider.getBalance(deployer.address)

      let transaction = await dappcord.connect(user).mint(ID, { value: AMOUNT })
      await transaction.wait()

      transaction = await dappcord.connect(deployer).withdraw()
      await transaction.wait()
    })

    it('Updates the owner balance', async () => {
      const balanceAfter = await ethers.provider.getBalance(deployer.address)
      expect(balanceAfter).to.be.greaterThan(balanceBefore)
    })

    it('Updates the contract balance', async () => {
      const result = await ethers.provider.getBalance(dappcord.address)
      expect(result).to.equal(0)
    })
  })
})
