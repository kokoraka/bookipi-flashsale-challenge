import { Button } from "../../components/Button"
import { Card } from "../../components/Card"
import { OrderView } from "../Order/Order"

type OrderCardProps = {
  orderView: OrderView
  onReorderClick?: () => void
}

export function OrderCard(props: Readonly<OrderCardProps>): React.JSX.Element {
  const {
    orderView,
    onReorderClick = () => { },
  } = props

  return (
    <Card>
      <div className="flex flex-col gap-6">
        <div className="mt-2 flex flex-col gap-2 justify-center items-center">
          <h3 className="text-lg font-bold text-black">
            Order Created
          </h3>
          <p className="text-sm text-black">
            Thank you for your order. <br />
            Happy to do business with you!
          </p>
        </div>
        <div className="mt-2 flex flex-col gap-2">
          <div>
            <p className="font-bold text-black">
              Order Reference:
            </p>
            <p className="text-sm text-black">
              {orderView.getOrderId()}
            </p>
          </div>
          <div>
            <p className="font-bold text-black">
              Order Date:
            </p>
            <p className="text-sm text-black">
              {orderView.getFormatedPlacedAt()}
            </p>
          </div>
          <div>
            <p className="font-bold text-black">
              Grand Total:
            </p>
            <p className="text-sm text-black">
              {orderView.getFormatedGrandTotal()}
            </p>
          </div>
          <div className="mt-2 flex flex-col gap-2">
            <Button onClick={() => {
              onReorderClick()
            }} >
              New Order
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}