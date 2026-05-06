# Voting Smart Contract 🗳️

Ce projet est un smart contract de système de vote écrit en Solidity.  
Il respecte un workflow strict : enregistrement des votants, ajout des propositions, votes, puis décompte final.

[Solidity voting contract with proposition-based state machine and role-based access · Sepolia · Next.js + wagmi + RainbowKit]

---

## 🔗 Links

🎥 Frontend Demo video 
👉 https://youtu.be/XzrV1JNg3DE

🌍 Public Deploiement of the dApp  
👉 https://voting-d-app-3cxc.vercel.app/

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
