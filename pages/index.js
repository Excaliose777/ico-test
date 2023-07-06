import Head from 'next/head'
import {useEffect, useState} from "react"
import styles from '../styles/Home.module.css'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { BigNumber, providers, utils, Contract} from "ethers";
import { useProvider , useSigner, useConnect, useAccount, useContract} from 'wagmi'
import{goerli} from "wagmi/chains"
import {TOKEN_ABI, TOKEN_ADDRESS} from "../constants"

export default function Home() {


  const { connector: isConnected, address} = useAccount();
  const { data: signer } = useSigner({chainId:goerli.id});
  const provider = useProvider();

  // Create a BigNumber `0`
  const zero = BigNumber.from(0);
  // loading is set to true when we are waiting for a transaction to get mined
  const [loading, setLoading] = useState(false);
  // balanceOfStoneTokens keeps track of number of Stone tokens owned by an address
  const [balanceOfStoneTokens, setBalanceOfStoneTokens] = useState(zero);
  // amount of the tokens that the user wants to mint
  const [tokenAmount, setTokenAmount] = useState(zero);
  const [ETH, setETH] = useState(zero);
  // tokensMinted is the total number of tokens that have been minted till now out of 10000(max total supply)
  const [tokensMinted, setTokensMinted] = useState(zero);
  // isOwner gets the owner of the contract through the signed address
  const [isOwner, setIsOwner] = useState(false);

  // checks the balance of Stone Tokens's held by an address

  const getBalanceOfStoneTokens = async () => {
    try {
      // Create an instace of token contract
      const tokenContract = new Contract(
        TOKEN_ADDRESS,
        TOKEN_ABI,
        provider
      );
      // Get the address associated to the signer which is connected to  MetaMask
      // const address = await signer.getAddress();
      // call the balanceOf from the token contract to get the number of tokens held by the user
      const balance = await tokenContract.balanceOf(address);
      // balance is already a big number, so we dont need to convert it before setting it
      setBalanceOfStoneTokens(balance);
    } catch (err) {
      console.error(err);
      setBalanceOfStoneTokens(zero);
    }
  };

    /**
   * mintStoneToken: mints `amount` number of tokens to a given address
   */
    const mintStoneToken = async (amount) => {
      try {
        // Create an instance of tokenContract
        const tokenContract = new Contract(
          TOKEN_ADDRESS,
          TOKEN_ABI,
          signer
        );
        // Each token is of `0.0001 ether`. The value we need to send is `0.0001 * amount`
        const value = 0.0001 * amount;
        const tx = await tokenContract.mint(amount, {
          // value signifies the cost of one stone token which is "0.0001" eth.
          // We are parsing `0.0001` string to ether using the utils library from ethers.js
          value: utils.parseEther(value.toString()),
        });
        setLoading(true);
        // wait for the transaction to get mined
        await tx.wait();
        setLoading(false);
        window.alert("Sucessfully minted Stone Tokens");
        await getBalanceOfStoneTokens();
        await getTotalTokensMinted();
      } catch (err) {
        console.error(err)
      }
    };

      /**
   * getTotalTokensMinted: Retrieves how many tokens have been minted till now
   * out of the total supply
   */
  const getTotalTokensMinted = async () => {
    try {
      // Create an instance of token contract
      const tokenContract = new Contract(
        TOKEN_ADDRESS,
        TOKEN_ABI,
        provider
      );
      // Get all the tokens that have been minted
      const _tokensMinted = await tokenContract.totalSupply();
      setTokensMinted(_tokensMinted);
    } catch (err) {
      console.error(err);
    }
  };

  const getTotalEth = async () => {
    try {
      const ethBalance = await provider.getBalance(address);
      setETH(ethBalance);
    } catch (err) {
      console.error(err);
    }
  };

    /**
   * getOwner: gets the contract owner by connected address
   */
    const getOwner = async () => {
      try {
        const tokenContract = new Contract(
          TOKEN_ADDRESS,
          TOKEN_ABI,
          provider
        );
        // call the owner function from the contract
        const _owner = await tokenContract.owner();
        // Get the address associated to signer which is connected to Metamask
        // const address = await signer.getAddress();
        if (address.toLowerCase() === _owner.toLowerCase()) {
          setIsOwner(true);
        }
      } catch (err) {
        console.error(err.message);
      }
    };
  
    /**
     * withdrawCoins: withdraws ether by calling
     * the withdraw function in the contract
     */
    const withdrawCoins = async () => {
      try {
        const tokenContract = new Contract(
          TOKEN_ADDRESS,
          TOKEN_ABI,
          signer
        );
  
        const tx = await tokenContract.withdraw();
        setLoading(true);
        await tx.wait();
        setLoading(false);
        await getOwner();
      } catch (err) {
        console.error(err);
        window.alert(err.reason);
      }
    };
  
    useEffect(() => {

      console.log("stuff")
      getTotalTokensMinted();
      getBalanceOfStoneTokens();
      getTotalEth();
      getOwner();
  }, [isConnected]);



  const render = () =>{
    return (
      <div style={{ display: "flex-col" }}>
      <div>
        <input
          type="number"
          placeholder="Amount of Tokens"
          // BigNumber.from converts the `e.target.value` to a BigNumber
          // onChange={(e) => setTokenAmount(BigNumber.from(e.target.value))}
          onChange={(e) => setTokenAmount(e.target.value === "" ? 0 : BigNumber.from(e.target.value))}
          className={styles.input}
        />
      </div>

      <button
        className={styles.button}
        disabled={!(tokenAmount > 0)}
        onClick={() => mintStoneToken(tokenAmount)}
      >
        Mint Tokens
      </button>
    </div>
    )
  }


  return (
    <div className={styles.container}>
      <Head>
        <title>ICO Test</title>
        <meta name="description" content="Stone ICO Test" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div>
        <ConnectButton/>
      </div>
      {isConnected ? 
      <div className={styles.main}>
        <div>
          <div className={styles.description}>
            You have {Number(utils.formatEther(ETH)).toFixed(2)} ETH
          </div>
          <div className={styles.description}>
            {/* Format Ether helps us in converting a BigNumber to string */}
            You have minted {utils.formatEther(balanceOfStoneTokens)} Stone Tokens
          </div>
          <div className={styles.description}>
            {/* Format Ether helps us in converting a BigNumber to string */}
            Overall {utils.formatEther(tokensMinted)}/500,000 have been minted
          </div>
          {render()}

          {isOwner ? (
              <div>
                  {loading ? <button className={styles.button}>Loading...</button> : 
                  <button className={styles.button} onClick={withdrawCoins}>
                    Withdraw Coins
                  </button>
                  }
              </div> ) : ("")
          }
        </div>
      </div> : <h3>Connect wallet</h3>}
    </div>
  )
}
