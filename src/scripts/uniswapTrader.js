const { ethers } = require('ethers')
const { abi: IUniswapV3PoolABI } = require ('@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json')
const { abi: SwapRouterABI} = require ('@uniswap/v3-periphery/artifacts/contracts/interfaces/ISwapRouter.sol/ISwapRouter.json')
const { getPoolImmutables, getPoolState } = require('./helpers')
const ERC20ABI = require('../abi.json')

require('dotenv').config()
const REACT_APP_INFURA_URL_TESTNET = process.env.REACT_APP_INFURA_URL_TESTNET
const WALLET_ADDRESS = process.env.REACT_APP_WALLET_ADDRESS
const WALLET_SECRETE = process.env.REACT_APP_WALLET_SECRETE

const provider = new ethers.providers.JsonRpcProvider(REACT_APP_INFURA_URL_TESTNET) // sepolia
//const poolAddress = "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640" // WETH / USDC
const poolAddress = "0x9799b5edc1aa7d3fad350309b08df3f64914e244" // WETH / USDC
const swapRouterAddress = "0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E"

const name0 = 'Wrapped Ether'
const symbol0 = 'WETH'
const decimals0 = 18
const address0 = '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14' // native Sepolia ETH sETH (WETH)

const name1 = 'USDC Token'
const symbol1 = 'USDC'
const decimals1 = 18
const address1 = '0x6f14C02Fc1F78322cFd7d707aB90f18baD3B54f5'

async function main() {
    const poolContract  = new ethers.Contract(
        poolAddress,
        IUniswapV3PoolABI,
        provider
    )

    const immutables = await getPoolImmutables(poolContract)
    const state = await getPoolState(poolContract)
  
    const wallet = new ethers.Wallet(WALLET_SECRETE)
    const connectedWallet = wallet.connect(provider)

    const swapRouterContract = new ethers.Contract(
        swapRouterAddress,
        SwapRouterABI,
        provider
    )

    const inputAmount = 0.001
    const amountIn = ethers.utils.parseUnits(
        inputAmount.toString(),
        decimals0
    )

    const approvalAmount = (amountIn * 100000).toString()
    const tokenContract0 = new ethers.Contract(
        address0,
        ERC20ABI,
        provider
    )

    const approvalResponse = await tokenContract0.connect(connectedWallet).approve(
        swapRouterAddress,
        approvalAmount
    )

    const params = {
        tokenIn: immutables.token1,
        tokenOut: immutables.token0,
        fee: immutables.fee,
        recipient: WALLET_ADDRESS,
        deadline: Math.floor(Date.now() / 1000) + (60 * 10),
        amountIn: amountIn,
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0
    }


    const transaction = swapRouterContract.connect(connectedWallet).exactInputSingle(
        params,
        {
            gasLimit: ethers.utils.hexlify(1000000)
        }
    ).then(transaction => {
        console.log(transaction)
    })
    
}

main()