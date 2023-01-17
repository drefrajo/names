let lookupProvider;
let provider;
const namesABI = [
  "function claim(string _handle, bytes _sig) external payable",
  "function resolveAddress(address) public view returns (string)",
  "function resolveName(string) public view returns (address)",
  "function handleCount(string) public view returns (uint)",
  "function renameFee() public view returns (uint)",
  "event NameClaimed(address indexed _claimer, string _name)"
]
let namesContract;

const outsiderABI = [
  "function isEOA(address) view returns (bool)"
]
let outsiderContract;

let signer;

function isTag(tag) {
  if(tag.includes(".")) return false;
  
  const num = Number(tag);
  if (Number.isInteger(num) && num >= 0) return true;

  return false;
}

window.onload = function() {
  document.getElementById("search").value = "";
  document.getElementById("choose").value = "";
}

document.addEventListener("alpine:init", () => {
  let externalAvailable = false;

  try {
    try {
      lookupProvider = ethers.getDefaultProvider("https://rpc-mumbai.maticvigil.com");
    }catch(e){
      console.log(e);
    }
    let signer = new ethers.VoidSigner("0x761772008F5eabE3B178E05a6f764A792F299B47", lookupProvider);
    
    namesContract = new ethers.Contract("0x761772008F5eabE3B178E05a6f764A792F299B47", namesABI, signer);
    outsiderContract = new ethers.Contract("0x0a1a6f16febF97417888dbdf1CbC3b30BD0B5b81", outsiderABI, signer);

    if(window.ethereum) externalAvailable = true;
  } catch (e) {
    console.log(e);
  }

  Alpine.data('interactive', () => ({
    connected: false,
    available: externalAvailable,
    readable: "Connect your wallet to check your EOA status.",
    hasName: false,
    searchData: {
      name: "------",
      address: "------",
      state: "unknown"
    },
    setData: {
      connectionState: externalAvailable ? "unknown" : "unsupported",
      progressState: "",
      handleCount: "/...",
      hasText: false,
      currentName: "...",
      handle: "",
      renameFee: "5",
      buttonText: "Set (0 Matic)"
    },

    lookupHint(data) {
      if(!data) {
        this.searchData = {
          name: "------",
          address: "------",
          state: "unknown"
        }
      } else {
        this.searchData.state = "pending";
      }
    },

    async lookup(data) {
      if(!data) {
        // display empty
        this.searchData = {
          name: "------",
          address: "------",
          state: "unknown"
        };
        return;
      }
      if(ethers.utils.isAddress(data)) {
        // resolve Address
        this.searchData = {
          address: data,
          name: "...",
          state: "pending"
        }

        const result = await namesContract.resolveAddress(data);

        if(result) {
          this.searchData = {
            name: result,
            address: data,
            state: "true"
          }
        } else {
          this.searchData = {
            name: "------",
            address: data,
            state: "false"
          }
        }
      } else {
        // resolve Name
        if(!data.includes("/")) data += "/0";
        if(data.slice(-1) == "/") data += "0";

        let tag = /[^/]*$/.exec(data)[0];
        if(!isTag(tag)) data += "/0";

        this.searchData = {
          name: data,
          address: "...",
          state: "pending"
        }

        let result = await namesContract.resolveName(data);

        if(result == "0x0000000000000000000000000000000000000000") result = "------";

        this.searchData = {
          name: data,
          address: result,
          state: result != "------" ? "true" : "false"
        }
      }
    },

    previewHint(data) {
      if(!data) {
        this.setData.handleCount = "/...";
        this.setData.hasText = false;
        this.setData.progressState = "unsupported";
        return;
      }
      this.setData.progressState = "pending"
    },

    async preview(data) {
      if(!data) return;
      const handleCount = await namesContract.handleCount(data);
      this.setData.handleCount = "/" + handleCount;
      this.setData.hasText = true;
      this.setData.progressState = "unknown";
    },

    async connect() {
      this.setData.connectionState = "pending";

      try {
        provider = new ethers.providers.Web3Provider(window.ethereum);
      } catch(e) {
        console.log(e);
        this.setData.connectionState = "false";
      }

      await provider.send("eth_requestAccounts", []);
      signer = await provider.getSigner();

      const { chainId } = await provider.getNetwork();

      // if chain is not supported
      if(chainId != 80001) {
        try {
          // try switching
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x13881" }]
          });

          // if successful, rerun connect()
          this.connect();
          return;
        } catch(e) {}
        // if not successful, return with error light
        this.setData.connectionState = "false";
        return;
      }
      
      
      if(signer) {
        namesContract = namesContract.connect(signer);
        outsiderContract = outsiderContract.connect(signer);

        const name = await namesContract.resolveAddress(signer.getAddress());
        if(name) this.hasName = true;

        this.setData.renameFee = ethers.utils.formatEther(await namesContract.renameFee());

        this.setData.connectionState = "true";
        this.setData.progressState = "unsupported";
        this.setData.currentName = name || "------";
        this.connected = true;
        this.setData.buttonText = name ? `Change (${this.setData.renameFee} Matic)` : "Set (0 Matic)";
      }
    },

    async sign() {
      sig = await signer.signMessage(
        ethers.utils.arrayify(
          ethers.utils.solidityKeccak256(
            ["string"],
            ["I am worthy."]
          )
        )
      );
    },

    async claim() {
      try {
        this.setData.progressState = "pending";

        // handle EOA check
        const eoaPassed = await outsiderContract.isEOA(await signer.getAddress());

        let sig = [];
        try {
          if(!eoaPassed) {
            sig = await signer.signMessage(
              ethers.utils.arrayify(
                ethers.utils.solidityKeccak256(
                  ["string"],
                  ["I am worthy."]
                )
              )
            );
          }
        } catch(e) {
          this.setData.progressState = "false";
          return;
        }

        // submit tx
        let value = this.setData.renameFee;
        if(!this.hasName) value = "0";

        let tx;
        try {
          tx = await namesContract.claim(this.setData.handle, sig, {value: ethers.utils.parseEther(value)});
        } catch(e) {
          console.log(e);
          this.setData.progressState = "false";
          return;
        }
        console.log(tx.hash);
        const receipt = await tx.wait();
        
        // display result
        const newName = await namesContract.resolveAddress(await signer.getAddress());

        this.setData.handle = "";
        
        this.setData.progressState = "true";
        this.setData.buttonText = `Change (${this.setData.renameFee} Matic)`;
        this.setData.currentName = newName;
      } catch(e) {
        alert(e.message)
      }
    }
  }))
})