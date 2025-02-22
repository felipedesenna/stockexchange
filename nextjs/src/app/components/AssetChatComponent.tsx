"use client";

import { MutableRefObject, useRef } from "react";
import { AssetDaily } from "../models";
import { fetcher } from "../utils";
import { ChartComponent, ChartComponentRef } from "./ChartComponent";
import useSWR from "swr";
import useSWRSubscription, { SWRSubscriptionOptions } from "swr/subscription";
import { Time } from 'lightweight-charts';

export const AssetChartComponent = (props: { asset_id: string }) => {
  const chartRef = useRef() as MutableRefObject<ChartComponentRef>;
  const { data: asset, mutate } = useSWR(
    `http://localhost:3000/assets/${props.asset_id}`,
    fetcher,
    {
      fallbackData: { id: props.asset_id, price: 0 },
    }
  );

  const { data: assetDaily } = useSWRSubscription(
    `http://localhost:3000/assets/${props.asset_id}/daily/events`,
    (path, { next }: SWRSubscriptionOptions) => {
      const eventSource = new EventSource(path);
      eventSource.addEventListener("asset-daily-created", async (event) => {
        const assetDailyCreated: AssetDaily = JSON.parse(event.data);
        chartRef.current.update({
          time: new Date(assetDailyCreated.date).getTime() as Time,
          value: assetDailyCreated.price,
        });
        await mutate(
          { id: assetDailyCreated.id, price: assetDailyCreated.price },
          false
        );
        next(null, assetDailyCreated);
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

  return (
    <ChartComponent
      header={`${props.asset_id} - R$ ${asset.price}`}
      ref={chartRef}
    />
  );
};