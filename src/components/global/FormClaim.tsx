import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { decodeEventLog, getAddress, encodeFunctionData } from 'viem';
import Image from 'next/image';
import { Dialog, DialogContent, DialogActions, Box } from '@mui/material';
import { trpc, trpcClient } from '@/trpc/client';
import Loading from '@/components/global/Loading';
import GameButton from '@/components/global/GameButton';
import ButtonCTA from '@/components/ui/ButtonCTA';
import { buildMetadata, cn, uploadFile, uploadMetadata } from '@/utils';
import abi from '@/constant/abi/abi';

const LINK_IPFS = 'https://beige-impossible-dragon-883.mypinata.cloud/ipfs';

export default function FormClaim({
  bountyId,
  open,
  onClose,
  contractAddress,
  chainId,
}: {
  bountyId: string;
  open: boolean;
  onClose: () => void;
  contractAddress: string;
  chainId: number;
}) {
  const [preview, setPreview] = useState<string>('');
  const [imageURI, setImageURI] = useState<string>('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [account, setAccount] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const utils = trpc.useUtils();

  useEffect(() => {
    const connectWallet = async () => {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        setAccount(getAddress(accounts[0]));
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    };
    connectWallet();
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setFile(file);
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target?.result) {
        setPreview(e.target.result.toString());
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const retryUpload = async (file: File): Promise<string> => {
    const MAX_RETRIES = 6;
    const RETRY_DELAY = 3000;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const cid = await uploadFile(file);
        return cid.IpfsHash;
      } catch (error) {
        if (attempt === MAX_RETRIES) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      }
    }
    throw new Error('All attempts failed');
  };

  useEffect(() => {
    const uploadImage = async () => {
      if (file) {
        setUploading(true);
        try {
          const cid = await retryUpload(file);
          setImageURI(`${LINK_IPFS}/${cid}`);
        } catch (error) {
          console.error('Error uploading file:', error);
          toast.error('Error uploading file');
        }
        setUploading(false);
      }
    };
    uploadImage();
  }, [file]);

  const createClaim = async () => {
    try {
      const currentChainId = await window.ethereum.request({
        method: 'eth_chainId',
      });

      if (parseInt(currentChainId, 16) !== chainId) {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${chainId.toString(16)}` }],
        });
      }

      const metadata = buildMetadata(imageURI, name, description);
      const metadataResponse = await uploadMetadata(metadata);
      const uri = `${LINK_IPFS}/${metadataResponse.IpfsHash}`;

      const data = encodeFunctionData({
        abi,
        functionName: 'createClaim',
        args: [BigInt(bountyId), name, uri, description],
      });

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: account,
            to: contractAddress,
            data,
          },
        ],
      });

      setStatus('Waiting for receipt');

      // Wait for transaction confirmation
      let receipt;
      while (!receipt) {
        receipt = await window.ethereum.request({
          method: 'eth_getTransactionReceipt',
          params: [txHash],
        });
        if (!receipt) await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      const log = receipt.logs
        .map((log: { data: any; topics: any }) => {
          try {
            return decodeEventLog({
              abi,
              data: log.data,
              topics: log.topics,
            });
          } catch (e) {
            return null;
          }
        })
        .find(
          (log: { eventName: string }) => log?.eventName === 'ClaimCreated'
        );

      if (!log || log.eventName !== 'ClaimCreated') {
        throw new Error('Claim creation event not found');
      }

      const claimId = log.args.id.toString();

      // Wait for indexing
      for (let i = 0; i < 60; i++) {
        setStatus(`Indexing ${i}s`);
        const claim = await trpcClient.isClaimCreated.query({
          id: Number(claimId),
          chainId,
        });
        if (claim) {
          toast.success('Claim created successfully');
          utils.bountyClaims.refetch();
          resetForm();
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      throw new Error('Failed to index claim');
    } catch (error) {
      console.error('Error creating claim:', error);
      toast.error(`Failed to create claim: ${error}`);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setImageURI('');
    setPreview('');
    onClose();
  };

  return (
    <>
      <Loading open={status !== ''} status={status} />
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth='xs'
        PaperProps={{
          className: 'bg-poidhBlue/80',
          style: {
            borderRadius: '10px',
            color: 'white',
            border: '1px solid #D1ECFF',
          },
        }}
      >
        <DialogContent>
          <div
            {...getRootProps()}
            className='flex items-center flex-col text-left text-white rounded-[30px] border border-[#D1ECFF] border-dashed p-5 w-full lg:min-w-[400px] justify-center cursor-pointer'
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the image here...</p>
            ) : (
              <p>
                {imageURI
                  ? 'Image uploaded'
                  : 'Drag & drop or click to upload an image'}
              </p>
            )}
            {preview && (
              <Image
                src={preview}
                alt='Preview'
                className='w-[300px] h-[300px] mt-2 rounded-md object-contain'
              />
            )}
          </div>
          <Box mt={2} mb={-3}>
            <span>title</span>
            <input
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='border bg-transparent border-[#D1ECFF] py-2 px-2 rounded-md mb-4 w-full'
            />
            <span>description</span>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className='border bg-transparent border-[#D1ECFF] py-2 px-2 rounded-md mb-4 w-full'
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <button
            className={cn(
              'flex flex-row items-center justify-center',
              !account && 'opacity-50 cursor-not-allowed'
            )}
            onClick={() => {
              if (name && description && imageURI && !uploading && account) {
                createClaim();
              } else {
                toast.error('Please fill in all fields and connect wallet');
              }
            }}
          >
            <div className='button'>
              <GameButton />
            </div>
            <ButtonCTA>create claim</ButtonCTA>
          </button>
        </DialogActions>
      </Dialog>
    </>
  );
}
