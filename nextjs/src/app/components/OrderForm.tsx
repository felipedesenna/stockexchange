import { revalidateTag } from "next/cache";
import { Label, TextInput, Button } from "../components/flowbite-components";

type OrderFormProps = {
  wallet_id: string;
  asset_id: string;
  type: "BUY" | "SELL";
}

async function initialTransaction(formData: FormData) {
  "use server";
  const shares = formData.get("shares");
  const price = formData.get("price");
  const wallet_id = formData.get("wallet_id");
  const asset_id = formData.get("asset_id");
  const type = formData.get("type");

  const response = await fetch(
    `http://host.docker.internal:3000/wallets/${wallet_id}/orders`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        shares,
        price,
        asset_id,
        type,
        status: "OPEN",
        Asset: {
          id: asset_id,
          symbol: "PETR4",
          price: 30,
        },
      }),
    }
  );
  revalidateTag(`orders-wallet-${wallet_id}`);
  return response.json();
}

export function OrderForm(props: OrderFormProps) {
  return (
    <div>
      <form action={initialTransaction}>
        <input name="asset_id" type="hidden" defaultValue={props.asset_id} />
        <input name="wallet_id" type="hidden" defaultValue={props.wallet_id} />
        <input name="type" type="hidden" defaultValue={"BUY"} />
        <div>
          <div className="mb-2 block">
            <Label htmlFor="shares" value="Quantidade" />
          </div>
          <TextInput
            id="shares"
            name="shares"
            required
            type="number"
            min={1}
            step={1}
            defaultValue={1}
          />
        </div>
        <br />
        <div>
          <div className="mb-2 block">
            <Label htmlFor="shares" value="Preço R$" />
          </div>
          <TextInput
            id="price"
            name="price"
            required
            type="number"
            min={1}
            step={1}
            defaultValue={1}
          />
        </div>
        <br />
        <Button type="submit" color={props.type === "BUY" ? "green" : "red"}>
          Confirmar {props.type === "BUY" ? "compra" : "venda"}
        </Button>
      </form>
    </div>
  )
}