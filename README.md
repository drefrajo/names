# The Names Protocol
And your address is...?

## Introduction
ENS is too complicated. 
The Names Protocol does one thing and one thing only: resolve names to addresses and vice versa.

There are no complicated processes, no investment opportunities.

Just a simple claim button.

## How it works
Actually, it's pretty easy. 
Just use the [dApp](https://names.nugget.network) on the projects front page.
For a simple lookup you don't even need an Ethereum wallet.

### Claiming Names
A name is split into three parts: some arbitrary string, a `/`, and an index.
Users can only choose the first of the three, the index is calculated based on how many times the first string has already been claimed.
In practice, this means that multiple addresses can choose the string "Alice". The first resulting name will consequently be "Alice/0". The second address to choose "Alice" will be asigned "Alice/1" and so on...

It's also possible to change your name later on. There are a few things to note: 

1) While the address will resolve to the new name and vice versa, the old name will always remain valid.

2) The more names are claimed, the higher the indecies become.
This might make names less popular over time.

3) Once a name is changed, you can no longer go back to the exact name. 
This means that while you can choose the same string, the number will always be different.

>Note: Gasless claiming is also possible using `metaClaim(string, address, uint, bytes)`

### Lookup
Using either the web interface located [here](https://names.nugget.network) or by calling `names.resolveAddress(address)` / `names.resolveName(string)` through a smart contract or RPC, a lookup can be performed.

See [here](/src) for an example implementation.

## Resalability
Or actually the lack thereof. 
Once claimed, a name (e.g. "Bob/3") is forever locked to a single address.

Theoretically, another smart contract could be used to make ownership of an address resalable.
Practially though, this is not really useful.

>A consequence is that a name in the Names Protocol cannot be recovered when the private key is lost.

## Where is it?
|         | Mainnet | Mumbai Testnet |
| ------- | ------- | ------- |
| new contract | not yet | [0x702100b319EcAa1E2D61b11F9aBB4BA3F92C65D0](https://mumbai.polygonscan.com/address/0x702100b319EcAa1E2D61b11F9aBB4BA3F92C65D0) |
| old contract | never | [0x761772008F5eabE3B178E05a6f764A792F299B47](https://mumbai.polygonscan.com/address/0x761772008F5eabE3B178E05a6f764A792F299B47) |

## Finally
Feel free to read through the code and learn from it. 
Don't deploy it for purposes other than testing code for yourself.

If you have any questions, it's probably best to contact me through [Twitter](https://twitter.com/drefrajo).