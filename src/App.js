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





  const scripts = [
    { loading: fetch("https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js?site=61eda91837e7205c0ad1ff02").then(body => body.text()), isAsync: false },
    { loading: fetch("js/webflow.js").then(body => body.text()), isAsync: false },
    { loading: Promise.resolve("!function(){function o(e,t){e=\"0\"+e;return e.substr(e.length-t)}function s(e){e=e,t=Date.parse(e);var e=(isNaN(t)?Date.parse(e.replace(/-/g,\"/\").replace(/[a-z]+/gi,\" \")):t)-Date.parse(new Date),t=Math.floor(e/1e3%60),n=Math.floor(e/1e3/60%60),r=Math.floor(e/36e5%24);return{total:e,days:Math.floor(e/864e5),hours:r,minutes:n,seconds:t}}{var e=\"js-clock\",l=\"2022/01/24 17:00\";let t=document.getElementById(e+\"-days\"),n=document.getElementById(e+\"-hours\"),r=document.getElementById(e+\"-minutes\"),a=document.getElementById(e+\"-seconds\");var u=setInterval(function(){var e=s(l);e.total<=0?clearInterval(u):(t.innerHTML=o(e.days,2),n.innerHTML=o(e.hours,2),r.innerHTML=o(e.minutes,2),a.innerHTML=o(e.seconds,2))},1e3)}}();"), isAsync: false },
    { loading: fetch("https://code.jquery.com/jquery-3.6.0.min.js").then(body => body.text()), isAsync: false },
    { loading: Promise.resolve("$(window).scroll(function(){500<=$(window).scrollTop()?$(\"#navbar\").addClass(\"Sticky_Headerh\"):$(\"#navbar\").removeClass(\"Sticky_Headery\")});"), isAsync: false },
  ]










