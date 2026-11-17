import * as React from "react"
import { FaRegFrown } from "react-icons/fa";
import { Button } from "../components/Button"
import { Container } from "../components/Container"
import { Card } from "../components/Card"
import { useConfig } from "../components/Config"
import { Meta } from "../components/Meta"
import { Spinner } from "../components/Spinner"
import { PromotionState, PromotionView } from "../features/Promotion"
import { useGetFlashsalePromotionById, useGetFlashsaleProductById } from "../services/react"
import { ProductView } from "../features/Product"
import { ProductCard, PromotionAlert } from "../features/Flashsale";

export default function Home(): React.JSX.Element {
  const config = useConfig()
  const promotionId = config.getString('VITE_PROMOTION_ID')
  const productId = config.getString('VITE_PRODUCT_ID')

  const {
    data: promotionData,
    isError: isGetPromotionError,
    isPending: isGetPromotionPending,
    execute: getPromotion
  } = useGetFlashsalePromotionById()

  const {
    data: productData,
    isPending: isGetProductPending,
    execute: getProduct
  } = useGetFlashsaleProductById()

  React.useEffect(() => {
    if (!promotionId) {
      return
    }

    getPromotion([promotionId])
    getProduct([productId])
  }, [
    promotionId, getPromotion,
    productId, getProduct
  ])

  const promotionView = React.useMemo<PromotionView | undefined>(() => {
    if (!promotionData) {
      return undefined
    }

    return new PromotionView({
      unique_id: promotionData.promotion.unique_id,
      start_at: new Date(promotionData.promotion.start_at),
      end_at: new Date(promotionData.promotion.end_at),
      state: promotionData.promotion_state as PromotionState,
    })
  }, [promotionData])

  const productView = React.useMemo<ProductView | undefined>(() => {
    if (!productData) {
      return undefined
    }

    return new ProductView({
      unique_id: productData.product.unique_id,
      name: productData.product.name,
      description: productData.product.description,
      unit_price: Number(productData.product.selling_price),
      available_quantity: Number(productData.inventory.estimate_available_quantity),
      thumbnail_url: productData.product.thumbnail?.file.public_url,
    })
  }, [productData])

  return (
    <>
      <Meta>
        {{
          title: "Order",
        }}
      </Meta>

      <Container size="md">
        <section className="w-full h-screen bg-gray-100 px-4 py-8">
          <div className="w-full max-w-2xl mx-auto">
            <div className="grid grid-cols-12">
              <div className="col-span-12">
                <div className="flex flex-col gap-2">
                  <h1 className="font-bold text-3xl">
                    Flashsale Order
                  </h1>
                  <div className="border-dashed border-b-2 border-black" />
                </div>
              </div>
              <div className="col-span-12">
                <PromotionAlert
                  isPending={isGetPromotionPending}
                  isError={isGetPromotionError}
                  promotionView={promotionView}
                  retry={() => {
                    getPromotion([promotionId])
                  }}
                />
              </div>
              {
                promotionView &&
                <div className="col-span-12">
                  <div className="w-full h-full rounded border-dashed border-1 border-black p-2">
                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-12 sm:col-span-5">
                        {
                          productView ?
                            <ProductCard
                              productView={productView}
                            />
                            :
                            <Card>
                              <div className="flex flex-col gap-2 min-h-[200px]">
                                {
                                  isGetProductPending ?
                                    <div className="py-10">
                                      <Spinner size="sm" label="Loading product..." labeled />
                                    </div>
                                    :
                                    <>
                                      <div className="flex justify-center items-center">
                                        <FaRegFrown className="w-16 h-16" />
                                      </div>
                                      <div className="mt-2 flex flex-col gap-2 justify-center items-center">
                                        <h3 className="text-center text-lg font-bold text-black">
                                          Something happened
                                        </h3>
                                        <p className="text-center text-sm text-black">
                                          Unable to load product information
                                        </p>
                                      </div>
                                      <Button appendClassNames="w-full"
                                        onClick={() => {
                                          getProduct([productId])
                                        }}>
                                        Retry
                                      </Button>
                                    </>
                                }
                              </div>
                            </Card>
                        }
                      </div>
                      <div className="col-span-12 sm:col-span-7">
                        TODO: add form
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        </section>
      </Container>
    </>
  )
}