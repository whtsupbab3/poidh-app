import imageCompression from 'browser-image-compression';
import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';

import { useGetChain } from '@/hooks/useGetChain';
import { buildMetadata, uploadFile, uploadMetadata } from '@/utils';
import { useAccount, useSwitchChain, useWriteContract } from 'wagmi';
import abi from '@/constant/abi/abi';
import Image from 'next/image';
import { useMutation } from '@tanstack/react-query';

import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Box,
} from '@mui/material';
import { decodeEventLog } from 'viem';
import { trpc, trpcClient } from '@/trpc/client';
import Loading from '@/components/global/Loading';

const LINK_IPFS = 'https://beige-impossible-dragon-883.mypinata.cloud/ipfs';

export default function FormClaim({
  bountyId,
  open,
  onClose,
}: {
  bountyId: string;
  open: boolean;
  onClose: () => void;
}) {
  const [preview, setPreview] = useState<string>('');
  const [imageURI, setImageURI] = useState<string>('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const utils = trpc.useUtils();

  const account = useAccount();
  const writeContract = useWriteContract({});
  const chain = useGetChain();
  const switchChain = useSwitchChain();

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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/heic': ['.heic'],
    },
  });

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const compressedFile = await compressImage(file);
      const cid = await retryUpload(compressedFile);
      setImageURI(`${LINK_IPFS}/${cid}`);
    } catch (error) {
      toast.error('Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const compressImage = async (image: File): Promise<File> => {
    const options = {
      maxSizeMB: 10,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };
    try {
      const compressedFile = await imageCompression(image, options);
      return compressedFile;
    } catch (error) {
      toast.error('Error compressing image');
      throw error;
    }
  };

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
        console.log(
          `Attempt ${attempt} failed, retrying in ${RETRY_DELAY}ms...`
        );
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
          const compressedFile = await compressImage(file);
          const cid = await retryUpload(compressedFile);
          setImageURI(`${LINK_IPFS}/${cid}`);
        } catch (error) {
          toast.error('Failed to upload image: ' + error);
        } finally {
          setUploading(false);
        }
      }
    };
    uploadImage();
  }, [file]);

  const createClaimMutations = useMutation({
    mutationFn: async (bountyId: bigint) => {
      const chainId = await account.connector?.getChainId();
      if (chain.id !== chainId) {
        await switchChain.switchChainAsync({ chainId: chain.id });
      }
      const metadata = buildMetadata(imageURI, name, description);
      const metadataResponse = await uploadMetadata(metadata);
      const uri = `${LINK_IPFS}/${metadataResponse.IpfsHash}`;
      const tx = await writeContract.writeContractAsync({
        abi,
        address: chain.contracts.mainContract as `0x${string}`,
        functionName: 'createClaim',
        args: [bountyId, name, uri, description],
      });

      setStatus('Waiting for receipt');
      const receipt = await chain.provider.waitForTransactionReceipt({
        hash: tx,
      });

      const log = receipt.logs
        .map((log) => {
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
        .find((log) => log?.eventName === 'ClaimCreated');

      if (!log) {
        throw new Error('No logs found');
      }

      if (log.eventName !== 'ClaimCreated') {
        throw new Error('Invalid event: ' + log.eventName);
      }

      const claimId = log.args.id.toString();

      for (let i = 0; i < 60; i++) {
        setStatus('Indexing ' + i + 's');
        const claim = await trpcClient.isClaimCreated.query({
          id: claimId,
          chainId: chain.id.toString(),
        });

        if (claim) {
          utils.bountyClaims.refetch();
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 1_000));
      }

      throw new Error('Failed to index bounty');
    },
    onSuccess: () => {
      toast.success('Claim created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create claim: ' + error.message);
    },
    onSettled: () => {
      setStatus('');
    },
  });

  return (
    <>
      <Loading open={createClaimMutations.isPending} status={status} />
      <Dialog
        open={!createClaimMutations.isPending && open}
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
            style={{
              border: '2px dashed #D1ECFF',
              padding: '20px',
              borderRadius: '30px',
              textAlign: 'center',
              cursor: imageURI ? 'default' : 'pointer',
              marginBottom: '10px',
              opacity: imageURI ? 0.5 : 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              height: '300px',
            }}
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
                width={200}
                height={200}
                style={{
                  marginTop: '10px',
                  borderRadius: '10px',
                  objectFit: 'contain',
                }}
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
            ></textarea>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              if (name && description && account.isConnected && imageURI) {
                createClaimMutations.mutate(BigInt(bountyId));
              } else {
                toast.error(
                  'Please fill in all fields, upload an image, and connect wallet'
                );
              }
            }}
            variant='contained'
            className='w-full rounded-full lowercase bg-[#F15E5F] hover:bg-red-400 text-white'
            disabled={
              account.isDisconnected ||
              !name ||
              !description ||
              uploading ||
              !imageURI
            }
          >
            {uploading ? <CircularProgress size={24} /> : 'Create Claim'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