function App() {

  scripts.concat(null).reduce((active, next) => Promise.resolve(active).then((active) => {
    const loading = active.loading.then((script) => {
      new Function(`
        with (this) {
          eval(arguments[0])
        }
      `).call(window, script)

      return next
    })

    return active.isAsync ? next : loading
  }))

  

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
    setFeedback(`Minting your NFT...`);
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

  // const checkIfWhiteListed = async() => {
  //   // console.log((blockchain.account))
  //   const query = new Moralis.Query(Whitelist)
  //   var blockchainAddress = blockchain.account
  //   const x = blockchainAddress.toLowerCase();
  //   console.log("value of address lowercased")
  //   console.log(x)
  //   query.equalTo("whiteListAddress", x)
  //   const result = await query.find();
  //   console.log("result from within the function")
  //   console.log(blockchain.account)
  //   console.log("number of entries in db")
  //   console.log(result.length)
  //   // console.log(result)
  //   // console.log(result.length)
  //   // if(result.length != 0)
  //   //   return 0;
  //   // else
  //   //   return 1;
  //   setWhitelisted(result.length)
  // }












  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > 2) {
      newMintAmount = 2;
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
      @import url(/css/the-nftist-570236cba5e431-fe7c05599833c.webflow.css);
    ` }} />
    <span className="af-view">
      <div className="af-class-body">
        <div className="af-class-top af-class-wf-section" />
        <div id="navbar" className="af-class-header af-class-wf-section">
          <div data-animation="default" data-collapse="medium" data-duration={400} data-easing="ease" data-easing2="ease" role="banner" className="af-class-navbar w-nav">
            <div className="af-class-ma w-container">
              <div className="af-class-top-left-mobile"><img src="images/Discord-Logo-Black-mobile_1Discord-Logo-Black-mobile.png" loading="lazy" alt className="af-class-image-22" /></div>
              <a href="#" className="af-class-brand w-nav-brand"><img src="images/logo.svg" loading="lazy" alt className="af-class-image" /></a>
              <nav role="navigation" className="af-class-nav-menu w-nav-menu">
                <a href="#abstract" className="af-class-menuuss w-nav-link">ABSTRACT</a>
                <a href="#meet-nftist" className="af-class-menuuss w-nav-link">COLLECTION</a>
                <a href="#privileges" className="af-class-menuuss w-nav-link">PRIVILEGES</a>
                <a href="#ecosystem" className="af-class-menuuss w-nav-link">ECOSYSTEM</a>
                <a href="#roadmap" className="af-class-menuuss w-nav-link">ROADMAP</a>
                <a href="#team" className="af-class-menuuss w-nav-link">TEAM</a>
                <a href="#faq" className="af-class-menuuss w-nav-link">FAQ</a>
                <a href="http://discord.gg/thenftist" target="_blank" className="af-class-menuuss af-class-mint-now w-nav-link">join discord</a>
              </nav>
              <div className="af-class-menu-button w-nav-button">
                <div className="af-class-icon-2 w-icon-nav-menu" /><img src="images/Hamburger_1Hamburger.png" loading="lazy" alt className="af-class-image-10" />
              </div>
            </div>
          </div>
        </div>
        <div className="af-class-baner af-class-wf-section">
          <div className="af-class-main_conatiner">
            <div className="af-class-baner_row">
              <div className="af-class-left_side">
                <h4 className="af-class-h1">EVERYTHING ABOUT EVERYTHING ON NFTs</h4>
                <p className="af-class-curated">Curated, filtered &amp; overdelivered.</p>
                <div className="af-class-div-block-2" alignment="centre" style={{height:"200px"}}><img src="images/Timer.png" loading="lazy" sizes="100vw" srcSet="images/Timer-p-500.png 500w, images/Timer.png 510w" alt className="af-class-image-2 af-class-dddd" />
                 
                 <div id="js-clock" className="af-class-js-clock" style={{alignment:"centre"}}>
                   <div className="af-class-box" style={{alignment:"centre"}}>
                     <button 
                     style={{backgroundColor:"transparent", alignment:"centre",marginRight:"50px",}}
                     id="js-clock-hours" 
                     className="af-class-clock-number"
                     onClick={(e) => {
                       e.preventDefault();
                       decrementMintAmount();
                     }}
                     >-</button>
                   </div>
                   <div className="af-class-box" style={{alignment:"centre"}}>
                     <div id="js-clock-minutes" className="af-class-clock-number" style={{alignment:"centre"}}> {mintAmount} </div>


                     {blockchain.account === "" ||
                     blockchain.smartContract === null ? (
                       <div style={{alignment:"centre"}}>
                         
                         <button
                      style={{backgroundColor:"transparent", width:"300px", alignment:"centre" ,paddingTop:"10px" ,fontSize:"40px"}}
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
                           width:"auto",
                           paddingLeft:"100px",
                           alignment: "center",
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
                        //  checkIfWhiteListed()
                         // console.log("numberWhiteListed")
                         // console.log(numberWhiteListed)
                        //  if (numberWhiteListed === 2)
                        //  {
                           console.log("You are White Listed")
                         console.log(blockchain.account)
                         claimNFTs();
                         getData();
                        //  }
                        //  else
                        //  {
                          //  setFeedback(
                          //    `Please Try again.If it keeps happening, you are not white listed.`
                          //  );
                           console.log("You are not Whitellisted")
                        //  }

                       }}
                     >
                       {claimingNft ? "BUSY" : "MINT"}
                     </button>
                     
                     
                         </div>
                         
                     )}














                         {/* lalalalal */}
                   <div
                   style={{width:"320px", paddingLeft:"auto", color: "var(--accent-text)" , textAlign: "center"}}>
                     {feedback}
                       </div>
                   </div>
                   <div className="af-class-box">
                     <button
                     style={{backgroundColor:"transparent", marginLeft:"50px", fontSize:"60px"}}
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






                {/* <div className="af-class-div-block-2">
                  <div id="js-clock" className="af-class-js-clock">
                    <div className="af-class-box">
                      <div id="js-clock-hours" className="af-class-clock-number">-</div>
                    </div>
                    <div className="af-class-box">
                      <div id="js-clock-minutes" className="af-class-clock-number">0</div>
                      <h3 className="af-class-abstractabstract">Mint your NFT</h3>
                    </div>
                    <div className="af-class-box">
                      <div id="js-clock-seconds" className="af-class-clock-number">+</div>
                    </div>
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        </div>
        <div className="af-class-meet-the-nftist af-class-neeeee af-class-wf-section">
          <div id="abstract" className="af-class-main_conatiner">
            <div data-w-id="d86c94c1-a3a8-0844-6d54-a4ed675b7dca" className="af-class-abstract">
              <div className="af-class-asphalt_roe"><img src="images/Energy.png" loading="lazy" alt className="af-class-image-5" />
                <h3 className="af-class-abstractabstract">ABSTRACT</h3><img src="images/Energy-1.png" loading="lazy" alt className="af-class-image-4" />
              </div>
              <p className="af-class-parafa af-class-newpara">The project was first initiated due to a vital necessity of the NFT space, which had to be dealt with. NFTs have been bought and sold since the ERC-721 protocol. Along the way, we’ve noticed that the means of searching information were taking place on Google, with the end results being met after a long period of time. By being endlessly redirected to other platforms such as Youtube, Telegram and others, &nbsp;the user ended up with a considerable loss of money and poor decision making. Once we became aware of the errors, and that Google is ultimately a search engine and not an authority of the NFT space, the change process had started. Being a global, unsolved and daily encountered issue, we conducted an analysis, and got to the conclusion that search engines can also provide irrelevant and, in this case, useless information, as a result of paid ads and non-curated content. Furthermore, it also takes up a lot of energy and time until someone can actually finish their research or end up identifying valuable, trustworthy NFT projects which deserve investing in. And this is how this challenging adventure of ours started.</p>
              <a href="https://litepaper.thenftist.com/litepaper.pdf" target="_blank" className="af-class-join-discord af-class-litepaper">LITEPAPER</a>
            </div>
            <div className="af-class-abstract af-class-second_addpahta">
              <div className="af-class-asphalt_roe af-class-dddsds"><img src="images/Energy.png" loading="lazy" alt className="af-class-image-5" />
              <h3 className="af-class-abstractabstract af-class-ddxcfdxc">DECENTRALISED MEDIA AUTHORITY</h3><img src="images/Energy-1.png" loading="lazy" alt className="af-class-image-4" />
              </div>
              <p className="af-class-parafa af-class-newww">THE NFTiST has came out with the objective of becoming the authority of the NFT Industry, by guiding its members through the ocean of information, and assisting them in making profitable decisions. As the World’s First decentralised media trust, this authority will provide its exclusive community with vital tools, strategies and events which will lead them to a sure win!</p>
              <div className="af-class-noine af-class-decent-text-bottom af-class-sdd">
                <div className="af-class-areaa">Our community includes three categories: NFT Creators, NFT Investors and the Curious ones. We have created an ecosystem aiming to simplify the means of understanding this industry for each of its members, in a time efficient manner, and also succeed by being part of it.</div>
              </div>
            </div>
          </div>
        </div>
        <div className="af-class-section af-class-wf-section">
          <div id="meet-nftist" className="af-class-main_conatiner af-class-meet-container">
            <div className="af-class-asphalt_roe af-class-dddsds af-class-smaalal"><img src="images/Energy.png" loading="lazy" alt className="af-class-image-5" />
              <h3 className="af-class-abstractabstract af-class-meet-the-nftistmeet-the-nftist">MEET THE NFTiST</h3><img src="images/Energy-1.png" loading="lazy" alt className="af-class-image-4" />
            </div>
          </div>
        </div>
        <div className="af-class-phone_iamge_areaa af-class-wf-section">
          <div className="af-class-image-box-meet"><img src="images/Cards-NFTs-Iso.png" loading="lazy" sizes="(max-width: 723px) 100vw, (max-width: 991px) 723px, 100vw" srcSet="images/Cards-NFTs-Iso-p-500.png 500w, images/Cards-NFTs-Iso.png 723w" alt className="af-class-image-11" /></div>
          <div data-w-id="2b2484e2-0624-1235-d3a6-a6606c9dcd35" style={{opacity: 0}} className="af-class-noine af-class-mobile-noine">
            <div className="af-class-areaa">This is a limited NFT collection of 10.000 unique pieces of art, manually drawn, each one living on the Ethereum blockchain using Polygon Matic as we wanted to take care of our members and make sure our community will avoid the large gas fees.</div>
          </div>
          <div className="af-class-main_conatiner af-class-noine-container af-class-dddddd">
            <div className="af-class-noine af-class-desktop af-class-asasss">
              <div className="af-class-areaa">This is a limited NFT collection of 10.000 unique pieces of art, manually drawn, each one living on the Ethereum blockchain, using Polygon Matic, as we wanted to take care of our members and make sure our community will be able to avoid the large gas fee.</div>
            </div>
            <div className="af-class-div-block-6"><img src="images/Cards-NFTs-Iso.png" loading="lazy" sizes="100vw" srcSet="images/Cards-NFTs-Iso-p-500.png 500w, images/Cards-NFTs-Iso.png 723w" alt /></div>
          </div>
        </div>
        <div className="af-class-balll af-class-wf-section">
          <div className="af-class-container w-container">
            <div className="af-class-left_container">
              <div className="w-layout-grid af-class-grid">
                <img src="https://raw.githubusercontent.com/mbaxamb3333/nftresources/main/1-p-800.jpeg" loading="lazy" sizes="(max-width: 1439px) 300px, 400px" alt className="af-class-left" />
                <img src="https://raw.githubusercontent.com/mbaxamb3333/nftresources/main/2-p-800.jpeg" loading="lazy" id="w-node-e96db595-81a5-6109-22f8-fbd7ca22f132-3ad1ff04" sizes="300px" alt className="af-class-right" />
                <img src="https://raw.githubusercontent.com/mbaxamb3333/nftresources/main/3-p-1080.jpeg" loading="lazy" id="w-node-_364b15f0-e367-753f-73b6-66b7f729ea97-3ad1ff04" sizes="(max-width: 1439px) 300px, 500px"  alt className="af-class-image-34" />
                <img src="https://raw.githubusercontent.com/mbaxamb3333/nftresources/main/4-p-800.jpeg" loading="lazy" id="w-node-_91acda23-0fb6-4197-97ba-83e4e46486a2-3ad1ff04" sizes="300px"  alt className="af-class-right" /></div>
            </div>
            <div className="af-class-main_conatiner">
              <div className="af-class-image-box-meet af-class-ball-mobile-image"><img src="images/NFTs.png" loading="lazy" alt className="af-class-image-11 af-class-meet-ball-img" /></div>
              <div className="af-class-duucteat af-class-saaas">
                <div className="af-class-araea">THE NFTIST ART COLLECTION IS COMPLETELY UNIQUE AND HAS GENERATED OVER 100+ TRAITS, TO MAKE SURE WE HAVE ENOUGH RARITY</div>
                <div className="af-class-div-block-6"><img src="images/Cards-NFTs-Iso.png" loading="lazy" sizes="100vw" srcSet="images/Cards-NFTs-Iso-p-500.png 500w, images/Cards-NFTs-Iso.png 723w" alt /></div>
              </div>
            </div>
          </div>
        </div>
        <div className="af-class-privileges af-class-wf-section">
          <div id="privileges" className="af-class-main_conatiner">
            <div className="af-class-asphalt_roe"><img src="images/Energy.png" loading="lazy" alt className="af-class-image-5" />
              <h3 className="af-class-abstractabstract">PRIVILEGES</h3><img src="images/Energy-1.png" loading="lazy" alt className="af-class-image-4" />
            </div>
            <h1 className="af-class-h3 af-class-priviles af-class-ss">THIS IS HOW WE SEE CONSTANT GROWTH</h1>
            <p className="af-class-nfitss">This is no ordinary project! We don’t see THE NFTiST only as a beautiful collection of digital art, but as the trusted media provider for the entire NFT industry.</p>
            <div className="af-class-numberr">
              <div className="af-class-booxes">
                <h3 className="af-class-_01">01</h3><img src="images/Rectangle-194-1.png" loading="lazy" alt className="af-class-image-6 af-class-bss" />
                <div className="af-class-te af-class-sss">Your NFT will be used as log in access (instead of username and password, you will log in using your MetaMask wallet and your NFT will be immediately recognised by the platform).</div>
              </div>
              <div className="af-class-booxes">
                <h3 className="af-class-_01">02</h3>
                <div className="af-class-te af-class-sss">The NFT doubles as a membership card to help you access exclusive events, with top influencers, celebrities and leaders from the NFT space.</div><img src="images/Rectangle-194-1.png" loading="lazy" alt className="af-class-image-6 af-class-bss" />
              </div>
              <div className="af-class-booxes">
                <h3 className="af-class-_01">03</h3>
                <div className="af-class-te af-class-sss">The NFT Launchpad will constantly release projects you won't find anywhere else. Before being listed, these will be verified by us and our community leaders first.</div><img src="images/Rectangle-194-1.png" loading="lazy" alt className="af-class-image-6 af-class-bss" />
              </div>
              <div className="af-class-booxes">
                <h3 className="af-class-_01">04</h3>
                <div className="af-class-te af-class-sss">To add extra glitter to the utility, some NFTs are rarer than others. If you are fortunate enough to mint one, here is what’s coming your way.</div><img src="images/Rectangle-194-1.png" loading="lazy" alt className="af-class-image-6 af-class-bss" />
              </div>
            </div>
          </div>
        </div>
        <div className="af-class-the-ecosystem-includes af-class-section-2 af-class-wf-section">
          <div id="ecosystem" className="af-class-main_conatiner af-class-includes-container">
            <div className="af-class-asphalt_roe af-class-dddsds af-class-smaalal af-class-arraea"><img src="images/Energy.png" loading="lazy" alt className="af-class-image-5" />
              <h3 className="af-class-abstractabstract af-class-meet-the-nftistmeet-the-nftist af-class-sadsacd">THE ECOSYSTEM INCLUDES</h3><img src="images/Energy-1.png" loading="lazy" alt className="af-class-image-4" />
            </div><img src="images/Ecosystem.png" loading="lazy" sizes="100vw" srcSet="images/Ecosystem-p-500.png 500w, images/Ecosystem-p-800.png 800w, images/Ecosystem-p-1080.png 1080w, images/Ecosystem.png 1548w" alt className="af-class-image-7" />
            <div data-w-id="3eda21f8-d5bb-cb25-5d55-c0307b8084e3" style={{opacity: 0}} className="af-class-dsfghn af-class-desktop-nft af-class-hideee">
              <div className="af-class-ecpsys">
                <div className="af-class-areradd">
                  <div className="af-class-vvff">NFT Launchpad (projects you won’t find anywhere else, audited by us and our community before we list them on the platform)</div>
                </div>
                <div className="af-class-areradd">
                  <div className="af-class-vvff">Daily news</div>
                </div>
                <div className="af-class-areradd">
                  <div className="af-class-vvff">In-depth articles</div>
                </div>
                <div className="af-class-areradd">
                  <div className="af-class-vvff">Analysis, strategies</div>
                </div>
                <div className="af-class-areradd">
                  <div className="af-class-vvff">One Minute Podcasts</div>
                </div>
              </div>
            </div>
            <div data-w-id="e63741b0-5c47-ac1f-c689-2ac59b277b04" style={{opacity: 0}} className="af-class-dsfghn af-class-mobile-city-design">
              <div className="af-class-ecpsys af-class-mobile-city-text">
                <div className="af-class-areradd">
                  <div className="af-class-vvff">NFT Launchpad (projects you won’t find anywhere else, audited by us and our community before we list them on the platform)</div>
                </div>
                <div className="af-class-areradd">
                  <div className="af-class-vvff">Daily news</div>
                </div>
                <div className="af-class-areradd">
                  <div className="af-class-vvff">In-depth articles</div>
                </div>
                <div className="af-class-areradd">
                  <div className="af-class-vvff">Analysis, strategies</div>
                </div>
                <div className="af-class-areradd">
                  <div className="af-class-vvff">One Minute Podcasts</div>
                </div>
              </div><img src="images/Group-342-1.png" loading="lazy" alt className="af-class-image-12 af-class-byee" />
            </div>
            <div className="af-class-used_only_mobile">
              <div className="af-class-areaad">
                <div className="af-class-ineer_boxed"><img src="https://raw.githubusercontent.com/mbaxamb3333/nftresources/main/x.png"  alt className="af-class-image-27" />
                  <h1 className="af-class-ffffff-ffffff">CURATED CONTENT PLATFORM</h1>
                  <div className="af-class-text-block-2">Our platform will include projects that cannot be found anywhere else, including daily news, in-depth articles, analysis, one minute podcasts and many more.</div>
                </div>
                <div className="af-class-div-block-5"><img src="images/Group-353_1Group-353.png" loading="lazy" alt className="af-class-image-28 af-class-cscc" /></div>
              </div>
              <div className="af-class-areaad">
                <div className="af-class-ineer_boxed"><img src="https://raw.githubusercontent.com/mbaxamb3333/nftresources/main/y.png" loading="lazy" alt className="af-class-image-27" />
                  <h1 className="af-class-ffffff-ffffff">LIVE &amp; DIGITAL EVENTS</h1>
                  <div className="af-class-text-block-2">Being part of our ecosystem will give you the chance to meet high profile influencers, celebrities and leaders in the NFT industry. Our live events will take place in London, Dubai and USA.</div>
                </div>
                <div className="af-class-div-block-5"><img src="images/Group-353_1Group-353.png" loading="lazy" alt className="af-class-image-28 af-class-cscc" /></div>
              </div>
              <div className="af-class-areaad">
                <div className="af-class-ineer_boxed"><img src="images/VR_1VR.png" loading="lazy" alt className="af-class-image-27" />
                  <h1 className="af-class-ffffff-ffffff">CITY OF THE NFTiST</h1>
                  <div className="af-class-text-block-2">We are creating a new Metaverse city accessible only to our members. All kind of activities will be possible here, such as networking, parties, meetings, business opportunities and many more.<br /></div>
                </div>
                <div className="af-class-div-block-5"><img src="images/Group-353_1Group-353.png" loading="lazy" alt className="af-class-image-28 af-class-cscc" /></div>
              </div>
              <div className="af-class-areaad">
                <div className="af-class-ineer_boxed"><img src="images/Blockchain_1Blockchain.png" loading="lazy" alt className="af-class-image-27" />
                  <h1 className="af-class-ffffff-ffffff">EXLCUSIVE COMMUNITY BENEFITS</h1>
                  <div className="af-class-text-block-2">Each quarter we will be investing in 2 of our holders’ projects. Our members will choose the project we are going to invest in (DAO). Members will also have the possibility to invest.<br /></div>
                </div>
                <div className="af-class-div-block-5"><img src="images/Group-353_1Group-353.png" loading="lazy" alt className="af-class-image-28 af-class-cscc af-class-assss" /></div>
              </div>
            </div>
            <div className="af-class-newecosyetem af-class-nionesss">
              <div className="af-class-ecoroww">
                <div className="af-class-text_eco">
                  <div className="af-class-boxesss">
                    <div className="af-class-div-block-8"><img src="https://raw.githubusercontent.com/mbaxamb3333/nftresources/main/x.png" loading="lazy" alt className="af-class-image-37" />
                      <h3 className="af-class-curated-content-platform">CURATED CONTENT PLATFORM</h3>
                      <div className="af-class-par">Our platform will include unique content, including daily news, in-depth articles, analysis, one minute podcasts and the exclusive NFT Launchpad and many more.</div>
                    </div>
                    <div className="af-class-div-block-9"><img src="images/Rectangle-195-2.png" loading="lazy" alt className="af-class-image-29" /></div>
                  </div>
                  <div className="af-class-div-block-7" />
                  <div className="af-class-boxesss"><img src="https://raw.githubusercontent.com/mbaxamb3333/nftresources/main/y.png" loading="lazy" alt />
                    <div className="af-class-div-block-8">
                      <h3 className="af-class-curated-content-platform">LIVE &amp; DIGITAL EVENTS</h3>
                      <div className="af-class-par">Being part of our ecosystem will grant you the chance to meet high profile influencers, celebrities and leaders of the NFT industry. Our live events will take place in London, Dubai and the USA.</div>
                    </div>
                    <div className="af-class-div-block-9"><img src="images/Rectangle-195-2.png" loading="lazy" alt className="af-class-image-29" /></div>
                  </div>
                </div>
                <div className="af-class-iamge-eco"><img src="images/Group-355-2.png" loading="lazy" alt className="af-class-image-30" /></div>
                <div className="af-class-text_eco">
                  <div className="af-class-boxesss af-class-aaa af-class-kk">
                    <div className="af-class-div-block-8"><img src="images/VR_1VR.png" loading="lazy" alt className="af-class-image-35" />
                      <h3 className="af-class-curated-content-platform">CITY OF THE NFTiST</h3>
                      <div className="af-class-par">We are creating a new Metaverse city accessible only to our members. All kind of activities will be possible here, such as networking, parties, meetings, business opportunities and many more.</div>
                    </div>
                    <div className="af-class-div-block-9 af-class-right af-class-aaa"><img src="images/Rectangle-195-2.png" loading="lazy" alt className="af-class-image-29 af-class-right af-class-aaa" /></div>
                  </div>
                  <div className="af-class-div-block-7" />
                  <div className="af-class-boxesss">
                    <div className="af-class-div-block-8"><img src="images/Blockchain_1Blockchain.png" loading="lazy" alt className="af-class-image-36" />
                      <h3 className="af-class-curated-content-platform">EXLCUSIVE COMMUNITY BENEFITS</h3>
                      <div className="af-class-par">Each quarter we are going to invest in 2 of our holders’ projects. Our members will choose the project we are going to invest in (DAO). Members will also have the possibility to invest.</div>
                    </div>
                    <div className="af-class-div-block-9 af-class-right af-class-aaa"><img src="images/Rectangle-195-2.png" loading="lazy" alt className="af-class-image-29 af-class-aaa" /></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="af-class-we-are-creating af-class-wf-section">
          <div className="af-class-main_conatiner">
            <h4 className="af-class-heading">WE ARE CREATING A METAVERSE CITY CALLED</h4>
            <h4 className="af-class-heading-2">THE CITY OF THE NFTiST</h4>
            <p className="af-class-parafa af-class-bhfhhdd af-class-ssssss">This is a city of the future, accessible only to our members. The city is built of an old town, financial districts, shopping areas, red light districts and almost everything we can find in major cities. All kinds of activities will be possible, such as networking, fun gatherings, parties, meetings, business opportunities and more. The city will also incorporate a marketplace, to provide discounts for our NFTiSTs, integrating products related to our real world needs, ADS FREE. Our advantage is that we are already ahead of the game as we have been developing a VR &nbsp;technology since 2018, when we launched our first Live VR blockchain summit in Malta.</p>
          </div>
        </div>
        <div className="af-class-roadmaproadmap af-class-wf-section">

          <div id="roadmap" className="af-class-main_conatiner">

          <div className="af-class-asphalt_roe"><img src="images/Energy.png" loading="lazy" alt className="af-class-image-5" />
              <h3 className="af-class-abstractabstract">ROADMAP</h3><img src="images/Energy-1.png" loading="lazy" alt className="af-class-image-4" />
            </div>
            <h4 className="af-class-heading af-class-_2021010">2021</h4>
            <div className="af-class-roadmap_row af-class-noooo">
              <div className="af-class-taet-area">
                <div className="af-class-boxes_atera">
                  <div className="af-class-market-research-business-model-development">PRE SALE MINT. 2000 NFTs will be available to mint at 322 MATIC (0.2 ETH) + gas fees. Everyone will have the chance to mint one or more &nbsp;“ONE OF ONE” NFTs.</div>
                  <div className="af-class-q1">1</div><img src="https://raw.githubusercontent.com/mbaxamb3333/nftresources/main/Line-2_1Line%202.png" loading="lazy" alt className="af-class-image-25" />
                </div>
                <div className="af-class-boxes_atera af-class-notinn">
                  <div className="af-class-market-research-business-model-development">Once the sales have been concluded, The NFTs will be revealed. You’re now part of the first NFT Media Trust. Owning The NFTiST NFT will grant you access to our ecosystem, and help you be ahead of everyone in the industry.</div>
                  <div className="af-class-q1">3</div><img src="https://raw.githubusercontent.com/mbaxamb3333/nftresources/main/Line-2_1Line%202.png" loading="lazy" alt className="af-class-image-24" />
                </div>
                <div className="af-class-boxes_atera af-class-usedinmobile">
                  <div className="af-class-div-block-4"><img src="https://raw.githubusercontent.com/mbaxamb3333/nftresources/main/Line-2_1Line%202.png" loading="lazy" alt className="af-class-ccc" />
                    <div className="af-class-q1 af-class-cccc">Q2</div>
                    <div className="af-class-market-research-business-model-development af-class-ccccc">Core Team EstablishmentBrand Strategy &amp; Planning</div>
                  </div>
                </div>
                <div className="af-class-boxes_atera">
                  <div className="af-class-market-research-business-model-development">The platform is Ready! You can attend digital events, engage with the community and access a curated informational system, to help you make profitable decisions.</div>
                  <div className="af-class-q1 af-class-w">5</div><img src="images/Line10.png" loading="lazy" alt className="af-class-image-25 af-class-areaaa" />
                </div>
                <div className="af-class-boxes_atera">
                  <div className="af-class-market-research-business-model-development">Development Phase includes the launch of a new app along with a strong marketing and brandingstrategy in order to increase the awareness of our ecosystem. We know how important this is because we are not just an usual NFT project, but a trusted media authority of the NFT space.</div>
                  <div className="af-class-q1 af-class-w">7</div><img src="images/Line10.png" loading="lazy" alt className="af-class-image-25 af-class-areaaa" />
                </div>
                <div className="af-class-boxes_atera">
                  <div className="af-class-market-research-business-model-development">We believe that the future belongs to the community, so we aim to create the first decentralised media trust based on DAO, where quality, quantity and the flux of information will be decided by members through vote only.</div>
                  <div className="af-class-q1 af-class-w">9</div><img src="images/Line10.png" loading="lazy" alt className="af-class-image-25 af-class-areaaa" />
                </div>
              </div>
              <div className="af-class-iamgagga"><img src="images/Road.png" loading="lazy" alt className="af-class-image-8 af-class-roadmappa" /></div>
              <div className="af-class-taet-area af-class-etsr">
                <div className="af-class-boxes_atera af-class-usingimnmo">
                  <div className="af-class-div-block-3">
                    <div className="af-class-market-research-business-model-development">Creation of 10,000 NFTsSmart Contracts InfrastructureSmart Contracts AuditDevOps System</div>
                    <div className="af-class-q1">Q3</div><img src="images/Line-2_1Line-2.png" loading="lazy" alt className="af-class-image-24" />
                  </div>
                </div>
                <div className="af-class-boxes_atera af-class-nottt"><img src="https://raw.githubusercontent.com/mbaxamb3333/nftresources/main/Line3.png" loading="lazy" alt className="af-class-ccc" />
                  <div className="af-class-q1 af-class-cccc">2</div>
                  <div className="af-class-market-research-business-model-development af-class-ccccc">PUBLIC MINT. 5000 NFTs will be available to mint at 498 MATIC (0.3 ETH) + gas fees. &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;<br /> Everyone will have the chance to mint one or more “SUPER RARE” and“ONE OF ONE” &nbsp; &nbsp; NFTs.</div>
                </div>
                <div className="af-class-boxes_atera"><img src="images/Line3.png" loading="lazy" alt className="af-class-ccc" />
                  <div className="af-class-q1 af-class-cccc">4</div>
                  <div className="af-class-market-research-business-model-development af-class-ccccc"> THE NFTiST First Event &amp; Party announcement! The event will be held in London.</div>
                </div>
                <div className="af-class-boxes_atera af-class-nottt"><img src="images/Line10.png" loading="lazy" alt className="af-class-image-25 af-class-areaaa" />
                  <div className="af-class-q1 af-class-cccc af-class-w">6</div>
                  <div className="af-class-market-research-business-model-development af-class-ccccc">Each quarter we are going to invest in 2 of our holders’ projects. Our community members will choose the project we are going to invest in and you will have the chance to invest as well.</div>
                </div>
                <div className="af-class-boxes_atera af-class-nottt"><img src="images/Line10.png" loading="lazy" alt className="af-class-image-25 af-class-areaaa" />
                  <div className="af-class-q1 af-class-cccc af-class-w">8</div>
                  <div className="af-class-market-research-business-model-development af-class-ccccc">The fun won’t stop here! All the NFTs will have utility in “THE CITY OF THE NFTiST”, and realistic applications in real life.</div>
                </div>
              </div>
            </div>
            <div className="af-class-mobile-text-image-rod"><img src="images/x.png" loading="lazy" width={100} sizes="(max-width: 767px) 100vw, (max-width: 991px) 97vw, 100vw" srcSet="images/x-p-500.png 500w, images/x-p-800.png 800w, images/x-p-1080.png 1080w, images/x.png 1406w" alt className="af-class-image-21" /></div>
          </div>
        </div>
        <div className="af-class-roadmaproadmap af-class-extraaaxcs af-class-desonss af-class-wf-section">
          <div className="af-class-main_conatiner">
            <h4 className="af-class-heading af-class-_2021010 af-class-ddd">2022</h4>
            <div data-w-id="65ed9cb9-8832-97af-f762-ea29860e3082" style={{opacity: 0}} className="af-class-roadmap_row af-class-asaa">
              <div className="af-class-taet-area">
                <div className="af-class-boxes_atera">
                  <div className="af-class-market-research-business-model-development">The platform is Ready. You can attend &nbsp;digital events, engage with the community and access to a curated informational system, to help you make profitable decissions.</div>
                  <div className="af-class-q1 af-class-whitetee">Q5</div><img src="images/Line10.png" loading="lazy" alt className="af-class-image-23" />
                </div>
                <div className="af-class-boxes_atera">
                  <div className="af-class-market-research-business-model-development">Development Phase includes the launch of a new app along with marketing and branding to increase the awareness of our ecosystem. We know how important this is because we are not just an usual NFT project, but a trusted media authority of the NFT space.</div>
                  <div className="af-class-q1 af-class-whitetee">Q7</div><img src="images/Line10.png" loading="lazy" alt className="af-class-image-26" />
                </div>
                <div className="af-class-boxes_atera">
                  <div className="af-class-market-research-business-model-development">We believe that the future belongs to the community, so we aim to create the first decentralised media trust based on DAO, where quality, quantity and the flux of information should be decided by members through vote.</div>
                  <div className="af-class-q1 af-class-whitetee">Q9</div><img src="images/Line10.png" loading="lazy" alt className="af-class-image-26" />
                </div>
              </div>
              <div className="af-class-iamgagga"><img src="images/M2.png" loading="lazy" alt className="af-class-image-8" /></div>
              <div className="af-class-taet-area af-class-etsr">
                <div className="af-class-boxes_atera af-class-ccccccc"><img src="images/Line10.png" loading="lazy" alt className="af-class-ccc" />
                  <div className="af-class-q1 af-class-cccc af-class-whitetee">Q6</div>
                  <div className="af-class-market-research-business-model-development">Each quarter we will be investing in 2 of our holders’ projects. Our community members will choose the project we are going to invest in and you have the chance to invest as well.</div>
                </div>
                <div className="af-class-boxes_atera af-class-ccccccc"><img src="images/Line10.png" loading="lazy" alt className="af-class-ccc" />
                  <div className="af-class-q1 af-class-cccc af-class-whitetee">Q8</div>
                  <div className="af-class-market-research-business-model-development">The fun does not stop! &nbsp;All the NFTs will have utility in “THE CITY OF THE NFTiST” and realistic applications in real life.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="af-class-taemm af-class-wf-section">
          <div id="team" className="af-class-main_conatiner">
            <div className="af-class-asphalt_roe af-class-arara"><img src="images/Energy.png" loading="lazy" alt className="af-class-image-5" />
              <h3 className="af-class-abstractabstract af-class-xzczxczxc">TEAM</h3><img src="images/Energy-1.png" loading="lazy" alt className="af-class-image-4" />
            </div>
            <div className="af-class-team_row af-class-areaasa">
              <div className="af-class-team_box">
                <div className="af-class-div-block-10 af-class-left_colum"><img src="images/NFT2-romb-ALEX-.png" loading="lazy" alt className="af-class-image-13 af-class-areaa" />
                  <a href="https://www.instagram.com/zaineaalexandru/" className="w-inline-block"><img src="images/instagram_1instagram.png" loading="lazy" alt className="af-class-image-31" /></a>
                  <h2 className="af-class-alexandru-zainea">ALEX</h2>
                  <div className="af-class-founder-ceo">Founder &amp; CEO</div>
                </div>
                <div className="af-class-div-block-11 af-class-rughrcolumn">
                  <div className="af-class-pa">A visionary &amp; utmost creative spirit, who’s always focused on finding solutions, Alex is the mastermind behind THE NFTiST, an entitled entrepreneur. Owner of a publishing company in London, well known for his celebrity-fashion photographer skills, he has been working in the industry for over 10 years. He fell in love with the blockchain tech back in 2018, when he took part in the launch of a Live Streaming VR project at the Blockchain Summit in Malta. </div>
                </div>
              </div>

              <div className="af-class-team_box">
                <div className="af-class-div-block-10 af-class-left_colum"><img src="images/ruxi-2.png" loading="lazy" alt className="af-class-image-13 af-class-areaa" />
                  <h2 className="af-class-alexandru-zainea">NICOLE</h2>
                  <div className="af-class-founder-ceo">Chief of Operations</div>
                </div>
                <div className="af-class-div-block-11 af-class-rughrcolumn">
                  <div className="af-class-pa">She’s the glue that holds the team together. Always focused on connecting each piece of the puzzle correctly, making sure there’s a proper functionality in the ecosystem.</div>
                </div>
              </div>
              <div className="af-class-team_box">
                <div className="af-class-div-block-10 af-class-left_colum"><img src="images/NFT1-romb.STEPHANIEpng.png" loading="lazy" alt className="af-class-image-13 af-class-areaa" />
                  <h2 className="af-class-alexandru-zainea">STEPHANIE</h2>
                  <div className="af-class-founder-ceo"> <strong>Chief of Marketing</strong></div>
                </div>
                <div className="af-class-div-block-11 af-class-rughrcolumn">
                  <div className="af-class-pa">Stephanie's enthusiasm is exceeded only by her creativity and problem solving skills. An expert in everything marketing, she has helped companies and teams from different industries grow over the years. Today, she's working her magic on us!</div>
                </div>
              </div>
              <div className="af-class-team_box">
                <div className="af-class-div-block-10 af-class-left_colum"><img src="images/troscot.png" loading="lazy" alt className="af-class-image-13 af-class-areaa" />
                  <h2 className="af-class-alexandru-zainea">SILVIU</h2>
                  <div className="af-class-founder-ceo">Chief Tech Officer</div>
                </div>
                <div className="af-class-div-block-11 af-class-rughrcolumn">
                  <div className="af-class-pa">Twitter, Bloomberg, Microsoft are just a few highlights to showcase bits related to the experience behind this brilliant “mad dev”, based in Canada. Alongside his team, he helped build this dreamworld. </div>
                </div>
              </div>
              <div className="af-class-team_box">
                <div className="af-class-div-block-10 af-class-left_colum"><img src="images/ruxi.png" loading="lazy" alt className="af-class-image-13 af-class-areaa" />
                  <h2 className="af-class-alexandru-zainea">SINZIANA</h2>
                  <div className="af-class-founder-ceo">The Artist</div>
                </div>
                <div className="af-class-div-block-11 af-class-rughrcolumn">
                  <div className="af-class-pa">There wouldn’t be any magic without the NFT artwork created by our outstanding colleague. She’s got the golden hands and yes, she’s the one behind all the visuals.</div>
                </div>
              </div>
              <div className="af-class-team_box">
                <div className="af-class-div-block-10 af-class-left_colum"><img src="images/ruxi-3.png" loading="lazy" alt className="af-class-image-13 af-class-areaa" />
                  <h2 className="af-class-alexandru-zainea">RUXY</h2>
                  <div className="af-class-founder-ceo">Social Media Manager</div>
                </div>
                <div className="af-class-div-block-11 af-class-rughrcolumn">
                  <div className="af-class-pa">Social Media is in her hands. Communication is vital to each and everyone of us, in order to make sure we have the best! Therefore, Ruxy makes us proud of her communication skills on how we get around. </div>
                </div>
              </div>
              <div className="af-class-team_box">
                <div className="af-class-div-block-10 af-class-left_colum"><img src="images/nicolai.png" loading="lazy" alt className="af-class-image-13 af-class-areaa" />
                  <h2 className="af-class-alexandru-zainea">NICOLAI</h2>
                  <div className="af-class-founder-ceo">Community Manager</div>
                </div>
                <div className="af-class-div-block-11 af-class-rughrcolumn">
                  <div className="af-class-pa">He’s been a part of Discord since forever, over 5 years to be exact. Young &amp; Smart are the keywords to defining our hard working boy! </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="af-class-faq af-class-wf-section">
          <div id="faq" className="af-class-main_conatiner">
            <div className="af-class-asphalt_roe"><img src="images/Energy.png" loading="lazy" alt className="af-class-image-5" />
              <h3 className="af-class-abstractabstract af-class-xzczxczxc">FAQ</h3><img src="images/Energy-1.png" loading="lazy" alt className="af-class-image-4" />
            </div>
            <div className="af-class-fazw_areaa af-class-naeaaaaaa">
              <div data-hover="false" data-delay={0} className="af-class-dropdown w-dropdown">
                <div className="af-class-dropdown-toggle w-dropdown-toggle">
                  <div className="af-class-icon w-icon-dropdown-toggle" />
                  <div className="af-class-text-block af-class-drpodowwnnw">What is an NFT?</div>
                </div>
                <nav className="af-class-dropdown-list w-dropdown-list">
                  <p className="af-class-paragraph">An NFT (non-fungible token) is a piece of art that lives on the blockchain. Owning an NFT is just like owning an asset, but instead of owning it physically, you own it virtually, on the blockchain. THE NFTiST is a collection of 10.000 unique NFTs that will live on the Polygon blockchain.</p>
                </nav>
              </div>
              <div data-hover="false" data-delay={0} className="af-class-dropdown w-dropdown">
                <div className="af-class-dropdown-toggle w-dropdown-toggle">
                  <div className="af-class-icon w-icon-dropdown-toggle" />
                  <div className="af-class-text-block af-class-drpodowwnnw">How do NFTs work?</div>
                </div>
                <nav className="af-class-dropdown-list w-dropdown-list">
                  <p className="af-class-paragraph">NFTs are different from ERC-20 tokens. Each individual token is completely unique and not divisible. NFTs offer the ability to assign or claim ownership of any unique piece of digital data, trackable by using Ethereum's blockchain as a public ledger. An NFT is minted from digital objects as a representation of digital or non-digital assets. For example, an NFT could represent:<br />Digital Art<br />GIFs Collectibles<br />MusicVideos<br />Real World Items<br />Deeds to a car<br />Tickets to a real world event<br />Tokenized invoices<br />Legal documents<br />Signatures<br />Lots of other options to get creative with!</p>
                </nav>
              </div>
              <div data-hover="false" data-delay={0} className="af-class-dropdown w-dropdown">
                <div className="af-class-dropdown-toggle w-dropdown-toggle">
                  <div className="af-class-icon w-icon-dropdown-toggle" />
                  <div className="af-class-text-block af-class-drpodowwnnw">WHAT IS THE NFTiST?</div>
                </div>
                <nav className="af-class-dropdown-list w-dropdown-list">
                  <p className="af-class-paragraph">THE NFTiST &nbsp;has come out with the objective of becoming the authority of the NFT space, accessible through a collection of 10.000 NFTs stored as ERC-721 tokens on the Polygon Blockchain. THE NFTiST’s purpose is to be the first decentralised media authority of the NFT space. Our ultimate goal is guide our members through the ocean of information and provide them with the tools and strategies that are necessary to make profitable decisions.<br />Our community includes three categories: NFT Creators, NFT investors and the Curious ones. We have created an ecosystem to help each member to shorten the time of understanding this industry but also tosucceed by being part of it.</p>
                </nav>
              </div>
              <div data-hover="false" data-delay={0} className="af-class-dropdown w-dropdown">
                <div className="af-class-dropdown-toggle w-dropdown-toggle">
                  <div className="af-class-icon w-icon-dropdown-toggle" />
                  <div className="af-class-text-block af-class-drpodowwnnw">WHAT IS MINTING?</div>
                </div>
                <nav className="af-class-dropdown-list w-dropdown-list">
                  <p className="af-class-paragraph">Minting basically refers to the process of turning digital art into a part of the Polygon Blockchain as a public ledger.</p>
                </nav>
              </div>
              <div data-hover="false" data-delay={0} className="af-class-dropdown w-dropdown">
                <div className="af-class-dropdown-toggle w-dropdown-toggle">
                  <div className="af-class-icon w-icon-dropdown-toggle" />
                  <div className="af-class-text-block af-class-drpodowwnnw">HOW MANY WILL BE MINTED?</div>
                </div>
                <nav className="af-class-dropdown-list w-dropdown-list">
                  <p className="af-class-paragraph">There will only ever be 10.000 NFTiSTs.</p>
                </nav>
              </div>
              <div data-hover="false" data-delay={0} className="af-class-dropdown w-dropdown">
                <div className="af-class-dropdown-toggle w-dropdown-toggle">
                  <div className="af-class-icon w-icon-dropdown-toggle" />
                  <div className="af-class-text-block af-class-drpodowwnnw">HOW CAN I BUY THE NFTiST?</div>
                </div>
                <nav className="af-class-dropdown-list w-dropdown-list">
                  <p className="af-class-paragraph">You will be able to mint The NFTs directly on our website, www.thenftist.com on the launch date. If this is your first experience buying an NFT, check out our #how-to-buy section.</p>
                </nav>
              </div>
              <div data-hover="false" data-delay={0} className="af-class-dropdown w-dropdown">
                <div className="af-class-dropdown-toggle w-dropdown-toggle">
                  <div className="af-class-icon w-icon-dropdown-toggle" />
                  <div className="af-class-text-block af-class-drpodowwnnw">WHEN IS THE LAUNCH DATE?</div>
                </div>
                <nav className="af-class-dropdown-list w-dropdown-list">
                  <p className="af-class-paragraph">The NFTiST project will go live on January 24th 2022, at 5PM GMT (12PM EST) with our Whitelist PRE-SALE and right after the SOLD OUT, we’re going live with our PUBLIC SALE (announcements will be made on our Discord channel, so make sure you join).</p>
                </nav>
              </div>
              <div data-hover="false" data-delay={0} className="af-class-dropdown w-dropdown">
                <div className="af-class-dropdown-toggle w-dropdown-toggle">
                  <div className="af-class-icon w-icon-dropdown-toggle" />
                  <div className="af-class-text-block af-class-drpodowwnnw">HOW MUCH WILL COST &nbsp;TO MINT A NFT?</div>
                </div>
                <nav className="af-class-dropdown-list w-dropdown-list">
                  <p className="af-class-paragraph">PRE-SALE Price: 322 MATIC (0.2 ETH) + gas fee<br />PUBLIC-SALE Price: 498 MATIC (0.3 ETH) + gas fee<br />(Check <a href="http://discord.gg/thenftist" target="_blank">Our Discord</a> to get whitelisted)</p>
                </nav>
              </div>
              <div data-hover="false" data-delay={0} className="af-class-dropdown w-dropdown">
                <div className="af-class-dropdown-toggle w-dropdown-toggle">
                  <div className="af-class-icon w-icon-dropdown-toggle" />
                  <div className="af-class-text-block af-class-drpodowwnnw"
                  
                  >WHAT ARE THE ADVANTAGES OF BEING PART OF THE“ THE NFTiST” ?</div>
                </div>
                <nav className="af-class-dropdown-list w-dropdown-list">
                  <p className="af-class-paragraph">THE NFTiST is maybe the most specia remarkable member’s club in the space, as it is the core of the space. Due to its art that, which doubles as membership card, it provides access to a complete informational system, built around the blockchain and NFT technology. Amongst the benefits we will provide our members with LIVE &amp; DIGITAL EVENTS (massive headliners in the NFT space), as well as the media trust platform, where (NFT Launchpad) exclusive seed phase projects will be listed, ONLY there and nowhere else. You will also be ableto find news, daily drop updates, in-depth articles, strategies and analysis, and least but not last 1 minute podcasts with top leaders from within the industry. The most exciting part is a VR technology we have been developing since 2018, to be implemented as a METAVERSE city called &nbsp;“THE CITY OF THE NFTiST”. This is a city from the future, accessible only to our members and users, who can only log in by using their MetaMask wallet. In the city, a variety of parties will be held, business opportunities exchanged between our exclusive community, travel places like we’ve only dreamt of, and a huge marketplace with discounts on everything we need in the real world as well as in our digital one. It’s basically a city where everything is literally possible!</p>
                </nav>
              </div>
              <div data-hover="false" data-delay={0} className="af-class-dropdown w-dropdown">
                <div className="af-class-dropdown-toggle w-dropdown-toggle">
                  <div className="af-class-icon w-icon-dropdown-toggle" />
                  <div className="af-class-text-block af-class-drpodowwnnw">WHEN WILL YOU GUYS REVEAL THE “THE NFTiST” ?</div>
                </div>
                <nav className="af-class-dropdown-list w-dropdown-list">
                  <p className="af-class-paragraph">48 hours after the PUBLIC SALE.</p>
                </nav>
              </div>
              <div data-hover="false" data-delay={0} className="af-class-dropdown w-dropdown">
                <div className="af-class-dropdown-toggle w-dropdown-toggle">
                  <div className="af-class-icon w-icon-dropdown-toggle" />
                  <div className="af-class-text-block af-class-drpodowwnnw">WHAT IS A WHITELIST ( WL)</div>
                </div>
                <nav className="af-class-dropdown-list w-dropdown-list">
                  <p className="af-class-paragraph">A Whitelist is a private PRE SALE where you get early access to minting with no gas wars! WL spots include guaranteed access to a limited number of NFTs.</p>
                </nav>
              </div>
              <div data-hover="false" data-delay={0} className="af-class-dropdown w-dropdown">
                <div className="af-class-dropdown-toggle w-dropdown-toggle">
                  <div className="af-class-icon w-icon-dropdown-toggle" />
                  <div className="af-class-text-block af-class-drpodowwnnw">HOW CAN I JOIN THE VIP WHITELIST?</div>
                </div>
                <nav className="af-class-dropdown-list w-dropdown-list">
                  <p className="af-class-paragraph">Please check the #presale-info and follow the instructions .</p>
                  <a href="http://discord.gg/thenftist" target="_blank" className="af-class-paragraph">Right Here.</a>
                </nav>
              </div>
              <div data-hover="false" data-delay={0} className="af-class-dropdown w-dropdown">
                <div className="af-class-dropdown-toggle w-dropdown-toggle">
                  <div className="af-class-icon w-icon-dropdown-toggle" />
                  <div className="af-class-text-block af-class-drpodowwnnw">HOW CAN I PROMOTE THE PROJECT?</div>
                </div>
                <nav className="af-class-dropdown-list w-dropdown-list">
                  <p className="af-class-paragraph">The best way to promote the project is by inviting people to our DISCORD channel. If you don’t know how to invite people, check the #how-to-invite channel. If you are an influencer and would like to work with us, check the #influencers channel.</p>
                </nav>
              </div>
              <div data-hover="false" data-delay={0} className="af-class-dropdown w-dropdown">
                <div className="af-class-dropdown-toggle w-dropdown-toggle">
                  <div className="af-class-icon w-icon-dropdown-toggle" />
                  <div className="af-class-text-block af-class-drpodowwnnw">WHAT BLOCKCHAIN PROTOCOL WILL YOU BE USING?</div>
                </div>
                <nav className="af-class-dropdown-list w-dropdown-list">
                  <p className="af-class-paragraph">Our NFT’S will be using the ERC-721 protocol based on the POLYGON MATIC of Ethereum as we aim to support our community and avoid large gas fees.</p>
                </nav>
              </div>
            </div>
          </div>
        </div>
        <div className="af-class-footer af-class-wf-section">
          <div className="af-class-socilla af-class-_2">
            <a href="index.html" aria-current="page" className="w-inline-block w--current"><img src="images/footer.png" loading="lazy" width={410} alt className="af-class-image-32" /></a>
            <div className="af-class-ivoocn-ara">
              <a href="http://discord.gg/thenftist" className="w-inline-block"><img src="images/Vector-1_1Vector-1.png" loading="lazy" alt className="af-class-image-9 af-class-etarass" /></a>
              <a href="https://facebook.com/thenftist" className="w-inline-block"><img src="images/facebook-1.svg" loading="lazy" alt className="af-class-image-9" /></a>
              <a href="https://www.instagram.com/thenftist/" className="w-inline-block"><img src="https://raw.githubusercontent.com/mbaxamb3333/nftresources/main/instagram-1_1instagram%201.png" loading="lazy" alt className="af-class-image-9" /></a>
              <a href="https://t.me/thenftistchat" className="w-inline-block"><img src="https://raw.githubusercontent.com/mbaxamb3333/nftresources/main/icons8-telegram-app-1_1icons8-telegram-app%201.png" loading="lazy" alt className="af-class-image-9" /></a>
              <a href="https://twitter.com/thenftist" className="w-inline-block"><img src="https://raw.githubusercontent.com/mbaxamb3333/nftresources/main/twitter-1_1twitter%201.png" loading="lazy" alt className="af-class-image-9" /></a>
            </div>
            <div className="af-class-ivoocn-ara af-class-_2">
              <a href="https://the-nftist.webflow.io/privacy-policy" className="af-class-link-block-2 w-inline-block">
                <div className="af-class-text-block-3">Privacy Policy</div>
              </a>
              <a href="https://the-nftist.webflow.io/terms-and-conditions" className="af-class-link-block-3 w-inline-block">
                <div className="af-class-text-block-3">Terms and Conditions</div>
              </a>
            </div>
          </div>
        </div>
        {/* [if lte IE 9]><![endif] */}
      </div>
    </span>
    <script src="../public/js/webflow.js" type="text/javascript"></script>
  </span>
  );
}

export default App;









