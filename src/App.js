import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
// import * as s from "./styles/globalStyles";
// import styled from "styled-components";
import { useMoralis } from "react-moralis";
// import Moralis from "moralis/types";
// import '../public/config/the-nftist.webflow.css'
// import './styles/the-nftist.webflow.css'
// import Background from "./images/PTRNS.png";

const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;



function App() {

  const { authenticate, isAuthenticated, user, Moralis } = useMoralis();


  // if (isAuthenticated) 
  //   {
  //     console.log("you are authenticated")
  //     console.log(Moralis.User.current())


  //   }


  const Whitelist = Moralis.Object.extend("whiteList")


  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(``);
  const [mintAmount, setMintAmount] = useState(1);
  const [numberWhiteListed, setWhitelisted] = useState(1);
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MAX_SUPPLY: 1,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false,
  });

  const claimNFTs = () => {
    
    let cost = CONFIG.WEI_COST;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);
    let totalGasLimit = String(gasLimit * mintAmount);
    console.log("Cost: ", totalCostWei);
    console.log("Gas limit: ", totalGasLimit);
    setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
    setClaimingNft(true);
    blockchain.smartContract.methods
      .mint(mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        console.log(err);
        setFeedback("Sorry, something went wrong please try again later.");
        setClaimingNft(false);
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(
          `WOW, the ${CONFIG.NFT_NAME} is yours! go visit Opensea.io to view it.`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
      });
  };

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const checkIfWhiteListed = async() => {
    // console.log((blockchain.account))
    const query = new Moralis.Query(Whitelist)
    var blockchainAddress = blockchain.account
    const x = blockchainAddress.toLowerCase();
    console.log("value of address lowercased")
    console.log(x)
    query.equalTo("whiteListAddress", x)
    const result = await query.find();
    console.log("result from within the function")
    console.log(blockchain.account)
    console.log("number of entries in db")
    console.log(result.length)
    // console.log(result)
    // console.log(result.length)
    // if(result.length != 0)
    //   return 0;
    // else
    //   return 1;
    setWhitelisted(result.length)
  }












  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > 3) {
      newMintAmount = 3;
    }
    setMintAmount(newMintAmount);
  };

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  };

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);

  return (
    <span>
    <style dangerouslySetInnerHTML={{ __html: `
      @import url(/css/normalize.css);
      @import url(/css/webflow.css);
      @import url(/css/the-nftist-570236cba5e431591bb69af0c978.webflow.css);
    ` }} />
    <span className="af-view">
      <div className="af-class-body">
        <div className="af-class-top af-class-wf-section" />
        <div id="navbar" className="af-class-header af-class-wf-section">
          <div data-animation="default" data-collapse="medium" data-duration={400} data-easing="ease" data-easing2="ease" role="banner" className="af-class-navbar w-nav">
            <div className="af-class-ma w-container">
              <a href="http://www.thenftist.com" className="w-inline-block"><img src="images/logo.svg" loading="lazy" alt className="af-class-image" /></a>
            </div>
          </div>
        </div>
        <div className="af-class-baner af-class-wf-section">
          <div className="af-class-main_conatiner">
            <div className="af-class-baner_row">
              <div className="af-class-left_side">
                <h4 className="af-class-h1">EVERYTHING ABOUT EVERYTHING ON NFTs</h4>
                <p className="af-class-curated">Curated, filtered &amp; overdelivered.</p>
                <a href="https://polygonscan.com/address/0xceacec7383f7edbbcc585b5c9b1777b05161c53e" target="_blank" className="af-class-h1 "
                style={{color:"#c4fd38", fontSize:"17px", textDecoration: "none"}}
                >{truncate(CONFIG.CONTRACT_ADDRESS, 50)}</a>
                 <p className="af-class-curated">1 NFT costs 332 MATIC.</p>
                 <p className="af-class-curated">Excluding Gas fees</p>
                <div className="af-class-div-block-2"><img src="images/Timer.png" loading="lazy" sizes="100vw" srcSet="images/Timer-p-500.png 500w, images/Timer.png 510w" alt className="af-class-image-2 af-class-dddd" />
                 
                  <div id="js-clock" className="af-class-js-clock" style={{alignment:"centre"}}>
                    <div className="af-class-box">
                      <button 
                      style={{backgroundColor:"transparent"}}
                      id="js-clock-hours" 
                      className="af-class-clock-number"
                      onClick={(e) => {
                        e.preventDefault();
                        decrementMintAmount();
                      }}
                      >-</button>
                    </div>
                    <div className="af-class-box">
                      <div id="js-clock-minutes" className="af-class-clock-number"> {mintAmount} </div>


                      {blockchain.account === "" ||
                      blockchain.smartContract === null ? (
                        <div>
                          
                          <button
                       style={{backgroundColor:"transparent"}}
                       className="af-class-clock-label"
                       onClick={(e) => {

                        
                        e.preventDefault();
                        dispatch(connect());
                        getData();

                        // checkIfWhiteListed()
                        //   console.log("numberWhiteListed")
                        //   console.log(numberWhiteListed)
                          

                          




                      }}
                       >CONNECT</button>
                       {blockchain.errorMsg !== "" ? (
                      <>
                        <div
                          style={{
                            // paddingTop:"20px",
                            textAlign: "center",
                            color: "var(--accent-text)",
                          }}
                        >
                          {blockchain.errorMsg}
                        </div>
                      </>
                    ) : null}



                          </div>
                      ) : (



                        <div
                        style={{alignment:"centre"}}>
                          
                          <button
                       style={{backgroundColor:"transparent"}}
                       className="af-class-clock-label"
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          console.log("sssss")
                          console.log(blockchain.account)
                          // console.log("xxxx")
                          // console.log(checkIfWhiteListed())
                          checkIfWhiteListed()
                          // console.log("numberWhiteListed")
                          // console.log(numberWhiteListed)
                          if (numberWhiteListed === 2)
                          {
                            console.log("You are White Listed")
                          console.log(blockchain.account)
                          claimNFTs();
                          getData();
                          }
                          else
                          {
                            setFeedback(
                              `Please Try again.If it keeps happening, you are not white listed.`
                            );
                            console.log("You are not Whitellisted")
                          }

                        }}
                      >
                        {claimingNft ? "BUSY" : "MINT"}
                      </button>
                      
                      
                          </div>
                          
                      )}















                    <div
                    style={{width:"300px", paddingLeft:"auto"}}>
                      {feedback}
                        </div>
                    </div>
                    <div className="af-class-box">
                      <button
                      style={{backgroundColor:"transparent"}}
                       id="js-clock-seconds" 
                       className="af-class-clock-number"
                       onClick={(e) => {
                        e.preventDefault();
                        incrementMintAmount();
                      }}
                       >+</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="af-class-footer af-class-wf-section">
        {/* <p className="af-class-h1"
        >Please make sure you are connected to the right network(Polygon Mainnet) and the correct address. Please node:
        Once you make a purchase, you cannot undo this action.</p> */}
          <div className="af-class-socilla af-class-_2">
            <a href="index.html" aria-current="page" className="w-inline-block w--current"><img src="images/footer.png" loading="lazy" width={410} alt className="af-class-image-32" /></a>
            <div className="af-class-ivoocn-ara">
              <a href="http://discord.gg/thenftist" className="w-inline-block"><img src="images/Vector-1_1Vector-1.png" loading="lazy" alt className="af-class-image-9 af-class-etarass" /></a>
              <a href="https://facebook.com/thenftist" className="w-inline-block"><img src="images/facebook-1.svg" loading="lazy" alt className="af-class-image-9" /></a>
              <a href="https://www.instagram.com/thenftist/" className="w-inline-block"><img src="images/instagram-1_1instagram-1.png" loading="lazy" alt className="af-class-image-9" /></a>
              <a href="https://t.me/thenftistchat" className="w-inline-block"><img src="images/icons8-telegram-app-1_1icons8-telegram-app-1.png" loading="lazy" alt className="af-class-image-9" /></a>
              <a href="https://twitter.com/thenftist" className="w-inline-block"><img src="images/twitter-1_1twitter-1.png" loading="lazy" alt className="af-class-image-9" /></a>
            </div>
            <div className="af-class-ivoocn-ara af-class-_2">
              <a href="https://www.thenftist.com/privacy-policy" className="af-class-link-block-2 w-inline-block">
                <div className="af-class-text-block-3">Privacy Policy</div>
              </a>
              <a href="https://www.thenftist.com/terms-and-conditions" className="af-class-link-block-3 w-inline-block">
                <div className="af-class-text-block-3">Terms and Conditions</div>
              </a>
            </div>
          </div>
        </div>
        {/* [if lte IE 9]><![endif] */}
      </div>
    </span>
  </span>
  );
}

export default App;
