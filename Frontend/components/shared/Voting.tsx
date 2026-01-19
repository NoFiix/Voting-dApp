'use client';

import { useState, useEffect } from "react";
import { AlertCircleIcon, CheckCircle2Icon, PopcornIcon, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { contractAbi, contractAddress } from "@/constants";
import { useReadContract, useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseAbiItem } from "viem";
import { publicClient } from "@/utils/client";


// utiliser Texterea de shadcn pour écrire les proposition 
// Toggle ou Toggle Group pour pouvoir voter !

const Voting = () => {
  
  const {data : hash, error, isPending, writeContract} = useWriteContract({  })
  const {isLoading, isSuccess, error: errorConfirmation } = useWaitForTransactionReceipt({
    hash 
  })

  const [voterAddress, setVoterAddress] = useState("") // Whitelist an Address
  const [inputAddressToGet, setInputAddressToGet] = useState<string | null>("") // Get Voter Info
  const [addressToQuery, setAddressToQuery] = useState<string | null> (null) // ou useState("")  
  const [voterProposition, setVoterProposition] = useState("");
  const [voterId, setVoterId] = useState<bigint | null>(null);
  const [voted, setVoted] = useState(false);

  const workflowLabels = [ 
        "RegisteringVoters",
        "ProposalsRegistrationStarted",
        "ProposalsRegistrationEnded",
        "VotingSessionStarted",
        "VotingSessionEnded",
        "VotesTallied"
        ]

  const { address } = useAccount();

  const addVoterAddress = async () => {
    writeContract({
      address : contractAddress,
      abi: contractAbi,
      functionName: 'addVoter',
      args: [voterAddress]
    })
  }
  
  // Get Voter 
  const {data: voterData, error: errorToGetVoter, isLoading: isLoadingVoterAddress, refetch: refetchGet
  } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'getVoter',
    args: [addressToQuery],
    query: {
      enabled: Boolean(addressToQuery),
      refetchOnMount: false,           // 👈 Ne pas refetch au montage du composant
      refetchOnReconnect: false,       // 👈 Ne pas refetch à la reconnexion
      gcTime: 0, 
    }
  }) as { 
    data: {
      isRegistered: boolean
      hasVoted: boolean
      votedProposalId: bigint
      }
      error: any
      isLoading: boolean
      refetch: any
    }

  // send a proposition
  const sendProposition = async() => {
    writeContract ({
      address: contractAddress,
      abi: contractAbi,
      functionName:'addProposal',
      args: [voterProposition],
    })
  }
  
  // Read all propositions
  const {data: propositionsData, error: propositionsError, isLoading: propositionsIsLoading, refetch: refetchPropositions
  } = useReadContract ({
    address: contractAddress,
    abi: contractAbi,
    functionName:'getProposals',
    enabled: false,
  }) as { data:
   {
    description: string
    voteCount: bigint
  }[] | undefined
   }
   
  // Voter pour une proposition en choisissant un ID
  const changeVoteCount = (id: bigint) => {
    writeContract ({
      address: contractAddress,
      abi: contractAbi,
      functionName: 'setVote',
      args: [id],
    })
  }

  // Who is the winner ?
  const {data: theWinnerId, error: winnerError, refetch: refetchWinner
    } = useReadContract ({
      address : contractAddress,
      abi: contractAbi,
      functionName : 'winningProposalID',
      enabled: false,
    }) 

  // Winner Proposition
  const {data: winnerProposition, error: winnerPropositionError, refetch: refetchWinnerProposition
    } = useReadContract ({
      address: contractAddress,
      abi: contractAbi,
      functionName: 'getOneProposal',
      args: [theWinnerId],
      enabled: false,
    }) as {data : {
    description: string
    voteCount: bigint
    }
  }

  // ---------- Workflow -----------------------------------------------------
  // -------------------------------------------------------------------------

  // ---------- Workflow changement ------------------------------------------
  const {data: workflowStatus, 
    error: workflowStatusError,
    isLoading: workflowStatusIsLoading,
    refetch: refetchWorkflowStatus
  } = useReadContract({
    address : contractAddress,
    abi : contractAbi, 
    functionName: 'workflowStatus',
  })

