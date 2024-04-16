import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Address } from 'viem';

const NoSSR = dynamic(() => import('@/features/Packages/CodePage'), {
  ssr: false,
});

export const metadata: Metadata = {
  title: 'Cannon | Package | Code',
  description: 'Package | Code',
  openGraph: {
    title: 'Cannon | Package | Code',
    description: 'Package',
    url: 'https://usecannon.com',
    siteName: 'Cannon',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://usecannon.com/images/og.png',
      },
    ],
  },
};

export default function Interact({
  params,
}: {
  params: {
    name: string;
    tag: string;
    variant: string;
    moduleName: string;
    contractName: string;
    contractAddress: string;
  };
}) {
  return (
    <NoSSR
      name={decodeURIComponent(params.name)}
      tag={decodeURIComponent(params.tag)}
      variant={decodeURIComponent(params.variant)}
      moduleName={decodeURIComponent(params.moduleName)}
      contractAddress={decodeURIComponent(params.contractAddress) as Address}
    />
  );
}
