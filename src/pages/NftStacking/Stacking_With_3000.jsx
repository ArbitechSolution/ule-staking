import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { loadWeb3 } from "../../Api/Api";
import { API } from "../../store/actions/API";
import {
  ULE_NFT_100,
  ULE_NFT_100_ABI,
  ULE_NFT_3000,
  ULE_NFT_3000_ABI,
  ULE_NFT_Staking_100,
  Ule_NFT_Staking_100_ABI,
} from "../Utils/Contract_Address";

export default function Stacking_With_3000() {
  const [uid, setUId] = useState("101010");
  const [address, setAddress] = useState("12356");
  const [tokenid, setTokenId] = useState("");
  const [txn, setTxn] = useState("nhtyty78");
  const [rate, setRate] = useState(0);
  const [account, setAccount] = useState("");
  const [isLoadingTrans, setLoadingTrans] = useState(false);
  const [amount, setAmount] = useState("");
  const [balnacBNB, setBalnacBNB] = useState(0);
  const [blnce, setBlnce] = useState(0);
  let [btnTxt, setBtTxt] = useState("Connect");
  let [connectText, setconnectText] = useState("Metamask Unlocked");
  const [userInfo, setUserInfo] = useState(null);

  const user = localStorage.getItem("user");
  const dashboard = useSelector((state) => state?.dashboard);

  // console.log("dashboard",dashboard);

  const getAccount = async () => {
    let acc = await loadWeb3();
    // console.log("ACC=",acc)
    if (acc == "No Wallet") {
      setBtTxt("No Wallet");
    } else if (acc == "Wrong Network") {
      setBtTxt("Wrong Network");
    } else {
      let myAcc =
        acc?.substring(0, 4) + "..." + acc?.substring(acc?.length - 4);
      setBtTxt(myAcc);
      setconnectText("Metamask Unlocked");
    }
  };

  useEffect(() => {
    setInterval(() => {
      getAccount();
    }, 1000);
  }, []);

  const getBalance = async () => {
    let acc = await loadWeb3();
    try {
      const web3 = await window.web3;
      // let contractOf = new web3.eth.Contract(abitoken, contractAddresstoken);
      // let nftContractOf = new web3.eth.Contract(abitoken, contractAddresstoken);
      let res = await web3.eth.getBalance(acc);
      res = web3.utils.fromWei(res);
      // let ResultRes = res.toString();
      // console.log("ResultRes ",ResultRes);
      setBlnce(res);
      // console.log(type(res))
      // setBalnacBNB(res?.data.data[0].usdperunit);
      //   let data = await nftContractOf.methods.balanceOf(acc).call();

      // console.log("Balance ",data);
    } catch (e) {
      console.log("Erroe while Call function Of GetBAlance", e);
    }
  };
  // console.log("what is api",API)
  const WalletAddress = async () => {
    let ress = JSON.parse(user);
    let uId = ress?.user_id;

    try {
      const res = await axios.get(
        `https://ulenftapis.ulenft.site/get_user_info?id=${uId}`
      );

      let User_Address = res?.data?.data[0].EthAddress;
      if (res?.data?.data?.length > 0) {
        setUserInfo(res?.data?.data[0]);
      }
    } catch (e) {
      console.log("Fatch Api", e);
    }
  };

  useEffect(() => {
    getBalance();
    WalletAddress();
  }, []);

  const ULE_Stake = async () => {
    const acc = await loadWeb3();
    const user = localStorage.getItem("user");
    let ress = JSON.parse(user);
    let uId_user = ress?.user_id;

    try {
      setLoadingTrans(true);

      if (userInfo.EthAddress.toLowerCase() == acc.toLowerCase()) {
        if (tokenid == "") {
          alert("Please Enter Token Id");
          setLoadingTrans(false);
        } else {
          const web3 = await window.web3;
          let Ule_100_ContractOf = new web3.eth.Contract(
            ULE_NFT_3000_ABI,
            ULE_NFT_3000
          );
          let ULE_Staking_ContractOf = new web3.eth.Contract(
            Ule_NFT_Staking_100_ABI,
            ULE_NFT_Staking_100
          );
          let check_Nft_Balance = await Ule_100_ContractOf.methods
            .ownerOf(tokenid)
            .call();

          let Api_Conditon = await axios.post(
            "https://ulenftapis.ulenft.site/stakeNftCondition",
            {
              uid: uId_user,
              amount: "3000",
            }
          );

          Api_Conditon = Api_Conditon.data.data;

          if (check_Nft_Balance == acc) {
            if (Api_Conditon == "Success") {
              await Ule_100_ContractOf.methods
                .setApprovalForAll(ULE_NFT_Staking_100, true)
                .send({
                  from: acc,
                });

              toast.success("Successfully Approved");

              let hash = await ULE_Staking_ContractOf.methods
                .Stake([tokenid], ULE_NFT_3000)
                .send({
                  from: acc,
                  // value: totalMintingPriceBNB.toString()
                });

              hash = hash.transactionHash;

              let postapi = await axios.post(
                "https://ule-nft-api-1.herokuapp.com/nftStaking",
                {
                  uid: uId_user,
                  address: acc,
                  tokenid: tokenid,
                  txn: hash,
                  usdvalue: "3000",
                }
              );

              toast.success("Transaction Confirmed");
              setLoadingTrans(false);

              // alert("Transaction Confirmed")
              window.location.reload();
            } else {
              toast.error(Api_Conditon);
            }
          } else {
            alert("You are not owner of this ID. ");
            setLoadingTrans(false);
          }
        }
      } else {
        // alert("Account Mismatch")
        toast.error("Account Mismatch");
        setLoadingTrans(false);
      }
    } catch (error) {
      console.log("Erroe While Call Staking Fuction", error);
      toast.error("Transaction Failed");
      setLoadingTrans(false);
    }
  };
  const ULE_UnStake = async () => {
    const acc = await loadWeb3();
    const user = localStorage.getItem("user");
    let ress = JSON.parse(user);
    let uId_user = ress?.user_id;

    try {
      setLoadingTrans(true);

      if (userInfo.EthAddress.toLowerCase() == acc.toLowerCase()) {
        if (tokenid == "") {
          toast.info("Please Enter Token Id");
          setLoadingTrans(false);
        } else {
          const web3 = await window.web3;

          let ULE_Staking_ContractOf = new web3.eth.Contract(
            Ule_NFT_Staking_100_ABI,
            ULE_NFT_Staking_100
          );
          let check_Nft_Balance = await ULE_Staking_ContractOf.methods
            .userStakedNFT(acc, ULE_NFT_3000)
            .call();

          const LockedConditon = await ULE_Staking_ContractOf.methods
            .locked()
            .call();

          let res = check_Nft_Balance.find((item) => {
            return item == tokenid;
          });
          if (res == tokenid) {
            if (LockedConditon == true) {
              let hash = await ULE_Staking_ContractOf.methods
                .unStake([tokenid], ULE_NFT_3000)
                .send({
                  from: acc,
                });

              toast.success("Transaction Confirmed");
              // toast.info("Transaction Confirmed")
              window.location.reload();
            } else {
              toast.info("Staking is locked !");
              setLoadingTrans(false);
            }
          } else {
            toast.info("You are not owner of this ID. ");
            setLoadingTrans(false);
          }
        }
      } else {
        // toast.info("Account Mismatch")
        toast.error("Account Mismatch");
        setLoadingTrans(false);
      }
    } catch (error) {
      console.log("Error While Call Un Staking Fuction", error);
      toast.error("Transaction Failed");
      setLoadingTrans(false);
    }
  };
  const getLiveRate = async () => {
    try {
      const res = await API.get(`/live_rate`);
      // console.log(res);
      setRate(res?.data.data[0].usdperunit);
    } catch (e) {
      console.log("error", e);
    }
  };
  useEffect(() => {
    getLiveRate();
  }, []);

  function saveUser() {
    console.warn({ tokenid });
    let data = { uid, address, tokenid, txn };

    fetch("https://ule-nft-api-1.herokuapp.com/nftStaking", {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then((result) => {
      result.json().then((resp) => {
        console.warn("resp", resp);
      });
    });
  }
  return (
    <>
      <div class="col-md 9 stak">
        <div className="col-md-7 stack-md">
          <h4 className="stack-h4">NFT Staking 3000 </h4>

          <hr className="stak-hr" />
          <h6 className="stack-h6 text-center mt-5">
            <span id="tokenbalance">{connectText}</span>
          </h6>
          <form name="frm1" method="post">
            <h6 className="stack-h6 ipp">
              <div class="dropdown ms-2 mt-2 mb-4">
                <button
                  class="btn btn-secondary dropdown-toggle select_main btn_dropdownhere"
                  type="button"
                  id="dropdownMenuButton1"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Staking
                </button>
                <ul
                  class="dropdown-menu btn_dropdownhere text-center  h-auto fs-3"
                  aria-labelledby="dropdownMenuButton1"
                >
                  <li>
                    <a class="dropdown-item">
                      <Link to="/Stacking_With_100" className="text-d">
                        Staking With 100 USD
                      </Link>
                    </a>
                  </li>
                  <li>
                    <a class="dropdown-item">
                      <Link to="Stacking_With_200" className="text-d">
                        Staking With 200 USD
                      </Link>
                    </a>
                  </li>
                  <li>
                    <a class="dropdown-item">
                      <Link to="Stacking_With_300" className="text-d">
                        Staking With 300 USD
                      </Link>
                    </a>
                  </li>
                  <li>
                    <a class="dropdown-item">
                      <Link to="Stacking_With_400" className="text-d">
                        Staking With 400 USD
                      </Link>
                    </a>
                  </li>
                  <li>
                    <a class="dropdown-item">
                      <Link to="Stacking_With_500" className="text-d">
                        Staking With 500 USD
                      </Link>
                    </a>
                  </li>
                  <li>
                    <a class="dropdown-item">
                      <Link to="Stacking_With_1000" className="text-d">
                        Staking With 1000 USD
                      </Link>
                    </a>
                  </li>
                  <li>
                    <a class="dropdown-item">
                      <Link to="Stacking_With_2000" className="text-d">
                        Staking With 2000 USD
                      </Link>
                    </a>
                  </li>
                  <li>
                    <a class="dropdown-item">
                      <Link to="Stacking_With_3000" className="text-d">
                        Staking With 3000 USD
                      </Link>
                    </a>
                  </li>
                  <li>
                    <a class="dropdown-item">
                      <Link to="Stacking_With_4000" className="text-d">
                        Staking With 4000 USD
                      </Link>
                    </a>
                  </li>
                  <li>
                    <a class="dropdown-item">
                      <Link to="Stacking_With_5000" className="text-d">
                        Staking With 5000 USD
                      </Link>
                    </a>
                  </li>
                  <li>
                    <a class="dropdown-item">
                      <Link to="Stacking_With_10000" className="text-d">
                        Staking With 10000 USD
                      </Link>
                    </a>
                  </li>
                </ul>
              </div>
              <input
                type="text"
                className="stak-input"
                name="fname"
                value={tokenid}
                onChange={(e) => {
                  setTokenId(e.target.value);
                }}
                placeholder="Enter Token id"
                required
              />
            </h6>
            {isLoadingTrans ? (
              <>
                <button
                  className="btn btn-success"
                  style={{ marginTop: "10px" }}
                  id="btnother"
                >
                  <div
                    className="loaders"
                    style={{ height: "30px", width: "30px" }}
                  ></div>
                  Transaction is in progress
                </button>
              </>
            ) : (
              <div className="row">
                <div className="col-6 d-flex justify-content-center">
                  <button
                    className="btn btn-stak"
                    onClick={() => ULE_Stake()}
                    type="button"
                  >
                    <img
                      className="stack-sr"
                      src="assets/images/Icon/112.png"
                    />
                    Staking
                  </button>
                </div>
                <div className="col-6 d-flex justify-content-start">
                  <button
                    className="btn btn-stak"
                    // onClick={() => ULE_UnStake()}
                    type="button"
                  >
                    <img
                      className="stack-sr"
                      src="assets/images/Icon/112.png"
                    />
                    Unstake
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      <br />
      <br />
      <div className="footer-section">
        Copyright ?? 2022 Yeepule. All Rights Reserved.
      </div>

      <link
        rel="stylesheet"
        type="text/css"
        href="assets/css/2.d34346ea.chunk.css"
      />
      <link
        rel="stylesheet"
        type="text/css"
        href="assets/css/main.f70df022.chunk.css"
      />
    </>
  );
}
