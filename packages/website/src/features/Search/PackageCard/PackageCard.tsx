import PackageNetworks from '@/features/Search/PackageNetworks';
import { GetPackagesQuery } from '@/types/graphql/graphql';
import { Box, Flex, Heading } from '@chakra-ui/react';
import { redirect } from 'next/navigation';
import { FC } from 'react';
import PublishInfo from './PublishInfo';

interface IPackageCardProps {
  pkg: GetPackagesQuery['packages'][0];
}

export const PackageCard: FC<IPackageCardProps> = ({ pkg }) => {
  return (
    <Box
      key={pkg.name}
      onClick={() => redirect(`/packages/${pkg.name}`)}
      p="6"
      bg="blue.975"
      display="block"
      borderWidth="1px"
      borderStyle="solid"
      borderColor="rgba(255,255,255,0.15)"
      mb="6"
      borderRadius="4px"
      _hover={{ bg: 'blue.950', borderColor: 'rgba(255,255,255,0.25)' }}
      transition="0.12s"
    >
      <Flex alignItems="['', 'center']" direction={['column', 'row']} mb="2">
        <Heading as="h4" size="md" mb={[1, 0]}>
          {pkg.name}
        </Heading>
        <Box ml={[0, 'auto']}>
          <PublishInfo p={pkg} />
        </Box>
      </Flex>
      <PackageNetworks p={pkg} />
    </Box>
  );
};
