/*
 * The trusted multicall forwarder contract from: https://github.com/Synthetixio/trusted-multicall-forwarder
 */
import * as viem from 'viem';

export const bytecode =
  '0x6101606040523480156200001257600080fd5b50604080518082018252601b81527f747275737465642d6d756c746963616c6c2d666f727761726465720000000000602080830191909152825180840190935260018352603160f81b908301529081906200006f8260006200011e565b61012052620000808160016200011e565b61014052815160208084019190912060e052815190820120610100524660a0526200010e60e05161010051604080517f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f60208201529081019290925260608201524660808201523060a082015260009060c00160405160208183030381529060405280519060200120905090565b60805250503060c0525062000389565b60006020835110156200013e57620001368362000157565b905062000151565b816200014b848262000248565b5060ff90505b92915050565b600080829050601f815111156200018e578260405163305a27a960e01b815260040162000185919062000314565b60405180910390fd5b80516200019b8262000364565b179392505050565b634e487b7160e01b600052604160045260246000fd5b600181811c90821680620001ce57607f821691505b602082108103620001ef57634e487b7160e01b600052602260045260246000fd5b50919050565b601f8211156200024357600081815260208120601f850160051c810160208610156200021e5750805b601f850160051c820191505b818110156200023f578281556001016200022a565b5050505b505050565b81516001600160401b03811115620002645762000264620001a3565b6200027c81620002758454620001b9565b84620001f5565b602080601f831160018114620002b457600084156200029b5750858301515b600019600386901b1c1916600185901b1785556200023f565b600085815260208120601f198616915b82811015620002e557888601518255948401946001909101908401620002c4565b5085821015620003045787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b600060208083528351808285015260005b81811015620003435785810183015185820160400152820162000325565b506000604082860101526040601f19601f8301168501019250505092915050565b80516020808301519190811015620001ef5760001960209190910360031b1b16919050565b60805160a05160c05160e05161010051610120516101405161239f620003e460003960006112dc015260006112aa01526000611a3201526000611a0a015260006119650152600061198f015260006119b9015261239f6000f3fe6080604052600436106101755760003560e01c80637ecebe00116100cb578063bce38bd71161007f578063df905caf11610059578063df905caf146103e7578063ee82ac5e146103fa578063f4c3a9b81461041957600080fd5b8063bce38bd71461039f578063c3077fa9146103bf578063ccf96b4a146103d257600080fd5b806384b0196e116100b057806384b0196e1461034957806386d516e814610371578063a8b0574e1461038457600080fd5b80637ecebe00146102f357806382ad56cb1461033657600080fd5b80633408e4701161012d57806342cbb15c1161010757806342cbb15c146102985780634d2301cc146102ab57806379165ff3146102e057600080fd5b80633408e47014610250578063399542e9146102635780633e64a6961461028557600080fd5b806319d8d38c1161015e57806319d8d38c146101bc578063252dba42146101ec57806327e86d6e1461021a57600080fd5b80630f28c97d1461017a578063174dea711461019c575b600080fd5b34801561018657600080fd5b50425b6040519081526020015b60405180910390f35b6101af6101aa366004611c0a565b61042c565b6040516101939190611d25565b3480156101c857600080fd5b506101dc6101d7366004611d3f565b610645565b6040519015158152602001610193565b3480156101f857600080fd5b5061020c610207366004611c0a565b610677565b604051610193929190611d7a565b34801561022657600080fd5b50437fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0140610189565b34801561025c57600080fd5b5046610189565b610276610271366004611e17565b61081e565b60405161019393929190611e6a565b34801561029157600080fd5b5048610189565b3480156102a457600080fd5b5043610189565b3480156102b757600080fd5b506101896102c6366004611eab565b73ffffffffffffffffffffffffffffffffffffffff163190565b6101af6102ee366004611c0a565b610839565b3480156102ff57600080fd5b5061018961030e366004611eab565b73ffffffffffffffffffffffffffffffffffffffff1660009081526002602052604090205490565b6101af610344366004611c0a565b610b81565b34801561035557600080fd5b5061035e610d3b565b6040516101939796959493929190611ec8565b34801561037d57600080fd5b5045610189565b34801561039057600080fd5b50604051418152602001610193565b3480156103ab57600080fd5b506101af6103ba366004611e17565b610d9d565b6102766103cd366004611c0a565b610f4d565b6103e56103e0366004611f87565b610f6c565b005b6103e56103f5366004611d3f565b61109c565b34801561040657600080fd5b50610189610415366004611fde565b4090565b34801561042557600080fd5b5044610189565b60606000828067ffffffffffffffff81111561044a5761044a611ff7565b60405190808252806020026020018201604052801561049057816020015b6040805180820190915260008152606060208201528152602001906001900390816104685790505b5092503660005b828110156105f45760008582815181106104b3576104b3612026565b602002602001015190508787838181106104cf576104cf612026565b90506020028101906104e19190612055565b6040810135958601959093506104fa6020850185611eab565b73ffffffffffffffffffffffffffffffffffffffff168161051e6060870187612093565b33604051602001610531939291906120f8565b604080517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe08184030181529082905261056991612131565b60006040518083038185875af1925050503d80600081146105a6576040519150601f19603f3d011682016040523d82523d6000602084013e6105ab565b606091505b5060208085019190915290151583526105ca9060408601908601612143565b80156105d557508151155b156105ea576020808301518051909181908301fd5b5050600101610497565b5082341461063c576040517f70647f79000000000000000000000000000000000000000000000000000000008152600481018490523460248201526044015b60405180910390fd5b50505092915050565b60008060008061065485611129565b509250925092508280156106655750815b801561066e5750805b95945050505050565b436060828067ffffffffffffffff81111561069457610694611ff7565b6040519080825280602002602001820160405280156106c757816020015b60608152602001906001900390816106b25790505b5091503660005b828110156108145760008787838181106106ea576106ea612026565b90506020028101906106fc919061215e565b925061070b6020840184611eab565b73ffffffffffffffffffffffffffffffffffffffff1661072e6020850185612093565b33604051602001610741939291906120f8565b604080517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe08184030181529082905261077991612131565b6000604051808303816000865af19150503d80600081146107b6576040519150601f19603f3d011682016040523d82523d6000602084013e6107bb565b606091505b508684815181106107ce576107ce612026565b602090810291909101015290508061080b5760008583815181106107f4576107f4612026565b602002602001015190506000815190508060208301fd5b506001016106ce565b5050509250929050565b438040606061082e868686610d9d565b905093509350939050565b6060818067ffffffffffffffff81111561085557610855611ff7565b60405190808252806020026020018201604052801561089b57816020015b6040805180820190915260008152606060208201528152602001906001900390816108735790505b5091503660008060005b84811015610b245760008682815181106108c1576108c1612026565b602002602001015190508888838181106108dd576108dd612026565b90506020028101906108ef9190612192565b945088888381811061090357610903612026565b90506020028101906109159190612192565b6109239060400135856121f5565b935060008060008061093489611129565b93509350935093508380156109465750815b801561094f5750825b15610ad95773ffffffffffffffffffffffffffffffffffffffff81166000908152600260205260408120805460018101909155905061099460408b0160208c01611eab565b73ffffffffffffffffffffffffffffffffffffffff1660608b013560408c01356109c160a08e018e612093565b8e60000160208101906109d49190611eab565b6040516020016109e6939291906120f8565b604080517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe081840301815290829052610a1e91612131565b600060405180830381858888f193505050503d8060008114610a5c576040519150601f19603f3d011682016040523d82523d6000602084013e610a61565b606091505b50602088015215158652610a7a603f60608c0135612208565b5a1015610a8357fe5b855160408051838152911515602083015273ffffffffffffffffffffffffffffffffffffffff8416917f842fb24a83793558587a3dab2be7674da4a51d09c5542d6dd354e5d0ea70813c910160405180910390a2505b8451610b14578c8c87818110610af157610af1612026565b9050602002810190610b039190612192565b610b119060400135886121f5565b96505b85600101955050505050506108a5565b50348214610b67576040517f70647f7900000000000000000000000000000000000000000000000000000000815260048101839052346024820152604401610633565b8015610b7757610b7733826111c8565b5050505092915050565b6060818067ffffffffffffffff811115610b9d57610b9d611ff7565b604051908082528060200260200182016040528015610be357816020015b604080518082019091526000815260606020820152815260200190600190039081610bbb5790505b5091503660005b8281101561063c576000848281518110610c0657610c06612026565b60200260200101519050868683818110610c2257610c22612026565b9050602002810190610c349190612243565b9250610c436020840184611eab565b73ffffffffffffffffffffffffffffffffffffffff16610c666040850185612093565b33604051602001610c79939291906120f8565b604080517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe081840301815290829052610cb191612131565b6000604051808303816000865af19150503d8060008114610cee576040519150601f19603f3d011682016040523d82523d6000602084013e610cf3565b606091505b506020808401919091529015158252610d129060408501908501612143565b8015610d1d57508051155b15610d32576020808201518051909181908301fd5b50600101610bea565b600060608060008060006060610d4f6112a3565b610d576112d5565b604080516000808252602082019092527f0f000000000000000000000000000000000000000000000000000000000000009b939a50919850469750309650945092509050565b6060818067ffffffffffffffff811115610db957610db9611ff7565b604051908082528060200260200182016040528015610dff57816020015b604080518082019091526000815260606020820152815260200190600190039081610dd75790505b5091503660005b82811015610f43576000848281518110610e2257610e22612026565b60200260200101519050868683818110610e3e57610e3e612026565b9050602002810190610e50919061215e565b9250610e5f6020840184611eab565b73ffffffffffffffffffffffffffffffffffffffff16610e826020850185612093565b33604051602001610e95939291906120f8565b604080517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe081840301815290829052610ecd91612131565b6000604051808303816000865af19150503d8060008114610f0a576040519150601f19603f3d011682016040523d82523d6000602084013e610f0f565b606091505b50602083015215158152878015610f2557508051155b15610f3a576020808201518051909181908301fd5b50600101610e06565b5050509392505050565b6000806060610f5e6001868661081e565b919790965090945092505050565b73ffffffffffffffffffffffffffffffffffffffff811615600080805b8581101561104157868682818110610fa357610fa3612026565b9050602002810190610fb59190612192565b610fc39060400135846121f5565b92506000610ff4888884818110610fdc57610fdc612026565b9050602002810190610fee9190612192565b86611302565b9050806110305787878381811061100d5761100d612026565b905060200281019061101f9190612192565b61102d9060400135846121f5565b92505b5061103a81612277565b9050610f89565b50348214611084576040517f70647f7900000000000000000000000000000000000000000000000000000000815260048101839052346024820152604401610633565b80156110945761109484826111c8565b505050505050565b806040013534146110e557604080517f70647f79000000000000000000000000000000000000000000000000000000008152908201356004820152346024820152604401610633565b6110f0816001611302565b611126576040517f1425ea4200000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b50565b60008060008060008061113b87611563565b90925090506111586111536040890160208a01611eab565b6116e5565b4261116960a08a0160808b016122af565b65ffffffffffff1610158380156111b7575061118860208a018a611eab565b73ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff16145b919750955093509150509193509193565b80471015611204576040517fcd786059000000000000000000000000000000000000000000000000000000008152306004820152602401610633565b60008273ffffffffffffffffffffffffffffffffffffffff168260405160006040518083038185875af1925050503d806000811461125e576040519150601f19603f3d011682016040523d82523d6000602084013e611263565b606091505b505090508061129e576040517f1425ea4200000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b505050565b60606112d07f000000000000000000000000000000000000000000000000000000000000000060006117ae565b905090565b60606112d07f000000000000000000000000000000000000000000000000000000000000000060016117ae565b600080600080600061131387611129565b9350935093509350851561143e5783611387576113366040880160208901611eab565b6040517fd2650cd100000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff9091166004820152306024820152604401610633565b826113d95761139c60a08801608089016122af565b6040517f94eef58a00000000000000000000000000000000000000000000000000000000815265ffffffffffff9091166004820152602401610633565b8161143e57806113ec6020890189611eab565b6040517fc845a05600000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff928316600482015291166024820152604401610633565b8380156114485750815b80156114515750825b15610b775773ffffffffffffffffffffffffffffffffffffffff8116600090815260026020526040812080546001810190915590506060880135600061149d60408b0160208c01611eab565b905060408a013560006114b360a08d018d612093565b6114c060208f018f611eab565b6040516020016114d2939291906120f8565b6040516020818303038152906040529050600080600083516020850186888af19a505a9050611501818e61185b565b604080518781528c1515602082015273ffffffffffffffffffffffffffffffffffffffff8916917f842fb24a83793558587a3dab2be7674da4a51d09c5542d6dd354e5d0ea70813c910160405180910390a25050505050505050505092915050565b60008080806116bf61157860c0870187612093565b8080601f0160208091040260200160405190810160405280939291908181526020018383808284376000920191909152506116b992507f7f96328b83274ebc7c1cf4f7a3abda602b51a78b7fa1d86a2ce353d75e587cac91506115e0905060208a018a611eab565b6115f060408b0160208c01611eab565b60408b013560608c013561160a61030e60208f018f611eab565b8d608001602081019061161d91906122af565b8e8060a0019061162d9190612093565b60405161163b9291906122d7565b60408051918290038220602083019990995273ffffffffffffffffffffffffffffffffffffffff97881690820152959094166060860152608085019290925260a084015260c083015265ffffffffffff1660e08201526101008101919091526101200160405160208183030381529060405280519060200120611877565b906118bf565b50909250905060008160038111156116d9576116d96122e7565b14959194509092505050565b6040513060248201526000908190604401604080517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0818403018152919052602080820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff167f572b6c050000000000000000000000000000000000000000000000000000000017815282519293506000928392839290918391895afa92503d91506000519050828015611798575060208210155b80156117a45750600081115b9695505050505050565b606060ff83146117c8576117c18361190c565b9050611855565b8180546117d490612316565b80601f016020809104026020016040519081016040528092919081815260200182805461180090612316565b801561184d5780601f106118225761010080835404028352916020019161184d565b820191906000526020600020905b81548152906001019060200180831161183057829003601f168201915b505050505090505b92915050565b61186a603f6060830135612208565b82101561187357fe5b5050565b600061185561188461194b565b836040517f19010000000000000000000000000000000000000000000000000000000000008152600281019290925260228201526042902090565b600080600083516041036118f95760208401516040850151606086015160001a6118eb88828585611a83565b955095509550505050611905565b50508151600091506002905b9250925092565b6060600061191983611b7d565b604080516020808252818301909252919250600091906020820181803683375050509182525060208101929092525090565b60003073ffffffffffffffffffffffffffffffffffffffff7f0000000000000000000000000000000000000000000000000000000000000000161480156119b157507f000000000000000000000000000000000000000000000000000000000000000046145b156119db57507f000000000000000000000000000000000000000000000000000000000000000090565b6112d0604080517f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f60208201527f0000000000000000000000000000000000000000000000000000000000000000918101919091527f000000000000000000000000000000000000000000000000000000000000000060608201524660808201523060a082015260009060c00160405160208183030381529060405280519060200120905090565b600080807f7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a0841115611abe5750600091506003905082611b73565b604080516000808252602082018084528a905260ff891692820192909252606081018790526080810186905260019060a0016020604051602081039080840390855afa158015611b12573d6000803e3d6000fd5b50506040517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0015191505073ffffffffffffffffffffffffffffffffffffffff8116611b6957506000925060019150829050611b73565b9250600091508190505b9450945094915050565b600060ff8216601f811115611855576040517fb3512b0c00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b60008083601f840112611bd057600080fd5b50813567ffffffffffffffff811115611be857600080fd5b6020830191508360208260051b8501011115611c0357600080fd5b9250929050565b60008060208385031215611c1d57600080fd5b823567ffffffffffffffff811115611c3457600080fd5b611c4085828601611bbe565b90969095509350505050565b60005b83811015611c67578181015183820152602001611c4f565b50506000910152565b60008151808452611c88816020860160208601611c4c565b601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0169290920160200192915050565b600081518084526020808501808196508360051b8101915082860160005b85811015611d1857828403895281518051151585528501516040868601819052611d0481870183611c70565b9a87019a9550505090840190600101611cd8565b5091979650505050505050565b602081526000611d386020830184611cba565b9392505050565b600060208284031215611d5157600080fd5b813567ffffffffffffffff811115611d6857600080fd5b820160e08185031215611d3857600080fd5b600060408201848352602060408185015281855180845260608601915060608160051b870101935082870160005b82811015611df4577fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffa0888703018452611de2868351611c70565b95509284019290840190600101611da8565b509398975050505050505050565b80358015158114611e1257600080fd5b919050565b600080600060408486031215611e2c57600080fd5b611e3584611e02565b9250602084013567ffffffffffffffff811115611e5157600080fd5b611e5d86828701611bbe565b9497909650939450505050565b83815282602082015260606040820152600061066e6060830184611cba565b73ffffffffffffffffffffffffffffffffffffffff8116811461112657600080fd5b600060208284031215611ebd57600080fd5b8135611d3881611e89565b7fff00000000000000000000000000000000000000000000000000000000000000881681526000602060e081840152611f0460e084018a611c70565b8381036040850152611f16818a611c70565b6060850189905273ffffffffffffffffffffffffffffffffffffffff8816608086015260a0850187905284810360c0860152855180825283870192509083019060005b81811015611f7557835183529284019291840191600101611f59565b50909c9b505050505050505050505050565b600080600060408486031215611f9c57600080fd5b833567ffffffffffffffff811115611fb357600080fd5b611fbf86828701611bbe565b9094509250506020840135611fd381611e89565b809150509250925092565b600060208284031215611ff057600080fd5b5035919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b600082357fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8183360301811261208957600080fd5b9190910192915050565b60008083357fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe18436030181126120c857600080fd5b83018035915067ffffffffffffffff8211156120e357600080fd5b602001915036819003821315611c0357600080fd5b8284823760609190911b7fffffffffffffffffffffffffffffffffffffffff000000000000000000000000169101908152601401919050565b60008251612089818460208701611c4c565b60006020828403121561215557600080fd5b611d3882611e02565b600082357fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc183360301811261208957600080fd5b600082357fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff2183360301811261208957600080fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b80820180821115611855576118556121c6565b60008261223e577f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b500490565b600082357fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffa183360301811261208957600080fd5b60007fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82036122a8576122a86121c6565b5060010190565b6000602082840312156122c157600080fd5b813565ffffffffffff81168114611d3857600080fd5b8183823760009101908152919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b600181811c9082168061232a57607f821691505b602082108103612363577f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b5091905056fea26469706673582212209a055562ce1779f6afb471ad62f998e85900aa1041828478d742fbf81f114d9264736f6c63430008140033';

export const deployTxn = {
  to: '0x4e59b44847b379578588920ca78fbf26c0b4956c' as viem.Hex,
  data: ('0xa05e334153147e75f3f416139b5109d1179cb56fef6a4ecb4c4cbc92a7c37b70' + bytecode.split('0x')[1]) as viem.Hex,
};

export const deployAddress = '0xE2C5658cC5C448B48141168f3e475dF8f65A1e3e';
