# The Names Protocol
And your address is...?

## Introduction
ENS is too complicated. 
Also I wanted to test implementing the [Outsider Protocol](https://outsider.nugget.network) in another project.
The Names Protocol does one thing and one thing only: resolve names to addresses and vice versa.

There are no waiting times, no auctions.

Just a simple claim button.

## How it works
Actually, it's pretty easy. 
Just use the [dApp](https://names.nugget.network) on the projects front page.
For a simple lookup you don't even need an Ethereum wallet.

### Claiming Names
A name is split into three parts: some arbitrary string, a `/`, and an index.
Users can only choose the first of the three, the index is calculated based on how many times the first string has already been claimed.
In practice, this means that multiple addresses can choose the string "Alice". The first resulting name will consequently be "Alice/0". The second address to choose "Alice" will be asigned "Alice/1" and so on...

It's also possible to change your name later on. There are a few caveats though: 

1) While the address will resolve to the new name and vice versa, the old name will always remain valid.

2) The more names are claimed, the higher the indecies become. 
This is inconvenient. 
As a disincentive, any name changes are subject to a small fee, which in turn supports further dApp development on my side ;).

>Note that choosing the first name is always free (+ tx fees, obviously).

### Lookup
Using either the web interface located [here](https://names.nugget.network) or by calling `names.resolveAddress(address)` / `names.resolveName(string)` through a smart contract or RPC, a lookup can be performed.

See [here](/src) for an example implementation.

## Resalability
Or actually the lack thereof. Claiming a name requires an any account to be externally owned (this is what Outsider is for). 
Anyone who has not yet registered with the Outsider Protocol will automatically be asked to sign a message, which is automatically relayed to the Outsider contract.

This means that a smart contract can never claim a name, thus making it impossible to sell ownership of a name without also transferring the private key.

>Another consequence is that a name in the Names Protocol cannot be recovered when the private key is lost.

## Where is it?
| Mainnet | not yet |
| ------- | ------- |
| Mumbai | [0x761772008F5eabE3B178E05a6f764A792F299B47](https://mumbai.polygonscan.com/address/0x761772008F5eabE3B178E05a6f764A792F299B47)  |

## Finally
Feel free to read through the code and learn from it. Don't deploy it for purposes other than testing code for yourself.

If you have any questions, it's probably best to contact me through [Twitter](https://twitter.com/SirSupersecret).