# Voting Smart Contract 🗳️

Ce projet est un smart contract de système de vote écrit en Solidity.  
Il respecte un workflow strict : enregistrement des votants, ajout des propositions, votes, puis décompte final.

---

## 📌 Fonctionnalités du contrat

- Ajout des votants par l’owner
- Ajout des propositions par les votants enregistrés
- Gestion du status du workflow :
  1️⃣ RegisteringVoters  
  2️⃣ ProposalsRegistrationStarted  
  3️⃣ ProposalsRegistrationEnded  
  4️⃣ VotingSessionStarted  
  5️⃣ VotingSessionEnded  
  6️⃣ VotesTallied
- Vote unique → 1 votant = 1 vote
- Calcul automatique de la proposition gagnante


| Étape                         | Description
|-------------------------------|-------------
| RegisteringVoters             | Ajout des votants
| ProposalsRegistrationStarted  | Ajout des propositions autorisé
| ProposalsRegistrationEnded    | Clôture des propositions
| VotingSessionStarted          | Phase de vote
| VotingSessionEnded            | Fin des votes
| VotesTallied                  | Décompte terminé


---


## 📂 Structure du projet
/contracts
└─ Voting.sol
└─ Voting.t.sol
/test
└─ voting.test.js # Tests Hardhat / JavaScript
/test/VotingTest.sol # Tests Solidity
hardhat.config.js
package.json
README.md


---


## 🧪 Tests & Qualité du projet
### Test Solidity

Avant de réaliser les tests en JavaScript avec Hardhat, certains tests ont été écrits en Solidity pour comprendre comment ça marche et m'entraîner aussi sur ce type de rédaction.

Ces tests vérifient principalement :

✔ L’état initial du workflowStatus
✔ Les transitions correctes entre tous les états du vote :
    - RegisteringVoters
    - ProposalsRegistrationStarted
    - ProposalsRegistrationEnded
    - VotingSessionStarted
    - VotingSessionEnded
    - VotesTallied
✔ La création automatique de la proposition "GENESIS" lors de l’ouverture des propositions
✔ Les restrictions sur l’ajout des votants :
    - addVoter ne fonctionne que dans l’état RegisteringVoters
    - Impossible d’ajouter deux fois la même adresse

Ces tests Solidity ont été réalisés dans le fichier : contracts/Voting.t.sol

Nombre total de tests :**9**, tous **passés avec succès** ✔

### Tests Hardhat + Chai (JavaScript)

Les tests sont divisés de la même manière que dans le script principal et couvrent :
✔ Déploiement  
✔ Ajout des votants + droits d’accès  
✔ Ajout des propositions 
✔ Restrictions basées sur `workflowStatus`   
✔ Système de vote (unicité + comptage)  
✔ Comptage des voix et détection du gagnant  
✔ Gestion des accès (`onlyOwner`, `onlyVoters`)
✔ Émission correcte des events

Nombre total de tests : **26**, tous **passés avec succès** ✔

Pour exécuter les tests :
```bash
npx hardhat test



# ---------------------------------------------------------------------------------------
# ---------------------------------------------------------------------------------------


# Sample Hardhat 3 Beta Project (`mocha` and `ethers`)

This project showcases a Hardhat 3 Beta project using `mocha` for tests and the `ethers` library for Ethereum interactions.

To learn more about the Hardhat 3 Beta, please visit the [Getting Started guide](https://hardhat.org/docs/getting-started#getting-started-with-hardhat-3). To share your feedback, join our [Hardhat 3 Beta](https://hardhat.org/hardhat3-beta-telegram-group) Telegram group or [open an issue](https://github.com/NomicFoundation/hardhat/issues/new) in our GitHub issue tracker.

## Project Overview

This example project includes:

- A simple Hardhat configuration file.
- Foundry-compatible Solidity unit tests.
- TypeScript integration tests using `mocha` and ethers.js
- Examples demonstrating how to connect to different types of networks, including locally simulating OP mainnet.

## Usage

### Running Tests

To run all the tests in the project, execute the following command:

```shell
npx hardhat test
```

You can also selectively run the Solidity or `mocha` tests:

```shell
npx hardhat test solidity
npx hardhat test mocha
```

### Make a deployment to Sepolia

This project includes an example Ignition module to deploy the contract. You can deploy this module to a locally simulated chain or to Sepolia.

To run the deployment to a local chain:

```shell
npx hardhat ignition deploy ignition/modules/Counter.ts
```

To run the deployment to Sepolia, you need an account with funds to send the transaction. The provided Hardhat configuration includes a Configuration Variable called `SEPOLIA_PRIVATE_KEY`, which you can use to set the private key of the account you want to use.

You can set the `SEPOLIA_PRIVATE_KEY` variable using the `hardhat-keystore` plugin or by setting it as an environment variable.

To set the `SEPOLIA_PRIVATE_KEY` config variable using `hardhat-keystore`:

```shell
npx hardhat keystore set SEPOLIA_PRIVATE_KEY
```

After setting the variable, you can run the deployment with the Sepolia network:

```shell
npx hardhat ignition deploy --network sepolia ignition/modules/Counter.ts
```
