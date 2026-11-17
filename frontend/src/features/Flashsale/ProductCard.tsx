import { Card } from "../../components/Card"
import { ProductView } from "../Product"

type ProductCardProps = {
  productView: ProductView
}

export function ProductCard(props: Readonly<ProductCardProps>): React.JSX.Element {
  const {
    productView,
  } = props

  return (
    <Card>
      <div className="w-full">
        <img
          src={productView.getThumbnailUrl()}
          alt={`thumbnail`}
          className="aspect-[4/3] w-full rounded-2xl object-cover"
        />
      </div>
      <div className="mt-2 flex flex-col gap-2">
        <h3 className="text-lg font-bold text-black">
          {productView.getProductName()}
        </h3>
        {
          productView.hasProductDescription() &&
          <p className="text-sm text-black">
            {productView.getProductDescription()}
          </p>
        }
      </div>
      <div className="mt-6 flex items-center justify-between">
        <span className="text-sm text-black">
          {productView.getFormatedPrice()}
        </span>
        <span className="text-sm text-black">
          {productView.getFormatedStock()}
        </span>
      </div>
    </Card>
  )
}