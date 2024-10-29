'use client';

import Link from "next/link";
import useSWR from "swr";
import useSWRSubscription, { SWRSubscriptionOptions } from "swr/subscription";

import {
  Table,
  TableBody,
  TableHead,
  TableHeadCell,
  TableCell,
  TableRow
} from '../components/flowbite-components'
import { Asset, WalletAsset } from '../models';
import { fetcher } from '../utils';

export default function MyWallet(props: { wallet_id: string }) {
  const { data: walletAssets, error, mutate: mutateWalletAssets, } = useSWR<WalletAsset[]>(
    `http://localhost:3001/api/wallets/${props.wallet_id}/assets`,
    fetcher,
    {
      fallbackData: [],
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const { data: assetChanged } = useSWRSubscription(
    `http://localhost:3000/assets/events`,
    (path, { next }: SWRSubscriptionOptions) => {
      
      const eventSource = new EventSource(path);
      eventSource.addEventListener("asset-price-changed", async (event) => {
        const assetChanged: Asset = JSON.parse(event.data);
        await mutateWalletAssets((prev) => {
          const foundIndex = prev!.findIndex(
            (walletAsset) => walletAsset.asset_id === assetChanged.id
          );
          
          if (foundIndex !== -1) {
            prev![foundIndex].Asset.price = assetChanged.price;
          }
          return [...prev!];
        }, false);
        next(null, assetChanged);
      });
      eventSource.onerror = (event) => {
        console.error(event);
        eventSource.close();
      };
      return () => {
        eventSource.close();
      };
    },
    {}
  );

  const {data: walletAssetUpdated} = useSWRSubscription(
    `http://localhost:3000/wallets/${props.wallet_id}/assets/events`,
    (path, { next }: SWRSubscriptionOptions) => {
      const eventSource = new EventSource(path);

      eventSource.addEventListener("wallet-asset-updated", async (event) => {
        const walletAssetUpdated: WalletAsset = JSON.parse(event.data);
        await mutateWalletAssets((prev) => {
          const foundIndex = prev?.findIndex(
            (walletAsset) =>
              walletAsset.asset_id === walletAssetUpdated.asset_id
          );
          if (foundIndex !== -1) {
            prev![foundIndex!].shares = walletAssetUpdated.shares;
          }

          return [...prev!];
        }, false);
        next(null, walletAssetUpdated);
      });
      eventSource.onerror = (error) => {
        console.error(error);
        eventSource.close();
      };
      return () => {
        eventSource.close();
      };
    }
  );

  return (
    <Table>
      <TableHead>
        <TableHeadCell>Nome</TableHeadCell>
        <TableHeadCell>Preço R$</TableHeadCell>
        <TableHeadCell>Quant.</TableHeadCell>
        <TableHeadCell>
          <span className="sr-only">Comprar/Vender</span>
        </TableHeadCell>
      </TableHead>
      <TableBody className="divide-y">
        {walletAssets!.map((walletAsset, key) => (
          <TableRow className="border-gray-700 bg-gray-800" key={key}>
            <TableCell className="whitespace-nowrap font-medium text-white">
              {walletAsset.Asset.id} ({walletAsset.Asset.symbol})
            </TableCell>
            <TableCell>{walletAsset.Asset.price}</TableCell>
            <TableCell>{walletAsset.shares}</TableCell>
            <TableCell>
              <Link
                className="font-medium hover:underline text-cyan-500"
                href={`/${props.wallet_id}/home-broker/${walletAsset.Asset.id}`}
              >
                Comprar/Vender
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