// ------------- Workflow State Changment ------------------------------------

  const workflowStatusChange = async () => {
    const status = Number(workflowStatus)
    
    if (status === 0) {
      await startProposalsRegistering()
    } else if (status === 1) {
      await endProposalsRegistering()
    } else if (status === 2) {
      await startVotingSession()
    } else if (status === 3) {
      await endVotingSession()
    } else if (status === 4) {
      await tallyVotes()
    }
  }

  const startProposalsRegistering = async() => {
    writeContract ({
      address: contractAddress,
      abi: contractAbi,
      functionName: 'startProposalsRegistering'
    })
  }

  const endProposalsRegistering = async() => {
    writeContract ({
      address: contractAddress,
      abi: contractAbi,
      functionName: 'endProposalsRegistering'
    })
  }

  const startVotingSession = async() => {
    writeContract ({
      address: contractAddress,
      abi: contractAbi,
      functionName: 'startVotingSession'
    })
  }

  const endVotingSession = async() => {
    writeContract ({
      address: contractAddress,
      abi: contractAbi,
      functionName: 'endVotingSession'
    })
  }

  const tallyVotes = async() => {
    writeContract ({
      address: contractAddress,
      abi: contractAbi,
      functionName: 'tallyVotes'
    })
  }

// ----------- useEffect -----------------------------------------------------
// ---------------------------------------------------------------------------

  // On vérifie le Workflow Status niveau console qu'on rentre dans la boucle
  useEffect(() => {
    if (workflowStatus) {
      toast.success("Workflow status updated BIIIIIS");
      }
    if(workflowStatusError) {
      toast.error(`Workflow status update error: ${workflowStatusError.shortMessage || workflowStatusError.message}`)
      }
  }, [workflowStatus, workflowStatusError, refetchWorkflowStatus])


  useEffect(() => {
    if (isSuccess) {
      toast.success("Transaction confirmed");
      refetchWorkflowStatus();
      refetchPropositions();
      if (workflowStatus === 4) {
        refetchWinner(); // On determine également le winner une fois ce workflowStatus choisit
        refetchWinnerProposition(); // On part chercher la proposition du winner
      }
    }
    if (isSuccess && voted) {
      toast.success("Your vote have been contabelized");
      setVoterAddress(false);
    }
    if (errorConfirmation) {
      toast.error(errorConfirmation.message)
    }
    if (errorConfirmation && voted) {
      toast.error(errorConfirmation.message)
      setVoterAddress(false);
    }

  }, [isSuccess, errorConfirmation, refetchPropositions, voted, refetchWorkflowStatus])


  useEffect(() => {
    console.log("la proposition envoyé est ", voterProposition)
  }, [voterProposition])


  useEffect(() => {
    console.log("voterData raw:", voterData)
  }, [voterData])


  useEffect(() => {
    console.log('les propositions :', {propositionsData});
  }, [propositionsData])


  useEffect(() => {
    if (propositionsError) {
      console.error("getProposals error:", propositionsError)
    }
  }, [propositionsError])

  
  return (
    <div className="flex flex-col w-full">

      <h2 className="mb-4 text-4xl">Get</h2>
      <div className="flex">
        what address you want to whitelist ? : <span className="font-bold"> 0x...</span>
      </div>
      <h2 className="mt-7 mb-4 text-4xl">Set whitelist address</h2>
      <div className="flex flex-col w-full">
        {hash &&  
          <Alert className ="mb-4 bg-lime-200">
            <CheckCircle2Icon/>
            <AlertTitle>Information</AlertTitle>
            <AlertDescription>
              Transaction hash: {hash}
            </AlertDescription>
          </Alert>
        }
        {isLoading && 
          <Alert className ="mb-4 bg-amber-200">
            <CheckCircle2Icon/>
            <AlertTitle>Information</AlertTitle>
            <AlertDescription>
              Waiting for confirmation...
            </AlertDescription>
          </Alert>
        }
        {isSuccess && 
          <Alert className ="mb-4 bg-lime-200">
            <CheckCircle2Icon/>
            <AlertTitle>Information</AlertTitle>
            <AlertDescription>
              Transaction confirmed
            </AlertDescription>
          </Alert>
        }
        {errorConfirmation &&
          <Alert className ="mb-4 bg-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Information</AlertTitle>
            <AlertDescription>
              {errorConfirmation?.cause?.reason ||
              errorConfirmation?.data?.message ||
              errorConfirmation?.shortMessage ||
              errorConfirmation?.message}
            </AlertDescription>
          </Alert>
        }
        {error && 
          <Alert className ="mb-4 bg-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Information</AlertTitle>
            <AlertDescription>
              {error.shortMessage || error.message}
            </AlertDescription>
          </Alert>
        }
      </div>
      <div className="flex">
        <Input placeholder="Address to whitelist :" onChange={(e) => setVoterAddress(e.target.value)}/>
        <Button variant="outline" disabled={isPending} onClick={addVoterAddress}>
          {isPending ? 'Setting...' : 'Set'} </Button>
      </div>

      <h2 className="mt-7 mb-4 text-4xl">Get whitelist address</h2>
      <div className="flex flex-col w-full">
        {voterData && (
          <Alert className ="mb-4 bg-lime-200">
            <CheckCircle2Icon/>
            <AlertTitle>Information</AlertTitle>
            <AlertDescription>
              Voter data succesfully gotten
            </AlertDescription>
          </Alert>
        )}
        {errorToGetVoter && (
          <Alert className ="mb-4 bg-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Information "GetVoter Error"</AlertTitle>
            <AlertDescription>
              {errorToGetVoter.shortMessage || errorToGetVoter.message}
            </AlertDescription>
          </Alert>
        )}
        <div className ="flex">
          <Input placeholder="Address info to check :" //value={inputAddressToGet}
          onChange={(e) => {setInputAddressToGet(e.target.value)
          }} />
          <Button variant="outline" onClick={() => {setAddressToQuery(inputAddressToGet)}}>
            {isLoadingVoterAddress ? 'Loading...' : 'Get'}
          </Button>
        </div>
        
        {voterData && (
          <div className="flex flex-col w-full ml-20 mt-3">
            <p>Registered: {voterData?.isRegistered ? "Yes" : "No"}</p>
            <p>Has Voted: {voterData?.hasVoted ? "Yes" : "No"}</p>
            <p>Proposal Id: {voterData?.votedProposalId?.toString()}</p>
          </div>
        )}
      </div>
      
      
      <h2 className="mb-4 mt-7 text-4xl">Worlkflow Status Changement</h2>
      <div className="flex gap-4 items-center">
        <p> The actual Workflow status is at: 
          {workflowStatus !== undefined && workflowLabels[Number(workflowStatus)]} </p>
        <Button variant="outline"
          onClick = {() => {
            workflowStatusChange()
          }}>
          Next workflowStatus
        </Button>

      </div>

      <h2 className="mt-7 mb-4 text-4xl">Proposal registration</h2>
      
      <div className="flex flex-col w-full">
        <div className="flex">
          <Input placeholder = "Write your proposition :"
          onChange={(e) => setVoterProposition(e.target.value)}/>
          <Button variant="outline" onClick={ () => {sendProposition()}}>
            {"Validate"}
          </Button>
        </div>
      </div>
      
      <h2 className="mt-7 mb-4 text-4xl">Voter</h2>
      <div className ="flex">
        <Input placeholder="Choose the the proposition ID you are voting for :"
          onChange={(e) => {
            const value = e.target.value
            setVoterId(value === "" ? null : BigInt(value))
          }}/>
        <Button variant="outline" onClick={() => {
          if (voterId !== null) {
            changeVoteCount(voterId)
            setVoted(true)
          }
        }}>
          {isLoading? "Loading..." : "Vote"}
        </Button>
      </div>
      
      <h2 className="mt-7 mb-4 text-4xl">Propositions below</h2>
      <div className="flex flex-col w-full">
        {propositionsData?.length === 0 && (
          <p>No proposition has been submitted for the moment</p>
        )}
        {propositionsIsLoading && <p>Loading proposals...</p>}
        {propositionsError && <p>Error loading proposals</p>}
        <div className="flex flex-col gap-4">
          {propositionsData?.map((proposal, index) => (
            <div key={index} className="rounded border p-4">
              <h3 className="font-bold">Proposal #{index}</h3>
              <p>{proposal.description}</p>
              <p>Votes: {proposal.voteCount.toString()}</p>
            </div>
          ))}
        </div>
      </div>

      <h2 className='mt-7 mb-3 text-4xl'>Winner</h2>
      <h2 className='mt-7 mb-3 text-4xl'>
        {theWinnerId ? `The winner is #${theWinnerId}` : "No winner for now"}
      </h2>
      {theWinnerId ? (
        <>
          <p>Proposal: {winnerProposition?.description}</p>
          <p>Votes: {winnerProposition?.voteCount.toString()}</p>
        </>
       ) : (
        <p>No winner for the moment</p>
      )}
      
    </div>
  )
}

export default Voting