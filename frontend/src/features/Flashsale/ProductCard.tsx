import React from "react"
import { Card } from "../../components/Card"
import { Badge, BadgeVariant } from "../../components/Badge"
import { ProductView } from "../Product"

type ProductCardProps = {
  disabled?: boolean
  productView: ProductView
}

export function ProductCard(props: Readonly<ProductCardProps>): React.JSX.Element {
  const {
    disabled = false,
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
        <Badge variant={disabled ? BadgeVariant.DISABLED : getStockBadgeVariant(productView)}>
          {productView.getFormatedStock()}
        </Badge>
      </div>
    </Card>
  )
}

function getStockBadgeVariant(productView: ProductView): BadgeVariant {
  if (!productView.hasStock()) {
    return BadgeVariant.DANGER
  } else if (productView.isRunningOut()) {
    return BadgeVariant.WARNING
  }
  return BadgeVariant.SUCCESS
}